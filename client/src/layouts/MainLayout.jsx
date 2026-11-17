import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import {
  IconoPlus,
  IconoReloj,
  IconoTablero,
  IconoUsuarios,
} from "../components/iconos";
import { listarOrdenes } from "../api/pocketbase";

// Estados que cierran una orden. No cuentan como "activas" en la cabecera.
const CERRADAS = ["entregada", "rechazada", "cancelada"];

// Convierte horas a texto corto para la métrica de antigüedad.
function formatearEdad(horas) {
  if (horas < 1) return `${Math.max(1, Math.round(horas * 60))} min`;
  if (horas < 24) return `${Math.round(horas)}h`;
  return `${(horas / 24).toFixed(1)} días`;
}

// Antigüedad en horas de una orden, o null si no tiene fecha válida.
// Solo se usa dentro del efecto: Date.now() es impuro y no va en el render.
function antiguedadHoras(orden) {
  if (!orden.created) return null;
  const fecha = new Date(orden.created.replace(" ", "T"));
  return Number.isNaN(fecha.getTime()) ? null : (Date.now() - fecha) / 36e5;
}

// Diseño compartido: cabecera con métricas globales, menú fijo y <Outlet /> cambia la página.
export default function MainLayout() {
  const location = useLocation();
  const [metricas, setMetricas] = useState(null);
  const [fallo, setFallo] = useState(false);

  // Se recarga al cambiar de página para que las métricas no queden viejas.
  // El cálculo va dentro del efecto porque usa Date.now() (no permitido en el render).
  useEffect(() => {
    let cancelado = false;

    listarOrdenes()
      .then((datos) => {
        if (cancelado) return;

        const activas = datos.filter((o) => !CERRADAS.includes(o.estado));
        const edades = activas.map(antiguedadHoras).filter((h) => h !== null);

        setMetricas({
          activas: activas.length,
          listas: datos.filter((o) => o.estado === "lista").length,
          edad:
            edades.length > 0
              ? edades.reduce((a, b) => a + b, 0) / edades.length
              : null,
        });
      })
      .catch(() => {
        if (!cancelado) setFallo(true);
      });

    return () => {
      cancelado = true;
    };
  }, [location.pathname]);

  const activasTexto = fallo ? "—" : metricas ? metricas.activas : "…";
  const listasTexto = fallo ? "—" : metricas ? metricas.listas : "…";
  const edadTexto = fallo
    ? "—"
    : !metricas
      ? "…"
      : metricas.edad !== null
        ? formatearEdad(metricas.edad)
        : "—";

  return (
    <div className="app">
      <header className="cabecera">
        <div className="marca">
          <span className="marca-nombre">ElectroFix</span>
          <span className="marca-sub">Taller técnico</span>
        </div>

        <div className="cabecera-metricas">
          <span className="metrica">
            <strong>{activasTexto}</strong>
            Órdenes activas
          </span>
          <span className="metrica">
            <strong>{listasTexto}</strong>
            Listas para retirar
          </span>
          <span className="metrica">
            <strong>{edadTexto}</strong>
            Antigüedad media
          </span>
        </div>

        <div className="cabecera-acciones">
          <Link to="/ordenes/nueva" className="boton">
            <IconoPlus size={16} /> Registrar equipo
          </Link>
        </div>
      </header>

      <div className="cuerpo">
        <aside className="menu">
          <h2>Módulos</h2>
          <nav>
            <NavLink to="/">
              <IconoTablero size={18} /> Tablero
            </NavLink>
            <NavLink to="/ordenes/nueva">
              <IconoPlus size={18} /> Nueva orden
            </NavLink>
            <NavLink to="/clientes">
              <IconoUsuarios size={18} /> Clientes
            </NavLink>
            <NavLink to="/historial">
              <IconoReloj size={18} /> Historial
            </NavLink>
          </nav>
        </aside>

        <main className="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
