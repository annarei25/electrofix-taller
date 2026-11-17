/// <reference path="../pb_data/types.d.ts" />

// Datos de prueba: 2 clientes y 3 órdenes en etapas distintas.
// Se insertan con app.save, así que los hooks de API no se ejecutan.
// Por eso aquí se pueden dejar las órdenes en la etapa que haga falta,
// y el historial (eventos) se escribe a mano para que coincida con cada etapa.
migrate(
  (app) => {
    const clientes = app.findCollectionByNameOrId("clientes");
    const ordenes = app.findCollectionByNameOrId("ordenes");
    const eventos = app.findCollectionByNameOrId("eventos");

    function crearCliente(nombre, telefono) {
      const registro = new Record(clientes);
      registro.set("nombre", nombre);
      registro.set("telefono", telefono);
      app.save(registro);
      return registro;
    }

    function crearOrden(datos) {
      const registro = new Record(ordenes);
      for (const [campo, valor] of Object.entries(datos)) {
        registro.set(campo, valor);
      }
      app.save(registro);
      return registro;
    }

    // historial: lista de pares [de, a] en orden cronológico
    function registrarHistorial(orden, historial) {
      for (const [de, a] of historial) {
        const evento = new Record(eventos);
        evento.set("orden", orden.id);
        evento.set("de", de);
        evento.set("a", a);
        app.save(evento);
      }
    }

    const marta = crearCliente("Marta Gómez", "78905436");
    const carlos = crearCliente("Carlos Mendoza", "45673219");

    // Orden 1: recién llegada
    const orden1 = crearOrden({
      cliente: marta.id,
      equipo: "iPhone 14 Pro",
      problema: "No enciende tras una caída. La pantalla queda en negro.",
      estado: "solicitada",
    });
    registrarHistorial(orden1, [["", "solicitada"]]);

    // Orden 2: presupuestada
    const orden2 = crearOrden({
      cliente: carlos.id,
      equipo: "Samsung Galaxy S23",
      problema:
        "Líneas verticales en la pantalla y el panel táctil no responde.",
      estado: "presupuestada",
      diagnostico: "Display OLED dañado. El panel táctil depende del display.",
      manoObra: 45,
      piezas: [{ descripcion: "Display OLED S23", cantidad: 1, precio: 120 }],
    });
    registrarHistorial(orden2, [
      ["", "solicitada"],
      ["solicitada", "en_diagnostico"],
      ["en_diagnostico", "presupuestada"],
    ]);

    // Orden 3: en reparación
    const orden3 = crearOrden({
      cliente: carlos.id,
      equipo: "Dell XPS 15",
      problema: "No carga y no transfiere video por el puerto USB-C.",
      estado: "en_reparacion",
      diagnostico: "Puerto USB-C flojo en la placa.",
      manoObra: 30,
      piezas: [{ descripcion: "Conector USB-C", cantidad: 1, precio: 25 }],
    });
    registrarHistorial(orden3, [
      ["", "solicitada"],
      ["solicitada", "en_diagnostico"],
      ["en_diagnostico", "presupuestada"],
      ["presupuestada", "aprobada"],
      ["aprobada", "en_reparacion"],
    ]);
  },
  (app) => {
    // Sin deshacer: si quieres borrar los datos de prueba, bórralos desde el panel.
  },
);
