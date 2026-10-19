// src/entries/comensal.jsx

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Estructura (Partials)
import Cabecera from '../partials/ControlPanel/HeaderPanel/HeaderComensal';
import SubHeader from '../partials/ControlPanel/SubHeader/SubHeaderComensal';
import Footer from '../partials/ControlPanel/FooterPanel/FooterPanel';

// 2. Vistas (Pages)
import LocalesComensal from '../pages/LocalesComensal/LocalesComensal';
import PedidosComensal from '../pages/PedidosComensal/PedidosComensal'; // <-- Corregido
import Calificaciones from '../pages/Calificaciones/Calificaciones';
import MiCuenta from '../pages/MiCuenta/MiCuenta';
import CarritoComensal from '../pages/CarritoComensal/CarritoComensal';
import ConfirmacionPedido from '../pages/CarritoComensal/ConfirmacionPedido';

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
            <Route path="/comensales" element={<Navigate to="/comensales/localescomensal" replace />} />
            
            <Route 
              path="/comensales/localescomensal" 
              element={<LocalesComensal itemsCarrito={itemsCarrito} setItemsCarrito={setItemsCarrito} />} 
            />
            
            {/* VISTA MIS PEDIDOS ACTUALIZADA */}
            <Route 
              path="/comensales/pedidos" 
              element={<PedidosComensal pedidos={pedidosHistorial} />} 
            />
            
            <Route path="/comensales/calificaciones" element={<Calificaciones />} />
            <Route path="/comensales/micuenta" element={<MiCuenta />} />
            
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
          <Footer />
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