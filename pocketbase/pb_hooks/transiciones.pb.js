/// <reference path="../pb_data/types.d.ts" />

// Reglas del taller que el servidor hace cumplir.
// PocketBase ejecuta cada manejador en su propio contexto: por eso las
// constantes van DENTRO de cada función, no fuera.

// 1) Al crear una orden: debe nacer en "solicitada" y se registra el primer evento.
onRecordCreateRequest((e) => {
  if (e.record.getString("estado") !== "solicitada") {
    throw new BadRequestError("Una orden nueva debe empezar en 'solicitada'.");
  }

  e.next(); // guarda la orden

  const evento = new Record($app.findCollectionByNameOrId("eventos"));
  evento.set("orden", e.record.id);
  evento.set("de", "");
  evento.set("a", "solicitada");
  $app.save(evento);
}, "ordenes");

// 2) Al modificar una orden: valida la transición y el bloqueo del presupuesto.
onRecordUpdateRequest((e) => {
  const TRANSICIONES = {
    solicitada: ["en_diagnostico", "cancelada"],
    en_diagnostico: ["presupuestada"],
    presupuestada: ["aprobada", "rechazada"],
    aprobada: ["en_reparacion"],
    en_reparacion: ["lista"],
    lista: ["entregada"],
    rechazada: [],
    entregada: [],
    cancelada: [],
  };
  const CERRADAS = ["rechazada", "entregada", "cancelada"];
  const CAMPOS_PRESUPUESTO = ["diagnostico", "manoObra", "piezas"];
  const ETAPAS_CON_PRESUPUESTO = ["presupuestada", "aprobada", "en_reparacion", "lista", "entregada", "rechazada"];

  const anterior = e.record.original().getString("estado");
  const nuevo = e.record.getString("estado");

  // Las órdenes cerradas no cambian nunca más.
  if (CERRADAS.includes(anterior)) {
    throw new BadRequestError(`La orden está '${anterior}' y no puede modificarse.`);
  }

  // Si cambia de etapa, debe ser una transición permitida.
  const cambiaEtapa = anterior !== nuevo;
  if (cambiaEtapa && !TRANSICIONES[anterior].includes(nuevo)) {
    throw new BadRequestError(`Transición no permitida: '${anterior}' → '${nuevo}'.`);
  }

  // El presupuesto no se toca una vez existe.
  if (ETAPAS_CON_PRESUPUESTO.includes(anterior)) {
    for (const campo of CAMPOS_PRESUPUESTO) {
      const antes = JSON.stringify(e.record.original().get(campo));
      const ahora = JSON.stringify(e.record.get(campo));
      if (antes !== ahora) {
        throw new BadRequestError(`El campo '${campo}' no se puede modificar después de presupuestar.`);
      }
    }
  }

  // Al presupuestar, el presupuesto debe estar completo.
  if (cambiaEtapa && nuevo === "presupuestada") {
    if (!e.record.getString("diagnostico") || e.record.get("manoObra") === undefined) {
      throw new BadRequestError("Para presupuestar hay que registrar diagnóstico y mano de obra.");
    }
  }

  e.next(); // guarda los cambios

  // Si cambió la etapa, se registra el evento. Solo lo escribe el servidor.
  if (cambiaEtapa) {
    const evento = new Record($app.findCollectionByNameOrId("eventos"));
    evento.set("orden", e.record.id);
    evento.set("de", anterior);
    evento.set("a", nuevo);
    $app.save(evento);
  }
}, "ordenes");