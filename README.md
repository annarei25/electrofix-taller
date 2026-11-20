# Taller ElectroFix

Aplicación para gestionar las reparaciones de un taller de equipos electrónicos.
Frontend en React (Vite) y servidor en PocketBase.

## Requisitos

- [Node.js](https://nodejs.org) 18 o superior
- [PocketBase](https://pocketbase.io/docs/) (descarga el ejecutable para tu sistema)
- Git

## Estructura

```
electrofix-taller/
├── pocketbase/        Servidor: esquema, reglas y lógica
│   ├── pb_migrations/ Esquema y datos de prueba
│   └── pb_hooks/      Reglas del taller (transiciones de estado)
└── client/            Interfaz en React
```

## Puesta en marcha desde cero

### 1. Servidor (PocketBase)

1. Descarga PocketBase y copia el ejecutable dentro de `pocketbase/`.
2. Arranca el servidor. Al hacerlo, aplica automáticamente las migraciones y carga los hooks:

   ```bash
   cd pocketbase
   ./pocketbase serve
   ```

   En Windows, el comando es `pocketbase.exe serve`.

3. Crea el superusuario para entrar al panel de administración. Con el servidor parado (Ctrl+C), ejecuta:

   ```bash
   ./pocketbase superuser create tu@correo.com 'TuClaveSegura123'
   ```

4. Vuelve a arrancar el servidor y entra a `http://127.0.0.1:8090/_/` con ese correo.

### 2. Interfaz (React)

En otra terminal:

```bash
cd client
npm install
npm run dev
```

Abre `http://localhost:5173`.

Si el servidor de PocketBase está en otra dirección, crea un archivo `client/.env` con:

```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## Datos de prueba

La aplicación inicial ya incluye datos de prueba. Al crear por primera vez la base
local, la migración `1763500000_datos_de_prueba.js` carga automáticamente:

| Cliente | Teléfono | Órdenes |
| --- | --- | --- |
| Marta Gómez | 78905436 | iPhone 14 Pro en `solicitada` |
| Carlos Mendoza | 45673219 | Samsung Galaxy S23 en `presupuestada` |
| Carlos Mendoza | 45673219 | Dell XPS 15 en `en_reparacion` |

Cada orden tiene su historial de eventos, para que la línea de tiempo tenga contenido desde el principio.

Los datos de prueba permiten explorar el tablero y los estados sin crear primero
los registros manualmente. No reemplazan los datos existentes: la migración se
aplica una sola vez, cuando todavía no estaba registrada en la base local.

### Borrar los datos de prueba y empezar desde cero

1. Detén PocketBase y arráncalo de nuevo.
2. Abre el panel de administración en `http://127.0.0.1:8090/_/`.
3. Entra a **Colecciones** y elimina los registros en este orden:
   - `eventos`
   - `ordenes`
   - `clientes`
4. Recarga la interfaz React. El tablero debe quedar sin órdenes y la lista de
   clientes sin registros.

La aplicación no permite borrar órdenes ni eventos desde su interfaz o API; por
eso el borrado inicial se hace desde el panel de administración. Eliminar los
datos no deshace la migración ni elimina el esquema, así que pueden crearse
nuevos clientes y órdenes normalmente.

## Reglas del servidor

El archivo `pocketbase/pb_hooks/transiciones.pb.js` cumple las reglas del taller aunque se use la API directamente:

- Una orden nueva solo puede nacer en `solicitada`.
- Solo se permiten los cambios de etapa de la tabla. Cualquier otro se rechaza.
- Las órdenes `rechazada`, `entregada` y `cancelada` no cambian nunca más.
- Una vez presupuestada, el diagnóstico, la mano de obra y las piezas quedan bloqueados.
- Cada cambio de etapa crea un evento en `eventos`. Solo lo escribe el servidor.

Las colecciones `eventos` y `ordenes` no permiten borrar registros desde la API.

## Notas

- `pocketbase/pb_data/` contiene la base de datos y las credenciales. No se sube a GitHub.
- `client/node_modules/` y `client/dist/` tampoco se suben.
