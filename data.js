// Datos realistas de ubicaciones relacionadas con el narcotráfico en Colombia
let locations = [
  // Zonas de Coca
  { id: 1, departamento: "Nariño", municipio: "Tumaco", lat: 1.7973, lng: -78.7928, tipo: "Coca", descripcion: "Principal zona productora con cultivos extensivos y procesamiento primario. Presencia de disidencias de las FARC.", hectareas: 18608, violencia: 220, grupos: ["Disidencias FARC", "Clan del Golfo"], laboratorios: 12 },
  { id: 2, departamento: "Putumayo", municipio: "Puerto Asís", lat: 0.5057, lng: -76.4959, tipo: "Coca", descripcion: "Región con cultivos extensivos y laboratorios de procesamiento de base de coca.", hectareas: 16747, violencia: 180, grupos: ["ELN", "Disidencias FARC"], laboratorios: 8 },
  { id: 3, departamento: "Norte de Santander", municipio: "Catatumbo", lat: 8.377, lng: -72.659, tipo: "Coca", descripcion: "Principal enclave cocalero con alta tecnificación agrícola y producción de cocaína.", hectareas: 18608, violencia: 260, grupos: ["ELN", "Disidencias FARC"], laboratorios: 15 },
  { id: 4, departamento: "Cauca", municipio: "Miranda", lat: 3.2501, lng: -76.226, tipo: "Coca", descripcion: "Cultivos en expansión con presencia de disidencias y laboratorios artesanales.", hectareas: 15200, violencia: 190, grupos: ["Disidencias FARC"], laboratorios: 6 },
  { id: 5, departamento: "Guaviare", municipio: "San José del Guaviare", lat: 2.5729, lng: -72.6459, tipo: "Coca", descripcion: "Zona de frontera agrícola con cultivos ilícitos y deforestación asociada.", hectareas: 12400, violencia: 90, grupos: ["Disidencias FARC"], laboratorios: 4 },

  // Zonas de Marihuana
  { id: 21, departamento: "Magdalena", municipio: "Santa Marta", lat: 11.2408, lng: -74.1990, tipo: "Marihuana", descripcion: "Cultivos en la Sierra Nevada, principalmente para mercado interno.", hectareas: 1250, violencia: 45, grupos: ["Clan del Golfo"], laboratorios: 2 },
  { id: 22, departamento: "La Guajira", municipio: "Maicao", lat: 11.3833, lng: -72.2333, tipo: "Marihuana", descripcion: "Cultivos en zonas rurales con conexión a rutas de exportación.", hectareas: 980, violencia: 40, grupos: ["Clan del Golfo"], laboratorios: 1 },
  { id: 23, departamento: "Cesar", municipio: "Valledupar", lat: 10.4631, lng: -73.2532, tipo: "Marihuana", descripcion: "Producción en la Serranía del Perijá con alta calidad.", hectareas: 1560, violencia: 65, grupos: ["ELN"], laboratorios: 3 },
  { id: 24, departamento: "Norte de Santander", municipio: "Ocaña", lat: 8.2445, lng: -73.3550, tipo: "Marihuana", descripcion: "Cultivos en zonas montañosas con procesamiento local.", hectareas: 890, violencia: 55, grupos: ["ELN"], laboratorios: 2 },
  { id: 25, departamento: "Santander", municipio: "Bucaramanga", lat: 7.1193, lng: -73.1227, tipo: "Marihuana", descripcion: "Producción en áreas rurales con distribución nacional.", hectareas: 720, violencia: 35, grupos: ["Clan del Golfo"], laboratorios: 1 },
  { id: 26, departamento: "Boyacá", municipio: "Tunja", lat: 5.5353, lng: -73.3678, tipo: "Marihuana", descripcion: "Cultivos en zonas altas con variedades adaptadas.", hectareas: 610, violencia: 25, grupos: ["Disidencias FARC"], laboratorios: 1 },
  { id: 27, departamento: "Cundinamarca", municipio: "Fusagasugá", lat: 4.3365, lng: -74.3638, tipo: "Marihuana", descripcion: "Producción para mercado de Bogotá y centro del país.", hectareas: 840, violencia: 30, grupos: ["Clan del Golfo"], laboratorios: 2 },
  { id: 28, departamento: "Tolima", municipio: "Ibagué", lat: 4.4447, lng: -75.2422, tipo: "Marihuana", descripcion: "Cultivos en el cañón del Combeima.", hectareas: 530, violencia: 40, grupos: ["Disidencias FARC"], laboratorios: 1 },

  // Rutas de Tráfico
  { id: 6, departamento: "Valle del Cauca", municipio: "Buenaventura", lat: 3.8839, lng: -77.0512, tipo: "Ruta", descripcion: "Puerto clave del Pacífico para embarque marítimo hacia Centroamérica y México.", hectareas: 8500, violencia: 300, grupos: ["Clan del Golfo", "Los Shotas"], laboratorios: 2 },
  { id: 7, departamento: "Putumayo", municipio: "Puerto Leguízamo", lat: -0.0975, lng: -74.7719, tipo: "Ruta", descripcion: "Vías fluviales hacia el Amazonas usadas para transporte interno y salidas a Brasil/Perú.", hectareas: 7200, violencia: 110, grupos: ["Disidencias FARC"], laboratorios: 3 },
  { id: 8, departamento: "Norte de Santander", municipio: "Cúcuta", lat: 7.8939, lng: -72.5078, tipo: "Ruta", descripcion: "Eje fronterizo con Venezuela, corredor terrestre para salidas por el Caribe.", hectareas: 6300, violencia: 260, grupos: ["ELN", "Disidencias FARC"], laboratorios: 5 },
  { id: 9, departamento: "Chocó", municipio: "Bahía Solano", lat: 6.1896, lng: -77.3977, tipo: "Ruta", descripcion: "Salidas marítimas por el Pacífico hacia Centroamérica y rutas alternas.", hectareas: 5800, violencia: 150, grupos: ["Clan del Golfo", "ELN"], laboratorios: 1 },

  // Zonas de Violencia
  { id: 11, departamento: "Arauca", municipio: "Arauquita", lat: 7.0958, lng: -71.7522, tipo: "Violencia", descripcion: "Fuerte presencia de ELN y disputas por control fronterizo y rutas a Venezuela.", hectareas: 800, violencia: 130, grupos: ["ELN", "Disidencias FARC"], laboratorios: 2 },
  { id: 12, departamento: "Cauca", municipio: "Puerto Tejada", lat: 3.1536, lng: -76.3538, tipo: "Violencia", descripcion: "Disputas territoriales por cultivos y presencia de grupos armados.", hectareas: 9800, violencia: 210, grupos: ["Disidencias FARC", "Clan del Golfo"], laboratorios: 4 },
  { id: 13, departamento: "Antioquia", municipio: "Bajo Cauca", lat: 7.9855, lng: -75.1971, tipo: "Violencia", descripcion: "Alta violencia y control del Clan del Golfo; producción y tráfico interno.", hectareas: 11200, violencia: 240, grupos: ["Clan del Golfo"], laboratorios: 7 },
  { id: 14, departamento: "Bolívar", municipio: "San Pablo", lat: 7.4738, lng: -73.93, tipo: "Violencia", descripcion: "Disputa entre grupos armados por control del corredor del Magdalena Medio.", hectareas: 2200, violencia: 80, grupos: ["ELN", "Clan del Golfo"], laboratorios: 2 },
  { id: 15, departamento: "Caldas", municipio: "Samaná", lat: 5.412, lng: -74.9943, tipo: "Violencia", descripcion: "Disidencias en reconfiguración tras acuerdos de paz; corredores secundarios.", hectareas: 450, violencia: 50, grupos: ["Disidencias FARC"], laboratorios: 1 },

  // Puertos de Salida
  { id: 16, departamento: "Bolívar", municipio: "Cartagena", lat: 10.391, lng: -75.4794, tipo: "Puerto", descripcion: "Puerto y aeropuerto con actividad reportada en rutas internacionales hacia Europa.", hectareas: 350, violencia: 80, grupos: ["Clan del Golfo"], laboratorios: 0 },
  { id: 17, departamento: "Magdalena", municipio: "Ciénaga", lat: 10.847, lng: -74.2066, tipo: "Puerto", descripcion: "Corredores hacia el Caribe y puertos para envío a Europa y África Occidental.", hectareas: 800, violencia: 70, grupos: ["Clan del Golfo"], laboratorios: 0 },
  { id: 18, departamento: "San Andrés", municipio: "San Andrés", lat: 12.5833, lng: -81.7, tipo: "Puerto", descripcion: "Isla identificada como plataforma de salida aérea y marítima hacia Centroamérica.", hectareas: 0, violencia: 20, grupos: ["Clan del Golfo"], laboratorios: 0 },
  { id: 19, departamento: "Antioquia", municipio: "Necoclí", lat: 8.1035, lng: -76.466, tipo: "Puerto", descripcion: "Puerto en el Urabá antioqueño usado para salidas marítimas a Centroamérica y México.", hectareas: 2100, violencia: 120, grupos: ["Clan del Golfo"], laboratorios: 1 },
  { id: 20, departamento: "Chocó", municipio: "Istmina", lat: 5.1616, lng: -76.6846, tipo: "Puerto", descripcion: "Ruta fluvial y marítima de envío hacia el Pacífico central.", hectareas: 4800, violencia: 110, grupos: ["ELN", "Clan del Golfo"], laboratorios: 2 }
];

// Definición de rutas entre ubicaciones
const routes = [
  { from: 1, to: 6, tipo: "Marítima", descripcion: "Ruta Pacífica: Tumaco a Buenaventura" },
  { from: 2, to: 7, tipo: "Fluvial", descripcion: "Ruta Amazónica: Puerto Asís a Puerto Leguízamo" },
  { from: 3, to: 8, tipo: "Terrestre", descripcion: "Ruta Fronteriza: Catatumbo a Cúcuta" },
  { from: 4, to: 6, tipo: "Terrestre", descripcion: "Ruta Andina: Miranda a Buenaventura" },
  { from: 5, to: 7, tipo: "Fluvial", descripcion: "Ruta Amazónica: San José del Guaviare a Puerto Leguízamo" },
  { from: 6, to: 16, tipo: "Marítima", descripcion: "Ruta Caribe: Buenaventura a Cartagena" },
  { from: 8, to: 10, tipo: "Terrestre", descripcion: "Ruta Fronteriza Norte: Cúcuta a Maicao" },
  { from: 9, to: 19, tipo: "Marítima", descripcion: "Ruta Pacífica Norte: Bahía Solano a Necoclí" },
  { from: 11, to: 8, tipo: "Terrestre", descripcion: "Ruta Oriental: Arauquita a Cúcuta" },
  { from: 12, to: 6, tipo: "Terrestre", descripcion: "Ruta Caucana: Puerto Tejada a Buenaventura" }
];