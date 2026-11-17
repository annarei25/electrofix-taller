import { Link } from "react-router";
import EstadoBadge from "./EstadoBadge";
import { BASE_URL } from "../api/pocketbase";

// Total del presupuesto. Devuelve null si la orden aún no fue presupuestada.
function totalOrden(orden) {
  if (orden.manoObra === undefined || orden.manoObra === null) return null;

  const piezas = orden.piezas ?? [];
  return (
    orden.manoObra + piezas.reduce((suma, p) => suma + p.cantidad * p.precio, 0)
  );
}

// Tarjeta completa de una orden. Toda la tarjeta es un enlace al detalle.
// No hay enlaces anidados, así que el clic siempre lleva a la orden.
export default function OrdenCard({ orden }) {
  const cliente = orden.expand?.cliente;
  const total = totalOrden(orden);
  const foto = orden.fotos?.[0];

  return (
    <Link to={`/ordenes/${orden.id}`} className={`card estado-${orden.estado}`}>
      <div className="card-foto">
        {foto && (
          <img
            src={`${BASE_URL}/api/files/ordenes/${orden.id}/${foto}`}
            alt={orden.equipo}
          />
        )}
        <EstadoBadge estado={orden.estado} />
      </div>

      <div className="card-cuerpo">
        <h3>{orden.equipo}</h3>
        <p>{cliente?.nombre ?? "Cliente sin nombre"}</p>
        {cliente?.telefono && <p className="secundario">{cliente.telefono}</p>}
        <p className="problema">{orden.problema}</p>

        <div className="card-pie">
          {total !== null && <span>{total.toFixed(2)} $</span>}
        </div>
      </div>
    </Link>
  );
}
