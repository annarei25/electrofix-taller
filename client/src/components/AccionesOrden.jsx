import { useState } from "react";
import { cambiarEstado } from "../api/pocketbase";
import { IconoCheck, IconoPlay, IconoX } from "./iconos";

// Qué botones muestra cada etapa. Cada botón es una transición permitida.
// Si una etapa no aparece aquí (entregada, rechazada, cancelada), no tiene botones.
const ACCIONES = {
  solicitada: [
    { destino: "en_diagnostico", texto: "Iniciar diagnóstico", icono: IconoPlay },
    { destino: "cancelada", texto: "Cancelar orden", variante: "peligro", icono: IconoX },
  ],
  presupuestada: [
    { destino: "aprobada", texto: "Cliente aprobó", variante: "verde", icono: IconoCheck },
    { destino: "rechazada", texto: "Cliente rechazó", variante: "peligro", icono: IconoX },
  ],
  aprobada: [{ destino: "en_reparacion", texto: "Comenzar reparación", icono: IconoPlay }],
  en_reparacion: [
    { destino: "lista", texto: "Marcar como lista", variante: "verde", icono: IconoCheck },
  ],
  lista: [
    { destino: "entregada", texto: "Entregar al cliente", variante: "verde", icono: IconoCheck },
  ],
};

// Props: la orden actual y una función que la vuelve a cargar tras un cambio.
export default function AccionesOrden({ orden, onCambiado }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const acciones = ACCIONES[orden.estado] ?? [];

  async function cambiar(destino) {
    setEnviando(true);
    setError(null);

    try {
      // El servidor valida la transición. Si no es válida, lanza un error.
      await cambiarEstado(orden.id, destino);
      onCambiado();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bloque">
      <h2>Acciones</h2>

      {acciones.length === 0 && (
        <p className="muted">Esta orden no tiene acciones disponibles.</p>
      )}

      <div className="acciones">
        {acciones.map((accion) => (
          <button
            key={accion.destino}
            type="button"
            disabled={enviando}
            onClick={() => cambiar(accion.destino)}
            className={accion.variante ? `boton boton-${accion.variante}` : "boton"}
          >
            {accion.icono && <accion.icono size={16} />}
            {accion.texto}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
