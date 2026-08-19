import { ChecklistSection } from './types';

export const INITIAL_SECTIONS: ChecklistSection[] = [
  {
    id: 'revision',
    title: 'AUDITORÍA DE INSTALACIÓN',
    items: [
      // --- 1. MÓDULOS SOBRE BOTALÓN ---
      { 
        id: 'mod-1', 
        label: 'Módulos y soportes instalados con todos sus tornillos ajustados.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'mod-2', 
        label: 'Módulos sin golpes: no golpean con otros componentes durante apertura/cierre del botalón.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'mod-3', 
        label: 'Módulos con luz de 3cm: separación mínima de 3cm de luz respecto a cualquier componente con interferencia.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'mod-4', 
        label: 'Módulos distancia horizontal: distancia a posición ideal menor o igual a 15 cm.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'mod-5', 
        label: 'Módulos verticalidad: soportes completamente verticales sin inclinación respecto al suelo.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'mod-6', 
        label: 'Módulos limpieza: se retiró el film protector de las piezas de acero inoxidable.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },

      // --- 2. FAROS SOBRE BOTALÓN ---
      { 
        id: 'far-1', 
        label: 'Faros y soportes instalados con todos sus tornillos ajustados',   
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'far-2', 
        label: 'Faros cantidad y ubicación: 2 faros por cada módulo, ubicados uno a cada lado.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'far-3', 
        label: 'Faros distancia: la distancia máxima entre faros es igual o menor a 130 cm.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'far-4', 
        label: 'Faros altura: altura máxima respecto de la línea de picos SprAI.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'far-5', 
        label: 'Faros Extra: foto y especificación si se instaló faro extra por distancia > 130cm.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },

      // --- 3. MÓDULOS Y FAROS DELANTEROS ---
      { 
        id: 'del-1', 
        label: 'Delanteros ajuste general: módulos y soportes delanteros con tornillos ajustados.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'del-2', 
        label: 'Delanteros sin interferencias: sin golpes en giro de ruedas o movimiento de escalera.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'del-3', 
        label: 'Delanteros distancia al centro: entre 85 cm y 115 cm respecto al centro de la máquina.',   
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'del-4', 
        label: 'Delanteros cantidad: los 5 faros delanteros están instalados.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'del-5', 
        label: 'Delanteros foto frontal: foto del frente donde se vean los 2 módulos y los 5 faros.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },

      // --- 4. LÍNEA DE PULVERIZACIÓN Y BOTALÓN ---
      { 
        id: 'pul-1', 
        label: 'Cañerías e instalación: ambas cañerías instaladas y línea selectiva limpia con purgas abiertas.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'pul-2', 
        label: 'Prueba de presión línea selectiva (a 5 bar): Probada línea selectiva a 5 bar sin pérdidas.',
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false
      },
      { 
        id: 'pul-3', 
        label: 'Prueba de presión línea convencional (a 5 bar): Probada línea original a 5 bar sin pérdidas.',
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },
      { 
        id: 'pul-4', 
        label: 'Bancadas y ajustes: bancadas con sus 3 tornillos ajustados firmemente.',   
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'pul-5', 
        label: 'Reinstalación de originales: electroválvulas, sensores, cables y picos originales en posición definitiva.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },

      // --- 5. CONEXIÓN HIDRÁULICA ---
      { 
        id: 'hid-1', 
        label: 'Conexiones y sellado: uso de PU en conexiones. Sin pérdidas en filtros, Ramsay, llave 3 vías, caudalímetro y pasatanque.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'hid-2', 
        label: 'Válvula de 3 vías: funcionamiento correcto en aplicación Total y Selectiva.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },

      // --- 6. CABLEADO Y MANGUERAS ---
      { 
        id: 'cab-1', 
        label: 'Recorrido y seguridad: no interfiere con apertura/cierre. Cables no pellizcados ni tirantes.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'cab-2', 
        label: 'Fotos de quiebres y pasajes: fotos de quiebres botalón, cuadro central y pasaje a máquina.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },

      // --- 7. CONEXIONES DE MÓDULOS ---
      { 
        id: 'con-1', 
        label: 'Orden EV (1 al 5): verificada apertura secuencial y orden con objeto verde.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'con-2', 
        label: 'Conexión delanteros: verificado que no estén cruzados módulo izquierdo con EV derecha o viceversa.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },

      // --- 8. SENSOR DE RUEDA ---
      { 
        id: 'sen-1', 
        label: 'Montaje y funcionamiento: sensor perpendicular, enciende/apaga en puntos de medición y no golpea nada.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },

      // --- 9. MANÓMETRO ---
      { 
        id: 'man-1', 
        label: 'Instalación manómetro: montado correctamente, visible para el maquinista y sin pérdidas.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },

      // --- 10. CONEXIÓN ELÉCTRICA ---
      { 
        id: 'ele-1', 
        label: 'Caja de potencia y batería: ajuste de tornillos, bornes y batería. Caja accesible al maquinista.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },
      { 
        id: 'ele-2', 
        label: 'Cortacorrientes: funcionan correctamente encendiendo y apagando el equipo.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },

      // --- 11. NEUMÁTICA (COMPRESOR SI APLICA) ---
      { 
        id: 'neu-1', 
        label: 'Compresor funcionamiento: montado, sin pérdidas, automatismo de presión ok y responde al cortacorriente.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: true, 
        requiresAIValidation: false 
      },

      // --- 12. ANTENA STARLINK (SI APLICA) ---
      { 
        id: 'sta-1', 
        label: 'Instalación y conexión: sujeción firme, vista al cielo despejada y conexión a internet ok.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },

      // --- 13. EXTRAS Y CIERRE ---
      { 
        id: 'ext-1', 
        label: 'Limpieza y orden: zona limpia de residuos. Materiales sobrantes ordenados en un solo lugar.',  
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      { 
        id: 'ext-2', 
        label: 'Listado de materiales faltantes compartido con DeepAgro (descripción y cantidad exacta)', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, 
        requiresAIValidation: false 
      },
      {
        id: 'ext-noconformes', // Le asignamos un ID único y limpio
        label: 'Listado de materiales no conformes (descripción y cantidad exacta): aquellos que llegaron dañados, defectuosos o que no cumplen con la especificación técnica.',
        requiresPhoto: false, // Igual que materiales faltantes, asumo que va sin foto obligatoria
        status: 'Pending',
        observations: '',
        photos: [],
        requiresAIValidation: false 
        },
        {
        id: 'ext-noconformes-falla', // 👈 ID especial de sub-ítem
        label: 'Foto de la falla (Material No Conforme)',
        description: 'Subir evidencia fotográfica clara donde se aprecie el daño o defecto del material.',
        requiresPhoto: true, 
        status: 'Pending',
        observations: '',
        photos: [],
        requiresAIValidation: false 
       },
       {
        id: 'ext-noconformes-etiqueta', // 👈 ID especial de sub-ítem
        label: 'Foto de la etiqueta (Material No Conforme)',
        description: 'Subir foto nítida de la etiqueta o número de serie del componente defectuoso.',
        requiresPhoto: true, 
        status: 'Pending',
        observations: '',
        photos: [],
        requiresAIValidation: false 
        },
        { 
        id: 'ext-3', 
        label: 'Instalación Doble Tanque: Indicar si se contempló la colocación de doble tanque.', 
        status: 'Pending', 
        observations: '', 
        photos: [], 
        requiresPhoto: false, // Cambiar a true si necesitas que saquen foto obligatoria
        requiresAIValidation: false 
      },
      {
        id: 'ext-4', // Siguiendo la numeración (ext-1, ext-2, ext-3...)
        label: 'Cierre correcto: 4 fotos de la máquina completamente cerrada - una de cada lateral (izquierdo y derecho), una del frente y una de la parte trasera.',
        requiresPhoto: true,
        status: 'Pending',
        photos: [],
        observations: '',
        requiresAIValidation: false 
      },
  
    ]
  }
];
