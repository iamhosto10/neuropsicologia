import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

// Esta función maneja las peticiones POST que envía Clerk
export async function POST(req: Request) {
  // 1. Obtener el secreto del Dashboard de Clerk (lo haremos en el paso 4.4)
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
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
  const payload = await req.json();
  const body = JSON.stringify(payload);
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

  // SI UN USUARIO SE CREA EN CLERK...
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name =
      `${first_name || ""} ${last_name || ""}`.trim() || "Nuevo Usuario";

    // Usamos el cliente de Sanity con el Token de Escritura
    // client ya viene de tu lib, le inyectamos el token
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
    });

    // Creamos el usuario en Sanity
    try {
      await writeClient.createIfNotExists({
        _id: `user-${id}`, // Usamos el ID de Clerk para que sea único
        _type: "user",
        name: name,
        clerkId: id,
        email: email,
        image: {
          // Opcional: si quieres guardar la imagen de Clerk
          _type: "image",
          asset: undefined,
          // Nota: guardar la imagen externa requiere otro paso,
          // por ahora dejémoslo simple
        },
        role: "free",
        slug: {
          _type: "slug",
          current: name.toLowerCase().replace(/\s+/g, "-").slice(0, 96),
        },
      });
      console.log(`Usuario creado en Sanity: ${id}`);
    } catch (error) {
      console.error("Error creando usuario en Sanity:", error);
      return new Response("Error creating user in Sanity", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}
