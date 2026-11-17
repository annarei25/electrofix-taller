import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { BASE_URL, obtenerOrden } from "../api/pocketbase";
import EstadoBadge from "../components/EstadoBadge";
import AccionesOrden from "../components/AccionesOrden";
import FormularioPresupuesto from "../components/FormularioPresupuesto";
import LineaTiempo from "../components/LineaTiempo";
import { IconoFlechaIzquierda } from "../components/iconos";

export default function OrdenDetallePage() {
  // useParams lee el valor de la dirección: en /ordenes/abc123, id vale "abc123".
  const { id } = useParams();

  const [orden, setOrden] = useState(null);
  const [error, setError] = useState(null);

  // Se vuelve a pedir la orden si cambia el id (por ejemplo, al abrir otra tarjeta).
  useEffect(() => {
    let cancelado = false;

    obtenerOrden(id)
      .then((datos) => {
        if (!cancelado) setOrden(datos);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!orden) return <p className="muted">Cargando orden...</p>;

  const cliente = orden.expand?.cliente;
  const recargar = () => obtenerOrden(id).then(setOrden);
  const piezas = orden.piezas ?? [];
  const fotos = orden.fotos ?? [];

  // El total NO se guarda en la base de datos: se calcula aquí, como pide el taller.
  const totalPiezas = piezas.reduce((suma, p) => suma + p.cantidad * p.precio, 0);
  const total = (orden.manoObra ?? 0) + totalPiezas;

  return (
    <section>
      <Link to="/" className="boton boton-secundario boton-volver">
        <IconoFlechaIzquierda size={16} /> Volver al tablero
      </Link>

      <h1>Orden #{orden.id.slice(0, 7)}</h1>
      <EstadoBadge estado={orden.estado} />
      <AccionesOrden orden={orden} onCambiado={recargar} />
      {orden.estado === "en_diagnostico" && (
        <FormularioPresupuesto orden={orden} onGuardado={recargar} />
      )}

      <div className="detalle-grid">
        <div className="bloque">
          <h2>Cliente</h2>
          <p>{cliente?.nombre}</p>
          <p className="secundario">{cliente?.telefono}</p>
        </div>

        <div className="bloque">
          <h2>Equipo</h2>
          <p className="equipo">{orden.equipo}</p>
          <p className="secundario">{orden.problema}</p>
        </div>
      </div>

      {orden.diagnostico && (
        <div className="bloque">
          <h2>Diagnóstico</h2>
          <p>{orden.diagnostico}</p>
        </div>
      )}

      {/* Presupuesto: solo aparece si la orden ya fue presupuestada */}
      {orden.manoObra !== undefined && orden.manoObra !== null && (
        <div className="bloque">
          <h2>Presupuesto</h2>

          <ul>
            <li>Mano de obra: {orden.manoObra.toFixed(2)} $</li>
            {piezas.map((pieza, indice) => (
              // key: identificador único de cada fila de la lista
              <li key={indice}>
                {pieza.descripcion} × {pieza.cantidad} ({pieza.precio.toFixed(2)} $)
              </li>
            ))}
          </ul>

          <p className="equipo">Total: {total.toFixed(2)} $</p>
        </div>
      )}

      {fotos.length > 0 && (
        <div className="bloque">
          <h2>Fotos de recepción</h2>
          <div className="fotos">
            {fotos.map((nombre) => (
              <img
                key={nombre}
                src={`${BASE_URL}/api/files/ordenes/${orden.id}/${nombre}`}
                alt="Foto de recepción"
              />
            ))}
          </div>
        </div>
      )}

      <LineaTiempo key={orden.id} ordenId={id} />
    </section>
  );
}