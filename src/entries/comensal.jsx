// src/entries/comensal.jsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Estructura (Partials)
import Cabecera from '../partials/ControlPanel/Comensal/HeaderComensal/HeaderComensal';
import SubHeader from '../partials/ControlPanel/Comensal/SubHeaderComensal/SubHeaderComensal';
import FooterComensal from '../partials/ControlPanel/Comensal/FooterComensal/FooterComensal';

// 2. Vistas (Pages)
import LocalesComensal from '../pages/PagesComensal/LocalesComensal/LocalesComensal';
import PedidosComensal from '../pages/PagesComensal/PedidosComensal/PedidosComensal';
import CalificacionesComensal from '../pages/PagesComensal/CalificacionesComensal/CalificacionesComensal';
import MiCuentaComensal from '../pages/PagesComensal/MiCuentaComensal/MiCuentaComensal';
import CarritoComensal from '../pages/PagesComensal/CarritoComensal/CarritoComensal';
import ConfirmacionPedido from '../pages/PagesComensal/CarritoComensal/ConfirmacionPedido';

// 3. API
import { obtenerCarrito, CARRITO_VACIO } from '../api/pedidos';

// 4. CSS base
import './comensal.css';
import './comensal-responsive.css';

function ComensalApp() {
  // Carrito real del comensal (viene de la API; cada pantalla lo actualiza con la respuesta)
  const [carrito, setCarrito] = useState(CARRITO_VACIO);

  useEffect(() => {
    obtenerCarrito().then(setCarrito).catch(() => setCarrito(CARRITO_VACIO));
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <Cabecera cantidadItems={carrito.count} />
        </header>

        <div className="app-body">
          <aside className="app-subheader">
            <SubHeader />
          </aside>

          <Routes>
            {/* Redirección automática al ingresar a / o a /comensales */}
            <Route path="/" element={<Navigate to="/comensales/localescomensal" replace />} />
            <Route path="/comensales" element={<Navigate to="/comensales/localescomensal" replace />} />
            
            <Route 
              path="/comensales/localescomensal" 
              element={<LocalesComensal setCarrito={setCarrito} />} 
            />
            
            <Route path="/comensales/pedidos" element={<PedidosComensal setCarrito={setCarrito} />} />

            <Route path="/comensales/calificaciones" element={<CalificacionesComensal />} />
            <Route path="/comensales/micuenta" element={<MiCuentaComensal />} />
            
            <Route
              path="/comensales/carrito"
              element={<CarritoComensal carrito={carrito} setCarrito={setCarrito} />}
            />

            <Route
              path="/comensales/confirmacion"
              element={<ConfirmacionPedido carrito={carrito} setCarrito={setCarrito} />}
            />

            <Route path="*" element={<Navigate to="/comensales/localescomensal" replace />} />
          </Routes>
        </div>

        <footer className="app-footer">
          <FooterComensal />
        </footer>
      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ComensalApp />
    </React.StrictMode>
  );
}