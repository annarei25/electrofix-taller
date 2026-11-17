/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("clientes")

  // Se busca la colección por nombre: el id local de una máquina
  // no existe cuando las migraciones corren en una máquina limpia.
  // Se quita el campo anterior antes de añadir el nuevo.
  collection.fields.removeByName("telefono")
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3253144191",
    "max": 8,
    "min": 8,
    "name": "telefono",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("clientes")

  collection.fields.removeByName("telefono")
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3253144191",
    "max": 30,
    "min": 6,
    "name": "telefono",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
