import { useEffect, useState } from "react";
import { listarOrdenes } from "../api/pocketbase";
import OrdenCard from "../components/OrdenCard";

// Estados que cierran una orden. Ya no cambian nunca más.
const CERRADAS = ["entregada", "rechazada", "cancelada"];

export default function HistorialPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    listarOrdenes()
      .then((datos) => {
        if (!cancelado) setOrdenes(datos);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (cargando) return <p className="muted">Cargando historial...</p>;
  if (error) return <p className="error">{error}</p>;

  // Solo las órdenes cerradas. El filtro se hace en el cliente sobre la lista ya cargada.
  const cerradas = ordenes.filter((o) => CERRADAS.includes(o.estado));

  return (
    <section>
      <h1>Historial y entregadas</h1>

      {cerradas.length === 0 && (
        <p className="muted">Todavía no hay órdenes cerradas.</p>
      )}

      <div className="lista-historial">
        {cerradas.map((orden) => (
          <OrdenCard key={orden.id} orden={orden} />
        ))}
      </div>
    </section>
  );
}
