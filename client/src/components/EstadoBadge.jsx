// Muestra el estado con una clase distinta según el valor.
// Ejemplo: "en_diagnostico" se muestra como "en diagnostico".
export default function EstadoBadge({ estado }) {
  return (
    <span className={`badge badge-${estado}`}>
      {estado.replace("_", " ")}
    </span>
  );
}
