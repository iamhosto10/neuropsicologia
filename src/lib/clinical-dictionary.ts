// src/lib/clinical-dictionary.ts

export type MetricDefinition = {
  label: string;
  description: string;
  isPercentage?: boolean;
  isTime?: boolean;
};

export type GameDictionary = {
  title: string;
  domain: string;
  description: string;
  metrics: Record<string, MetricDefinition>;
};

export const CLINICAL_DICTIONARY: Record<string, GameDictionary> = {
  asteroids_go_nogo: {
    title: "Campo de Asteroides",
    domain: "Control Inhibitorio y Atención Sostenida",
    description:
      "Evaluación basada en el paradigma Go/No-Go. Mide la capacidad del paciente para frenar respuestas impulsivas y mantener la atención.",
    metrics: {
      commissionErrors: {
        label: "Errores de Comisión (Impulsividad)",
        description:
          "Veces que el paciente actuó/hizo clic cuando NO debía (estímulo rojo). Es el indicador principal de impulsividad motora.",
      },
      omissionErrors: {
        label: "Errores de Omisión (Inatención)",
        description:
          "Veces que el paciente NO actuó cuando SÍ debía (estímulo verde). Indica lapsos de inatención o fatiga cognitiva.",
      },
      avgReactionTimeMs: {
        label: "Tiempo de Reacción",
        description:
          "Velocidad promedio en milisegundos para responder correctamente. Tiempos muy altos indican procesamiento lento.",
        isTime: true,
      },
      correctHits: {
        label: "Aciertos Correctos (Go)",
        description: "Respuestas correctas ante el estímulo objetivo.",
      },
      correctRejections: {
        label: "Rechazos Correctos (No-Go)",
        description:
          "Veces que el paciente logró frenar su impulso exitosamente.",
      },
    },
  },
  cargo_n_back: {
    title: "Laboratorio de Carga",
    domain: "Memoria de Trabajo (N-Back)",
    description:
      "Evaluación de actualización de la memoria de trabajo. El paciente debe retener y comparar estímulos recientes con estímulos pasados.",
    metrics: {
      falsePositives: {
        label: "Falsas Alarmas",
        description:
          "Dijo que era repetido, pero era nuevo. Indica impulsividad o falla en la retención.",
      },
      falseNegatives: {
        label: "Omisiones",
        description:
          "Era repetido y no lo identificó. Falla directa de la memoria de trabajo.",
      },
      truePositives: {
        label: "Aciertos (Repetidos)",
        description: "Identificó correctamente un estímulo repetido.",
      },
      trueNegatives: {
        label: "Aciertos (Nuevos)",
        description: "Identificó correctamente un estímulo nuevo.",
      },
      avgReactionTimeMs: {
        label: "Tiempo de Reacción",
        description: "Velocidad de procesamiento al comparar en memoria.",
        isTime: true,
      },
    },
  },
  nebula_storm: {
    title: "Tormenta de Nebulosa",
    domain: "Control de la Interferencia (Flanker Task)",
    description:
      "Mide la susceptibilidad a la distracción. Evalúa qué tanto le cuesta al paciente enfocarse en un objetivo central ignorando el 'ruido' visual.",
    metrics: {
      accuracyCongruentPercent: {
        label: "Precisión (Sin Distracción)",
        description:
          "Porcentaje de acierto cuando todos los elementos apuntan al mismo lado.",
        isPercentage: true,
      },
      accuracyIncongruentPercent: {
        label: "Precisión (Con Distracción)",
        description:
          "Porcentaje de acierto cuando los elementos laterales confunden. Una caída drástica aquí indica alta distractibilidad.",
        isPercentage: true,
      },
      avgReactionTimeCongruentMs: {
        label: "Tiempo Reacción (Fácil)",
        description: "Velocidad al procesar estímulos limpios.",
        isTime: true,
      },
      avgReactionTimeIncongruentMs: {
        label: "Tiempo Reacción (Difícil)",
        description:
          "Suele ser mayor. La diferencia de tiempo revela el 'Costo de Interferencia'.",
        isTime: true,
      },
      omissions: {
        label: "Omisiones (Timeouts)",
        description: "Veces que el tiempo se agotó sin respuesta.",
      },
    },
  },
  signal_decoder: {
    title: "Decodificador de Señales",
    domain: "Velocidad de Procesamiento (SDMT)",
    description:
      "Adaptación del Symbol Digit Modalities Test. Mide la velocidad de escaneo visual y procesamiento cognitivo fluido.",
    metrics: {
      accuracyPercent: {
        label: "Precisión de Decodificación",
        description: "Porcentaje general de aciertos.",
        isPercentage: true,
      },
      correctMatches: {
        label: "Emparejamientos Correctos",
        description: "Símbolos decodificados exitosamente.",
      },
      incorrectMatches: {
        label: "Errores de Emparejamiento",
        description: "Equivocaciones al leer la clave visual.",
      },
      avgReactionTimeMs: {
        label: "Velocidad de Procesamiento",
        description:
          "Milisegundos promedio por cada decodificación. Métrica principal del test.",
        isTime: true,
      },
    },
  },
  simon_says_reverse: {
    title: "Panel de Seguridad",
    domain: "Memoria Visoespacial de Trabajo",
    description:
      "Adaptación del test de Corsi. Evalúa la capacidad de mantener y manipular secuencias espaciales en la mente.",
    metrics: {
      maxSequenceDirect: {
        label: "Span Directo (Amplitud)",
        description:
          "Secuencia más larga recordada en el orden original. Mide la memoria a corto plazo pura.",
      },
      maxSequenceReverse: {
        label: "Span Inverso (Manipulación)",
        description:
          "Secuencia más larga recordada al revés. Mide la memoria de trabajo operativa (más compleja).",
      },
      accuracyDirectPercent: {
        label: "Precisión Directa",
        description: "Porcentaje de acierto en secuencias normales.",
        isPercentage: true,
      },
      accuracyReversePercent: {
        label: "Precisión Inversa",
        description: "Porcentaje de acierto en secuencias invertidas.",
        isPercentage: true,
      },
    },
  },
  satellite_tracker: {
    title: "Rastreador de Satélites",
    domain: "Atención Sostenida (CPT)",
    description:
      "Continuous Performance Test. Mide la vigilancia visual continua y la reacción motora.",
    metrics: {
      falsePositives: {
        label: "Clics Impulsivos",
        description:
          "Clics realizados cuando el objetivo no estaba en estado crítico.",
      },
      timeOnTargetPercentage: {
        label: "Rastreo Visual Continuo",
        description:
          "Porcentaje de tiempo que el paciente logró seguir el objetivo en movimiento.",
        isPercentage: true,
      },
      averageReactionTimeMs: {
        label: "Tiempo de Reacción a Alertas",
        description: "Velocidad para detectar el cambio crítico (rojo).",
        isTime: true,
      },
    },
  },
  space_cleanup: {
    title: "Limpieza Espacial",
    domain: "Atención Selectiva y Búsqueda Visual",
    description:
      "Capacidad para escanear el entorno, encontrar objetivos válidos e ignorar distractores.",
    metrics: {
      missedTargets: {
        label: "Objetivos Omitidos",
        description:
          "Elementos válidos que cruzaron la pantalla sin ser tocados. Indicador de inatención visual.",
      },
      incorrectClicks: {
        label: "Clics en Distractores",
        description:
          "Falsas alarmas. El paciente tocó elementos prohibidos (basura espacial).",
      },
      accuracyPercent: {
        label: "Precisión General",
        description: "Relación entre clics correctos y clics totales.",
        isPercentage: true,
      },
    },
  },
  multitask_evasion: {
    title: "Gran Evasión",
    domain: "Atención Dividida y Psicomotricidad",
    description:
      "Exige al paciente pilotar una nave (motricidad) mientras resuelve reglas cognitivas simultáneas.",
    metrics: {
      wallsHit: {
        label: "Colisiones (Fallo Psicomotor)",
        description: "Veces que chocó con un obstáculo físico.",
      },
      incorrectNumbersCaught: {
        label: "Errores Cognitivos",
        description: "Atrapó la carga incorrecta (falló la regla par/impar).",
      },
      correctNumbersCaught: {
        label: "Aciertos Cognitivos",
        description: "Carga correcta atrapada.",
      },
      survivalTimeSeconds: {
        label: "Tiempo de Supervivencia",
        description: "Segundos que duró en la misión antes de perder o ganar.",
        isTime: true,
      },
    },
  },
  reverse_communicator: {
    title: "Comunicador Inverso",
    domain: "Flexibilidad Cognitiva",
    description:
      "Prueba de Stroop Direccional. Mide la capacidad de cambiar de regla mental rápidamente.",
    metrics: {
      accuracyReversePercent: {
        label: "Precisión Inversa",
        description: "Aciertos cuando se le ordenó hacer lo contrario.",
        isPercentage: true,
      },
      avgReactionTimeReverseMs: {
        label: "Tiempo Reacción Inverso",
        description: "Velocidad al procesar la instrucción contraria.",
        isTime: true,
      },
      totalOmissions: {
        label: "Omisiones o Bloqueos",
        description:
          "Veces que el paciente se quedó congelado (timeout) por confusión mental.",
      },
    },
  },
  // 🔥 NUEVO: RUTA DE NAVEGACIÓN (PLANIFICACIÓN) 🔥
  navigation: {
    title: "Ruta de Navegación",
    domain: "Planificación Ejecutiva y Anticipación",
    description:
      "Evaluación basada en laberintos. Entrena la capacidad de planificar secuencias, resolución de problemas y el control de la impulsividad inicial.",
    metrics: {
      levelsCompleted: {
        label: "Sectores Completados",
        description:
          "Cantidad de laberintos resueltos con éxito antes de que se agote el tiempo.",
      },
      totalCrashes: {
        label: "Errores de Planificación (Choques)",
        description:
          "Indica impulsividad o falla en la anticipación espacial al ejecutar comandos erróneos.",
      },
      totalCorrections: {
        label: "Uso de Autocorrección (Borrado)",
        description:
          "Un número alto sugiere buena flexibilidad cognitiva y auto-monitoreo antes de actuar.",
      },
      avgPlanningTimeMs: {
        label: "Tiempo Medio de Planificación",
        description:
          "Tiempo que el cadete observó el mapa antes de presionar la primera flecha. Un tiempo muy bajo indica impulsividad severa.",
        isTime: true,
      },
      efficiencyScore: {
        label: "Índice de Eficiencia de Ruta",
        description:
          "100% significa que usó la ruta más corta posible. Porcentajes bajos indican redundancia o desorientación espacial.",
        isPercentage: true,
      },
    },
  },
  warp_drive: {
    title: "Propulsores Warp",
    domain: "Memoria de Trabajo y Velocidad de Procesamiento",
    description:
      "Basado en pruebas PASAT (Suma Continua). Evalúa la memoria de trabajo operativa (retener un valor que cambia constantemente) y la velocidad de procesamiento matemático bajo presión de tiempo.",
    metrics: {
      accuracyRate: {
        label: "Precisión Global",
        description: "Porcentaje de sumas correctas frente a intentos totales.",
        isPercentage: true,
      },
      avgReactionTimeMs: {
        label: "T. Reacción Promedio",
        description:
          "Milisegundos promedio que tarda el cadete en resolver mentalmente y tocar la pantalla.",
        isTime: true,
      },
      correctAnswers: {
        label: "Sumas Correctas",
        description: "Total de ecuaciones resueltas exitosamente.",
      },
      errorCount: {
        label: "Errores (Impulsividad)",
        description:
          "Toques en opciones incorrectas. Un número alto sugiere respuestas impulsivas.",
      },
      maxStreak: {
        label: "Foco Sostenido (Racha)",
        description: "Mayor cantidad de aciertos consecutivos sin equivocarse.",
      },
      totalEquations: {
        label: "Volumen de Procesamiento",
        description:
          "Total de sumas que el cadete logró procesar en el tiempo límite.",
      },
    },
  },
  star_docking: {
    title: "Acoplamiento Estelar",
    domain: "Habilidades Visoespaciales y Rotación Mental",
    description:
      "Evaluación de la capacidad de rotación mental y orientación espacial. El cadete debe alinear la orientación de su nave con el puerto de la estación, trabajando la percepción de ángulos y la precisión psicomotora.",
    metrics: {
      successfulDocks: {
        label: "Acoples Exitosos",
        description:
          "Cantidad de veces que logró alinear la nave dentro del margen de error permitido.",
      },
      failedDocks: {
        label: "Fallas de Alineación",
        description:
          "Intentos donde se presionó acoplar pero la nave no estaba alineada.",
      },
      averageErrorMargin: {
        label: "Precisión Angular Media",
        description:
          "Promedio de grados de desviación en cada intento. A menor número, mejor precisión visoespacial.",
      },
      averageDecisionTime: {
        label: "Tiempo de Procesamiento Espacial",
        description:
          "Tiempo promedio que tarda el cadete en calcular la rotación y ejecutar la acción.",
        isTime: true,
      },
      totalAttempts: {
        label: "Volumen de Intentos",
        description:
          "Total de veces que el cadete intentó realizar la maniobra de acoplamiento.",
      },
    },
  },
  hull_disassembly: {
    title: "Desensamblaje del Casco",
    domain: "Planificación y Función Ejecutiva",
    description:
      "Evaluación basada en la Torre de Londres y resolución de problemas visoespaciales. Mide la capacidad del paciente para anticipar consecuencias, planificar secuencias lógicas y evitar bloqueos (deadlocks).",
    metrics: {
      stagesCompleted: {
        label: "Sectores Despejados",
        description:
          "Cantidad de laberintos lógicos resueltos con éxito. A mayor número, mayor agilidad mental y resolución de problemas.",
      },
      invalidMoves: {
        label: "Errores de Planificación",
        description:
          "Veces que el cadete intentó mover un tornillo a un agujero bloqueado por una placa. Indica impulsividad o falta de anticipación visual.",
      },
      totalMoves: {
        label: "Volumen de Maniobras",
        description:
          "Cantidad total de tornillos movidos. Útil para contrastar con los errores y medir la eficiencia de la estrategia.",
      },
      averageTimePerMoveMs: {
        label: "Tiempo de Decisión",
        description:
          "Tiempo promedio (en milisegundos) que el cadete observa el tablero antes de mover una pieza. Tiempos muy cortos con altos errores indican impulsividad severa.",
        isTime: true,
      },
    },
  },
  water_sort: {
    title: "Laboratorio de Fluidos",
    domain: "Planificación y Automonitoreo (Función Ejecutiva)",
    description:
      "Adaptación del paradigma de la Torre de Hanoi y clasificación categórica. Evalúa la capacidad del paciente para sostener información en la memoria de trabajo, anticipar movimientos múltiples y tolerar la frustración.",
    metrics: {
      stagesCompleted: {
        label: "Compuestos Sintetizados",
        description:
          "Cantidad de niveles completados exitosamente. Mide la persistencia y capacidad de resolución de problemas complejos.",
      },
      invalidPours: {
        label: "Derrames Inválidos (Impulsividad)",
        description:
          "Veces que intentó verter líquido en un tubo lleno o de distinto color. Un número alto indica falla en la inhibición de impulsos.",
      },
      undosUsed: {
        label: "Uso de Autocorrección (Deshacer)",
        description:
          "Veces que el paciente reconoció un error estratégico y retrocedió. Indica un buen nivel de flexibilidad cognitiva y automonitoreo.",
      },
      totalMoves: {
        label: "Volumen de Movimientos",
        description:
          "Total de trasvases realizados. Al compararlo con los niveles completados, indica la eficiencia de la planificación del cadete.",
      },
      averageDecisionTimeMs: {
        label: "Tiempo de Planificación",
        description:
          "Milisegundos promedio entre cada movimiento. Tiempos muy bajos con altos errores de derrame confirman un perfil impulsivo.",
        isTime: true,
      },
    },
  },
};
