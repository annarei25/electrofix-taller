import { useEffect, useState } from "react";
import { listarOrdenes } from "../api/pocketbase";
import OrdenCard from "../components/OrdenCard";

// Etapas activas, en el mismo orden que el flujo del taller.
// Las cerradas (entregada, rechazada, cancelada) van en el Historial.
const ETAPAS = [
  { id: "solicitada", titulo: "1. Solicitada" },
  { id: "en_diagnostico", titulo: "2. En diagnóstico" },
  { id: "presupuestada", titulo: "3. Presupuestada" },
  { id: "aprobada", titulo: "4. Aprobada" },
  { id: "en_reparacion", titulo: "5. En reparación" },
  { id: "lista", titulo: "6. Lista" },
];

export default function TableroPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [etapaActiva, setEtapaActiva] = useState(null); // null = todas las etapas
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // useEffect: se ejecuta al abrir la página para pedir los datos al servidor.
  // La función de limpieza evita actualizar la pantalla si el usuario ya se fue.
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
  }, []); // [] = solo se ejecuta una vez, al montar la página

  if (cargando) return <p className="muted">Cargando órdenes...</p>;
  if (error) return <p className="error">{error}</p>;

  // Solo órdenes en etapas activas; las cerradas viven en el Historial.
  const activas = ordenes.filter((o) => ETAPAS.some((etapa) => etapa.id === o.estado));

  // Posición de la etapa en el flujo, para ordenar las tarjetas.
  const ordenEtapa = (o) => ETAPAS.findIndex((etapa) => etapa.id === o.estado);

  // Con filtro activo solo se muestran las de esa etapa.
  const visibles = (etapaActiva ? activas.filter((o) => o.estado === etapaActiva) : activas)
    .slice()
    .sort((a, b) => ordenEtapa(a) - ordenEtapa(b));

  const contar = (etapa) => activas.filter((o) => o.estado === etapa.id).length;
  const total = activas.length;

  return (
    <section>
      

      <div className="filtros-etapas">
        <button
          type="button"
          className={`filtro ${etapaActiva === null ? "activo" : ""}`}
          onClick={() => setEtapaActiva(null)}
        >
          Todas ({total})
        </button>

        {ETAPAS.map((etapa) => (
          <button
            key={etapa.id}
            type="button"
            className={`filtro ${etapaActiva === etapa.id ? "activo" : ""}`}
            onClick={() => setEtapaActiva(etapa.id)}
          >
            {etapa.titulo} ({contar(etapa)})
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="muted">
          {etapaActiva ? "Sin órdenes en esta etapa." : "Sin órdenes activas."}
        </p>
      ) : (
        <div className="tablero-cards">
          {visibles.map((orden) => (
            <OrdenCard key={orden.id} orden={orden} />
          ))}
        </div>
      )}
    </section>
  );
}
