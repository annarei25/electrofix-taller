/// <reference path="../pb_data/types.d.ts" />

// Esquema inicial del taller.
// PocketBase ejecuta este archivo al arrancar y crea las tres colecciones.

const ESTADOS = [
  "solicitada",
  "en_diagnostico",
  "presupuestada",
  "aprobada",
  "rechazada",
  "en_reparacion",
  "lista",
  "entregada",
  "cancelada",
];

migrate((app) => {
  // 1. CLIENTES (las personas no inician sesión, el taller las registra)
  const clientes = new Collection({
    type: "base",
    name: "clientes",
    fields: [
      { name: "nombre", type: "text", required: true, min: 2, max: 120 },
      { name: "telefono", type: "text", required: true, min: 6, max: 30 },
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null, // nadie borra clientes desde la API
  });
  app.save(clientes);

  const clientesId = app.findCollectionByNameOrId("clientes").id;

  // 2. ORDENES
  const ordenes = new Collection({
    type: "base",
    name: "ordenes",
    fields: [
      {
        name: "cliente",
        type: "relation",
        required: true,
        collectionId: clientesId,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { name: "equipo", type: "text", required: true },
      { name: "problema", type: "text", required: true },
      { name: "estado", type: "select", required: true, maxSelect: 1, values: ESTADOS },
      { name: "diagnostico", type: "text" },
      { name: "manoObra", type: "number", min: 0 },
      { name: "piezas", type: "json", maxSize: 20000 },
      {
        name: "fotos",
        type: "file",
        maxSelect: 3,
        maxSize: 5242880, // 5 MB por foto
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
    ],
    listRule: "",
    viewRule: "",
    createRule: "",   // el hook valida que nazca en "solicitada"
    updateRule: "",   // el hook valida las transiciones y el bloqueo del presupuesto
    deleteRule: null, // las órdenes nunca se borran
  });
  app.save(ordenes);

  const ordenesId = app.findCollectionByNameOrId("ordenes").id;

  // 3. EVENTOS (historial: solo lo crea la aplicación desde el hook)
  const eventos = new Collection({
    type: "base",
    name: "eventos",
    fields: [
      {
        name: "orden",
        type: "relation",
        required: true,
        collectionId: ordenesId,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { name: "de", type: "text" },
      { name: "a", type: "text", required: true },
    ],
    listRule: "",
    viewRule: "",
    createRule: null, // nadie crea eventos desde la API: solo el hook
    updateRule: null, // nadie edita eventos
    deleteRule: null, // nadie borra eventos
  });
  app.save(eventos);
}, (app) => {
  // Deshacer: borrar en orden inverso para respetar las relaciones
  for (const nombre of ["eventos", "ordenes", "clientes"]) {
    const col = app.findCollectionByNameOrId(nombre);
    app.delete(col);
  }
});
