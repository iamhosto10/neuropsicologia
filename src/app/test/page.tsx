import InlineGameWrapper from "@/components/lesson-detail/inline-game-wrapper";

const Page = () => {
  return (
    <div className="flex flex-col gap-1 max-w-4xl px-11 pt-17 mx-auto bg-background">
      {/* Contenedor relativo para controlar el tamaño */}
      <h1 className="text-4xl font-bold text-primary mb-4">
        Página para testear los juegos en distintas dificultades
      </h1>
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        Limpieza Espacial (Atención Selectiva)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>
      <InlineGameWrapper
        value={{
          gameType: "cleanup",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>
      <InlineGameWrapper
        value={{
          gameType: "cleanup",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>
      <InlineGameWrapper
        value={{
          gameType: "cleanup",
          difficulty: "hard",
        }}
      />
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Centinela Satélite (Atención Sostenida)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>

      <InlineGameWrapper
        value={{
          gameType: "satellite",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "satellite",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "satellite",
          difficulty: "hard",
        }}
      />
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Campo de Asteroides (Control Inhibitorio)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>

      <InlineGameWrapper
        value={{
          gameType: "asteroid",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "asteroid",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "asteroid",
          difficulty: "hard",
        }}
      />
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Comunicador Inverso (Flexibilidad)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>
      <InlineGameWrapper
        value={{
          gameType: "reverse",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "reverse",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "reverse",
          difficulty: "hard",
        }}
      />

      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Panel de Seguridad (Memoria Visoespacial)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>
      <InlineGameWrapper
        value={{
          gameType: "memori",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "memori",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "memori",
          difficulty: "hard",
        }}
      />
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Gran Evasión (Multitarea y Atención Dividida)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>
      <InlineGameWrapper
        value={{
          gameType: "multitask",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "multitask",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "multitask",
          difficulty: "hard",
        }}
      />
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Laboratorio de Carga (Memoria N-Back)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>
      <InlineGameWrapper
        value={{
          gameType: "cargo_n_back",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "cargo_n_back",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "cargo_n_back",
          difficulty: "hard",
        }}
      />
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Tormenta de Nebulosa (Control de Interferencia)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>
      <InlineGameWrapper
        value={{
          gameType: "nebula_storm",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "nebula_storm",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "nebula_storm",
          difficulty: "hard",
        }}
      />
      <h2 className="text-2xl font-semibold text-blue-500 border-b pb-1">
        {" "}
        Decodificador de Señales (Velocidad Procesamiento)
      </h2>
      <h3 className="text-lg font-medium text-green-500">Facil</h3>
      <InlineGameWrapper
        value={{
          gameType: "signal_decoder",
          difficulty: "easy",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Medio</h3>

      <InlineGameWrapper
        value={{
          gameType: "signal_decoder",
          difficulty: "medium",
        }}
      />
      <h3 className="text-lg font-medium text-green-500">Dificil</h3>

      <InlineGameWrapper
        value={{
          gameType: "signal_decoder",
          difficulty: "hard",
        }}
      />
    </div>
  );
};

export default Page;
