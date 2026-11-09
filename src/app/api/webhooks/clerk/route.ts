import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { deleteUserCascade, ensureSanityUser } from "@/lib/clerk-sync";

// Esta función maneja las peticiones POST que envía Clerk
export async function POST(req: Request) {
  // 1. Obtener el secreto del Dashboard de Clerk (lo haremos en el paso 4.4)
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Falta CLERK_WEBHOOK_SECRET");
    return new Response("Webhook no configurado", { status: 500 });
  }

  // 2. Verificar los headers de Svix
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si no hay headers, error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // 3. Obtener el cuerpo (body) y verificar firma
  // El cuerpo CRUDO: la firma se calcula sobre el texto exacto (re-serializar el JSON la rompe)
  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // 4. Procesar el evento
  const eventType = evt.type;

  const writeClient = client.withConfig({
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  try {
    // Usuario creado o actualizado en Clerk -> upsert en Sanity (idempotente)
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      await ensureSanityUser(writeClient, {
        id,
        firstName: first_name,
        lastName: last_name,
        email: email_addresses?.[0]?.email_address,
      });
    }

    // Cuenta eliminada en Clerk -> se borran sus datos y los de sus cadetes
    if (eventType === "user.deleted" && evt.data.id) {
      await deleteUserCascade(writeClient, evt.data.id);
    }
  } catch (error) {
    console.error(`Error procesando ${eventType}:`, error);
    return new Response("Error sincronizando con Sanity", { status: 500 });
  }

  return new Response("", { status: 200 });
}
