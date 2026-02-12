import Image from "next/image";

const Page = () => {
  return (
    <div className="flex gap-1 max-w-[100vw] px-11 pt-17 bg-background">
      {/* Contenedor relativo para controlar el tamaño */}
      <div className="mx-auto relative h-7 w-24 border-b border-border">
        {/* <Image
          src="https://cdn.builder.io/api/v1/image/assets%2Fd96fe6595243498081d815fe03062cfa%2F0f04b37284dc4023bf0b9354b91b1b54?format=webp"
          alt="Descripción de la imagen"
          fill // Llena el contenedor padre
          className="object-contain" // Ajusta sin deformar
        /> */}
      </div>
      <div>hola</div>
      <div>hola</div>
    </div>
  );
};

export default Page;
