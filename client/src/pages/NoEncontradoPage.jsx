import { Link } from "react-router";

// Se muestra cuando el usuario escribe una dirección que no existe.
export default function NoEncontradoPage() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <p className="muted">La dirección que buscas no existe.</p>
      <Link to="/">Volver al tablero</Link>
    </section>
  );
}
