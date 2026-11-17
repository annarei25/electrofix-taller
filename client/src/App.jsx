import { Routes, Route } from "react-router";
import MainLayout from "./layouts/MainLayout";
import TableroPage from "./pages/TableroPage";
import OrdenDetallePage from "./pages/OrdenDetallePage";
import NoEncontradoPage from "./pages/NoEncontradoPage";
import NuevaOrdenPage from "./pages/NuevaOrdenPage";
import ClientesPage from "./pages/ClientesPage";
import HistorialPage from "./pages/HistorialPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<TableroPage />} />
        <Route path="/ordenes/nueva" element={<NuevaOrdenPage />} />
        <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
        <Route path="*" element={<NoEncontradoPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/historial" element={<HistorialPage />} />
      </Route>
    </Routes>
  );
}
