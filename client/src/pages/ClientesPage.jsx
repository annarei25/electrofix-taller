import { useEffect, useState } from "react";
import { listarClientes, listarOrdenes } from "../api/pocketbase";
import OrdenCard from "../components/OrdenCard";

// Buscador de clientes. Cuando un cliente llama, aquí se ve en qué punto va su equipo.
export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Se piden clientes y órdenes a la vez con Promise.all.
  useEffect(() => {
    let cancelado = false;

    Promise.all([listarClientes(), listarOrdenes()])
      .then(([datosClientes, datosOrdenes]) => {
        if (!cancelado) {
          setClientes(datosClientes);
          setOrdenes(datosOrdenes);
        }
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

  if (cargando) return <p className="muted">Cargando clientes...</p>;
  if (error) return <p className="error">{error}</p>;

  // Filtra mientras se escribe: por nombre (sin mayúsculas) o por teléfono.
  const texto = busqueda.trim().toLowerCase();
  const coincidentes = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(texto) || c.telefono.includes(texto),
  );

  // Órdenes del cliente seleccionado
  const ordenesDelCliente = seleccionado
    ? ordenes.filter((o) => o.cliente === seleccionado.id)
    : [];

  return (
    <section>
      <h1>Clientes</h1>

      <input
        className="buscador"
        placeholder="Buscar por nombre o teléfono..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="layout-dos">
        <div className="lista-clientes">
          {coincidentes.length === 0 && (
            <p className="muted">No hay clientes que coincidan.</p>
          )}

          {coincidentes.map((cliente) => (
            <button
              key={cliente.id}
              type="button"
              onClick={() => setSeleccionado(cliente)}
              className={`item-cliente ${seleccionado?.id === cliente.id ? "activo" : ""}`}
            >
              <strong>{cliente.nombre}</strong>
              <span className="secundario">{cliente.telefono}</span>
            </button>
          ))}
        </div>

        <div>
          {!seleccionado && (
            <p className="muted">Selecciona un cliente para ver sus equipos.</p>
          )}

          {seleccionado && (
            <>
              {ordenesDelCliente.length === 0 && (
                <p className="muted">Este cliente no tiene órdenes.</p>
              )}

              <div className="tablero-cards">
                {ordenesDelCliente.map((orden) => (
                  <OrdenCard key={orden.id} orden={orden} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
