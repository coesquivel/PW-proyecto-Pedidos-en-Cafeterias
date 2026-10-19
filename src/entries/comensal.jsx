// src/entries/comensal.jsx

import React, { useState } from 'react';
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

// 3. CSS base
import './comensal.css';

function ComensalApp() {
  const [itemsCarrito, setItemsCarrito] = useState([
    {
      id: 1,
      nombre: "Sándwich de pollo deshilachado",
      detalles: "Pan francés · agregar queso · en el local",
      nota: "sin cebolla, por favor.",
      cantidad: 2,
      precioUnitario: 11.50,
      subtotal: 23.00
    },
    {
      id: 2,
      nombre: "Jugo surtido",
      detalles: "Tamaño grande · sin azúcar",
      nota: "",
      cantidad: 1,
      precioUnitario: 9.00,
      subtotal: 9.00
    },
    {
      id: 3,
      nombre: "Café pasado",
      detalles: "Empaque para llevar",
      nota: "",
      cantidad: 1,
      precioUnitario: 4.00,
      subtotal: 4.00
    }
  ]);

  const [pedidosHistorial, setPedidosHistorial] = useState([]);

  const handleConfirmarNuevoPedido = (nuevoPedido) => {
    setPedidosHistorial((prev) => [nuevoPedido, ...prev]);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <Cabecera cantidadItems={itemsCarrito.length} />
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
              element={<LocalesComensal itemsCarrito={itemsCarrito} setItemsCarrito={setItemsCarrito} />} 
            />
            
            <Route 
              path="/comensales/pedidos" 
              element={<PedidosComensal pedidos={pedidosHistorial} />} 
            />
            
            <Route path="/comensales/calificaciones" element={<CalificacionesComensal />} />
            <Route path="/comensales/micuenta" element={<MiCuentaComensal />} />
            
            <Route 
              path="/comensales/carrito" 
              element={<CarritoComensal items={itemsCarrito} setItems={setItemsCarrito} />} 
            />

            <Route 
              path="/comensales/confirmacion" 
              element={
                <ConfirmacionPedido 
                  items={itemsCarrito} 
                  setItems={setItemsCarrito} 
                  onConfirmarPedido={handleConfirmarNuevoPedido} 
                />
              } 
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