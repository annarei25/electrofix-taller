// Dirección del servidor PocketBase.
// En desarrollo PocketBase corre en esta dirección por defecto.
export const BASE_URL = import.meta.env.VITE_POCKETBASE_URL ?? "http://127.0.0.1:8090";

// Trae las órdenes con los datos del cliente incluidos (expand=cliente).
// PocketBase devuelve la lista dentro de "items".
export async function listarOrdenes() {
  const url = `${BASE_URL}/api/collections/ordenes/records?expand=cliente&perPage=200`;

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`No se pudieron cargar las órdenes (código ${respuesta.status}).`);
  }

  const datos = await respuesta.json();
  return datos.items;
}

// Trae una sola orden, con los datos de su cliente.
export async function obtenerOrden(id) {
  const url = `${BASE_URL}/api/collections/ordenes/records/${id}?expand=cliente`;

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar la orden (código ${respuesta.status}).`);
  }

  return respuesta.json();
}

// Cambia solo el estado de una orden. El servidor valida la transición.
export async function cambiarEstado(id, nuevoEstado) {
  return actualizarOrden(id, { estado: nuevoEstado });
}

// Actualiza los campos que se envían. El servidor valida el cambio.
export async function actualizarOrden(id, cambios) {
  const url = `${BASE_URL}/api/collections/ordenes/records/${id}`;

  const respuesta = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message ?? `No se pudo actualizar la orden (código ${respuesta.status}).`);
  }

  return datos;
}

// Convierte la respuesta en datos o lanza un error con el motivo.
// PocketBase incluye en datos.data el detalle de cada campo inválido.
async function leerRespuesta(respuesta) {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    const detalle = datos.data
      ? Object.values(datos.data).map((c) => c.message).join(" ")
      : "";
    throw new Error([datos.message, detalle].filter(Boolean).join(" "));
  }

  return datos;
}

export async function crearCliente(datos) {
  const respuesta = await fetch(`${BASE_URL}/api/collections/clientes/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  return leerRespuesta(respuesta);
}

// Recibe un FormData porque la orden incluye fotos.
// No se pone Content-Type: el navegador lo añade solo para multipart.
export async function crearOrden(formData) {
  const respuesta = await fetch(`${BASE_URL}/api/collections/ordenes/records`, {
    method: "POST",
    body: formData,
  });

  return leerRespuesta(respuesta);
}

export async function listarClientes() {
  const respuesta = await fetch(`${BASE_URL}/api/collections/clientes/records?perPage=500`);
  const datos = await leerRespuesta(respuesta);
  return datos.items;
}

// Trae los eventos de una orden, del más antiguo al más reciente.
export async function listarEventos(ordenId) {
  const filtro = encodeURIComponent(`orden='${ordenId}'`);
  const respuesta = await fetch(`${BASE_URL}/api/collections/eventos/records?filter=${filtro}&perPage=500`);
  const datos = await leerRespuesta(respuesta);

  // created es texto con formato de fecha, así que se ordena bien comparando cadenas.
  return datos.items.sort((a, b) => (a.created < b.created ? -1 : 1));
}