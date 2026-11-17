import { useEffect, useState } from "react";
import { listarEventos } from "../api/pocketbase";
import EstadoBadge from "./EstadoBadge";

// Convierte la fecha de PocketBase ("2026-11-16 10:17:00.123Z") a texto legible.
// Se cambia el espacio por "T" para que el navegador la entienda.
function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha.replace(" ", "T")).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Props: el id de la orden. El componente pide sus eventos y los muestra en orden.
export default function LineaTiempo({ ordenId }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // El padre lo remonta con key cuando cambia la orden, así cargando empieza en true.
  useEffect(() => {
    let cancelado = false;

    listarEventos(ordenId)
      .then((datos) => {
        if (!cancelado) setEventos(datos);
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
  }, [ordenId]);

  if (cargando) return <p className="muted">Cargando historial...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="bloque">
      <h2>Historial de la orden</h2>

      {eventos.length === 0 && <p className="muted">Sin movimientos registrados.</p>}

      <ol className="linea-tiempo">
        {eventos.map((evento) => (
          <li key={evento.id}>
            <span className="fecha">{formatearFecha(evento.created)}</span>

            {evento.de ? (
              <span>
                {evento.de.replace("_", " ")} → <EstadoBadge estado={evento.a} />
              </span>
            ) : (
              <span>
                Ingresó como <EstadoBadge estado={evento.a} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
