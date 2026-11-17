// Icono base. Los iconos de Lucide (https://lucide.dev, licencia ISC) son SVG
// de 24x24 con trazo. Este componente pone los atributos comunes una sola vez.
export default function Icono({ children, size = 18, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
