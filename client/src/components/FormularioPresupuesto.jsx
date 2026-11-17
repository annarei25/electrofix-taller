import { useState } from "react";
import { actualizarOrden } from "../api/pocketbase";

// Crea una fila de pieza vacía. El id sirve como key estable de la lista
// para que React no mezcle las filas cuando se borra una.
function nuevaPieza() {
  return { id: crypto.randomUUID(), descripcion: "", cantidad: 1, precio: 0 };
}

// Props: la orden (en en_diagnostico) y una función que se llama al guardar.
export default function FormularioPresupuesto({ orden, onGuardado }) {
  const [diagnostico, setDiagnostico] = useState("");
  const [manoObra, setManoObra] = useState("");
  const [piezas, setPiezas] = useState([nuevaPieza()]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  // El total se calcula en pantalla. No se guarda en la base de datos.
  const totalPiezas = piezas.reduce(
    (suma, p) => suma + Number(p.cantidad) * Number(p.precio),
    0
  );
  const total = (Number(manoObra) || 0) + totalPiezas;

  // Cambia un solo campo de una pieza. Las demás filas quedan igual.
  function cambiarPieza(id, campo, valor) {
    setPiezas((actuales) =>
      actuales.map((pieza) => (pieza.id === id ? { ...pieza, [campo]: valor } : pieza))
    );
  }

  function quitarPieza(id) {
    setPiezas((actuales) => actuales.filter((pieza) => pieza.id !== id));
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError(null);

    if (diagnostico.trim() === "") {
      setError("Escribe el diagnóstico.");
      return;
    }

    const mano = Number(manoObra);
    if (manoObra === "" || Number.isNaN(mano) || mano < 0) {
      setError("La mano de obra debe ser un número igual o mayor que 0.");
      return;
    }

    // Se descartan las filas sin descripción y se convierte a números.
    const piezasLimpias = piezas
      .filter((p) => p.descripcion.trim() !== "")
      .map((p) => ({
        descripcion: p.descripcion.trim(),
        cantidad: Number(p.cantidad),
        precio: Number(p.precio),
      }));

    if (piezasLimpias.some((p) => p.cantidad < 1 || p.precio < 0)) {
      setError("Revisa las piezas: la cantidad mínima es 1 y el precio no puede ser negativo.");
      return;
    }

    setEnviando(true);
    try {
      // Un solo PATCH: guarda el presupuesto y cambia la etapa a "presupuestada".
      await actualizarOrden(orden.id, {
        estado: "presupuestada",
        diagnostico: diagnostico.trim(),
        manoObra: mano,
        piezas: piezasLimpias,
      });
      onGuardado();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="bloque" onSubmit={guardar}>
      <h2>Registrar presupuesto</h2>

      <label className="campo">
        <span>Diagnóstico</span>
        <textarea
          rows={3}
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
        />
      </label>

      <label className="campo">
        <span>Mano de obra ($)</span>
        <input
          type="number"
          min="0"
          step="0.5"
          value={manoObra}
          onChange={(e) => setManoObra(e.target.value)}
        />
      </label>

      <h3>Piezas</h3>

      {piezas.map((pieza) => (
        <div key={pieza.id} className="fila-pieza">
          <input
            placeholder="Descripción"
            value={pieza.descripcion}
            onChange={(e) => cambiarPieza(pieza.id, "descripcion", e.target.value)}
          />
          <input
            type="number"
            min="1"
            aria-label="Cantidad"
            value={pieza.cantidad}
            onChange={(e) => cambiarPieza(pieza.id, "cantidad", e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            aria-label="Precio unitario"
            value={pieza.precio}
            onChange={(e) => cambiarPieza(pieza.id, "precio", e.target.value)}
          />
          <button
            type="button"
            className="boton boton-peligro"
            onClick={() => quitarPieza(pieza.id)}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className="boton"
        onClick={() => setPiezas((actuales) => [...actuales, nuevaPieza()])}
      >
        + Añadir pieza
      </button>

      <p className="equipo">
        Total: {total.toFixed(2)} $ <span className="muted">(calculado, no se guarda)</span>
      </p>

      {error && <p className="error">{error}</p>}

      <button type="submit" className="boton" disabled={enviando}>
        Guardar presupuesto
      </button>
    </form>
  );
}
