import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { crearCliente, crearOrden, listarClientes } from "../api/pocketbase";

const MAX_FOTOS = 3;

// Registra un equipo que llega al taller.
// El cliente puede ser nuevo o uno ya registrado, elegido de la lista.
export default function NuevaOrdenPage() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [modoCliente, setModoCliente] = useState("nuevo"); // "nuevo" | "existente"
  const [clienteElegido, setClienteElegido] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [equipo, setEquipo] = useState("");
  const [problema, setProblema] = useState("");
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  // Carga los clientes registrados para el modo "Cliente existente".
  useEffect(() => {
    let cancelado = false;

    listarClientes()
      .then((datos) => {
        if (!cancelado) setClientes(datos);
      })
      .catch(() => {
        // Sin lista no hay modo existente, pero el formulario sigue funcionando.
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Lee las fotos elegidas en el input y comprueba el máximo.
  function elegirFotos(evento) {
    const elegidas = Array.from(evento.target.files);

    if (elegidas.length > MAX_FOTOS) {
      setError(`Puedes subir hasta ${MAX_FOTOS} fotos.`);
      setFotos([]);
      evento.target.value = ""; // vacía el input para que el usuario vuelva a elegir
      return;
    }

    setError(null);
    setFotos(elegidas);
  }

  // Al elegir un cliente de la lista se rellenan nombre y teléfono.
  function elegirCliente(cliente) {
    setClienteElegido(cliente);
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setError(null);
  }

  function pasarANuevo() {
    setModoCliente("nuevo");
    setClienteElegido(null);
    setNombre("");
    setTelefono("");
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError(null);

    if (!equipo.trim() || !problema.trim()) {
      setError("Completa el equipo y el problema.");
      return;
    }

    setEnviando(true);
    try {
      // 1. Resolver el cliente: el elegido de la lista, o uno nuevo.
      let clienteId;

      if (modoCliente === "existente") {
        if (!clienteElegido) {
          setError("Elige un cliente de la lista.");
          return;
        }
        clienteId = clienteElegido.id;
      } else {
        if (!nombre.trim() || !telefono.trim()) {
          setError("Completa el nombre y el teléfono del cliente.");
          return;
        }

        const cliente = await crearCliente({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
        });
        clienteId = cliente.id;
      }

      // 2. Crear la orden. Se usa FormData porque incluye archivos (las fotos).
      const datos = new FormData();
      datos.append("cliente", clienteId);
      datos.append("equipo", equipo.trim());
      datos.append("problema", problema.trim());
      datos.append("estado", "solicitada"); // obligatorio: el hook solo acepta este estado al crear
      fotos.forEach((foto) => datos.append("fotos", foto));

      const orden = await crearOrden(datos);

      // 3. Ir al detalle de la orden recién creada
      navigate(`/ordenes/${orden.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  // Clientes que coinciden con la búsqueda, por nombre o teléfono.
  const textoCliente = busquedaCliente.trim().toLowerCase();
  const coincidentes = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(textoCliente) || c.telefono.includes(textoCliente)
  );

  return (
    <section>
      <h1>Registrar equipo</h1>

      <form className="formulario" onSubmit={guardar}>
        <div className="bloque">
          <h2>Cliente</h2>

          <div className="filtros-etapas">
            <button
              type="button"
              className={`filtro ${modoCliente === "nuevo" ? "activo" : ""}`}
              onClick={pasarANuevo}
            >
              Nuevo cliente
            </button>
            <button
              type="button"
              className={`filtro ${modoCliente === "existente" ? "activo" : ""}`}
              onClick={() => setModoCliente("existente")}
            >
              Cliente existente
            </button>
          </div>

          {modoCliente === "existente" && (
            <>
              <input
                className="buscador"
                placeholder="Buscar por nombre o teléfono..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
              />

              {!clienteElegido ? (
                <div className="lista-clientes lista-clientes-corta">
                  {coincidentes.length === 0 && (
                    <p className="muted">Ningún cliente coincide.</p>
                  )}

                  {coincidentes.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      className="item-cliente"
                      onClick={() => elegirCliente(cliente)}
                    >
                      <strong>{cliente.nombre}</strong>
                      <span className="secundario">{cliente.telefono}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="cliente-elegido">
                  <span>
                    <strong>{clienteElegido.nombre}</strong> · {clienteElegido.telefono}
                  </span>
                  <button
                    type="button"
                    className="boton boton-secundario"
                    onClick={() => setClienteElegido(null)}
                  >
                    Cambiar
                  </button>
                </div>
              )}
            </>
          )}

          {modoCliente === "nuevo" && (
            <>
              <label className="campo">
                <span>Nombre completo *</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </label>

              <label className="campo">
                <span>Teléfono *</span>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </label>
            </>
          )}
        </div>

        <div className="bloque">
          <h2>Equipo</h2>

          <label className="campo">
            <span>Tipo y modelo *</span>
            <input
              placeholder="Ej: iPhone 14 Pro"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              required
            />
          </label>

          <label className="campo">
            <span>Problema que presenta *</span>
            <textarea
              rows={4}
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="bloque">
          <h2>Fotos de recepción (hasta {MAX_FOTOS})</h2>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={elegirFotos}
          />

          <p className="muted">
            {fotos.length === 0
              ? "Sin fotos seleccionadas."
              : `${fotos.length} foto(s) seleccionada(s).`}
          </p>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? "Guardando..." : "Crear orden"}
        </button>
      </form>
    </section>
  );
}
