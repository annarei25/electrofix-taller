import Icono from "./Icono";

export function IconoPlay(props) {
  return <Icono {...props}><polygon points="6 3 20 12 6 21 6 3" /></Icono>;
}

export function IconoCheck(props) {
  return <Icono {...props}><path d="M20 6 9 17l-5-5" /></Icono>;
}

export function IconoX(props) {
  return <Icono {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icono>;
}

export function IconoPlus(props) {
  return <Icono {...props}><path d="M5 12h14" /><path d="M12 5v14" /></Icono>;
}

export function IconoReloj(props) {
  return (
    <Icono {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Icono>
  );
}

export function IconoTablero(props) {
  return (
    <Icono {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </Icono>
  );
}

export function IconoUsuarios(props) {
  return (
    <Icono {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icono>
  );
}

export function IconoFlechaIzquierda(props) {
  return (
    <Icono {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Icono>
  );
}
