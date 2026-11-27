// src/entries/admin.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// Estilos globales
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './admin.css';

// Componentes parciales
import Sidebar from '../partials/Sidebar';
import Navbar from '../partials/Navbar';

// Páginas del sistema (CRUDs)
import DashboardPage from '../pages/DashboardPage';

// Layout Principal (Dashboard + Sidebar + Navbar)
function AdminDashboardLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column bg-light">
        <Navbar />
        <main className="p-4 flex-grow-1">
          {/* El contenido de la ruta activa se renderiza aquí */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Configuración de Rutas
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Montaje en el DOM
const container = document.getElementById('root');
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}