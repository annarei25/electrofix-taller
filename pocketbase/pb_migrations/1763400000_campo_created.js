/// <reference path="../pb_data/types.d.ts" />

// Añade el campo "created" (fecha de creación automática) a las tres colecciones.
// Las colecciones creadas con migración no lo incluyen por defecto, y sin él
// no se pueden ordenar por fecha ni mostrar cuándo ocurrió cada evento.
migrate((app) => {
  for (const nombre of ["clientes", "ordenes", "eventos"]) {
    const coleccion = app.findCollectionByNameOrId(nombre);

    coleccion.fields.add(
      new AutodateField({
        name: "created",
        onCreate: true,  // se rellena solo al crear el registro
        onUpdate: false, // no cambia en las ediciones
      })
    );

    app.save(coleccion);
  }
}, (app) => {
  for (const nombre of ["clientes", "ordenes", "eventos"]) {
    const coleccion = app.findCollectionByNameOrId(nombre);
    coleccion.fields.removeByName("created");
    app.save(coleccion);
  }
});
