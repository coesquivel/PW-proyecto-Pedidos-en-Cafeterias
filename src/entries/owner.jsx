// src/entries/owner.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// 1. Estructura (Partials)
import HeaderOwner from '../partials/ControlPanel/Owner/HeaderOwner/HeaderOwner';
import SideBarOwner from '../partials/ControlPanel/Owner/SideBarOwner/SideBarOwner';
import FooterOwner from '../partials/ControlPanel/Owner/FooterOwner/FooterOwner';

// 2. Vistas (Pages)
import Ranking from '../pages/PagesOwner/Ranking/Ranking';
import Tablero from '../pages/PagesOwner/Tablero/Tablero';
import VentasProducto from '../pages/PagesOwner/VentasProducto/VentasProducto';
import Comensales from '../pages/PagesOwner/Comensales/Comensales';
import Solicitudes from '../pages/PagesOwner/Solicitudes/Solicitudes';

// 3. CSS base
import './owner.css';

// Secciones del menú que todavía no tienen página
// (muestra la ruta recibida para detectar enlaces mal escritos en el menú)
function EnConstruccion() {
  const { pathname } = useLocation();
  return (
    <p className="owner-en-construccion">
      Esta sección aún no está disponible. Ruta recibida: <b>{pathname}</b>
    </p>
  );
}

function OwnerApp() {
  return (
    <BrowserRouter>
      <div className="owner-app">

        <header className="owner-app-header">
          <HeaderOwner />
        </header>

        <div className="owner-app-body">

          <aside className="owner-app-sidebar">
            <SideBarOwner />
          </aside>

          <main className="owner-app-content">
            <Routes>
              <Route path="/owner" element={<Navigate to="/owner/tablero" replace />} />
              <Route path="/owner/tablero" element={<Tablero />} />
              <Route path="/owner/ventas" element={<VentasProducto />} />
              <Route path="/owner/comensales" element={<Comensales tab="comensales" />} />
              <Route path="/owner/solicitudes" element={<Solicitudes />} />
              <Route path="/owner/locales" element={<Comensales tab="locales" />} />
              <Route path="/owner/ranking" element={<Ranking />} />
              <Route path="*" element={<EnConstruccion />} />
            </Routes>
          </main>

        </div>

        <footer className="owner-app-footer">
          <FooterOwner />
        </footer>

      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <OwnerApp />
    </React.StrictMode>
  );
}