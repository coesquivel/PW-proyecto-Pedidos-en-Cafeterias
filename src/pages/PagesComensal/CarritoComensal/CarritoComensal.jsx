// src/pages/CarritoComensal/CarritoComensal.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CarritoComensal.css'; // <-- Importamos los estilos CSS

export default function CarritoComensal({ items = [], setItems }) {
  const navigate = useNavigate();
  const [mostrarModalAgotado, setMostrarModalAgotado] = useState(false);
  const [reemplazoSeleccionado, setReemplazoSeleccionado] = useState("Empanada de pollo");

  const actualizarCantidad = (id, delta) => {
    if (!setItems) return;
    setItems(items.map(item => {
      if (item.id === id) {
        const nuevaCant = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: nuevaCant, subtotal: nuevaCant * item.precioUnitario };
      }
      return item;
    }));
  };

  const eliminarItem = (id) => {
    if (!setItems) return;
    setItems(items.filter(item => item.id !== id));
  };

  const vaciarCarrito = () => {
    if (!setItems) return;
    setItems([]);
  };

  const agregarFrecuente = (prod) => {
    if (!setItems) return;
    const nuevoId = Date.now();
    setItems([...items, {
      id: nuevoId,
      nombre: prod.nombre,
      detalles: prod.detalles,
      nota: "",
      cantidad: 1,
      precioUnitario: prod.precio,
      subtotal: prod.precio
    }]);
  };

  const handleElegirHoraRecojo = () => {
    const hayAgotados = items.some(item => item.nombre.toLowerCase().includes("empanada"));
    if (hayAgotados) {
      setMostrarModalAgotado(true);
    } else {
      navigate('/comensales/confirmacion');
    }
  };

  const handleReemplazarYContinuar = () => {
    if (setItems) {
      setItems(items.map(item => {
        if (item.nombre.toLowerCase().includes("empanada")) {
          return {
            ...item,
            nombre: reemplazoSeleccionado,
            detalles: "1 unidad",
            precioUnitario: 5.00,
            subtotal: 5.00
          };
        }
        return item;
      }));
    }
    setMostrarModalAgotado(false);
    navigate('/comensales/confirmacion');
  };

  const handleQuitarYContinuar = () => {
    if (setItems) {
      setItems(items.filter(item => !item.nombre.toLowerCase().includes("empanada")));
    }
    setMostrarModalAgotado(false);
    navigate('/comensales/confirmacion');
  };

  const calcularSubtotalGeneral = () => {
    return items.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2);
  };

  const calcularTotalItems = () => {
    return items.reduce((acc, curr) => acc + curr.cantidad, 0);
  };

  return (
    <main className="comensal-main-layout carrito-container">
      {/* BREADCRUMB */}
      <div className="carrito-breadcrumb">
        <Link to="/comensales/localescomensal" className="carrito-breadcrumb-link">Cafetería Central</Link>
        {" > "}
        <strong className="carrito-breadcrumb-current">Tu carrito</strong>
      </div>

      {items.length > 0 ? (
        <div className="carrito-grid">
          {/* COLUMNA IZQUIERDA */}
          <div className="carrito-card-left">
            <h1 className="carrito-title">Tu carrito</h1>
            <p className="carrito-subtitle">{items.length} ítems de Cafetería Central</p>
            
            <div className="carrito-alert-info">
              Todos los ítems deben ser del mismo local. Para pedir en otro local, confirma o vacía este carrito.
            </div>

            <div className="carrito-items-list">
              {items.map((item) => (
                <div key={item.id} className="carrito-item-card">
                  <div className="carrito-item-thumb" />
                  <div>
                    <h4 className="carrito-item-title">{item.nombre}</h4>
                    <p className="carrito-item-details">{item.detalles}</p>
                    {item.nota && <p className="carrito-item-note">Nota: {item.nota}</p>}
                  </div>

                  <div className="carrito-quantity-control">
                    <button className="carrito-btn-qty" onClick={() => actualizarCantidad(item.id, -1)}>-</button>
                    <span className="carrito-qty-num">{item.cantidad}</span>
                    <button className="carrito-btn-qty" onClick={() => actualizarCantidad(item.id, 1)}>+</button>
                  </div>

                  <div className="carrito-item-price-col">
                    <span className="carrito-item-price">S/ {item.subtotal.toFixed(2)}</span>
                    <button className="carrito-btn-remove" onClick={() => eliminarItem(item.id)}>Quitar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="carrito-left-footer">
              <button className="carrito-btn-secondary" onClick={() => navigate("/comensales/localescomensal")}>Seguir agregando</button>
              <button className="carrito-btn-empty" onClick={vaciarCarrito}>Vaciar carrito</button>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="carrito-card-right">
            <h3 className="carrito-summary-title">Resumen</h3>
            <div className="carrito-summary-list">
              <div className="carrito-summary-row">
                <span>Productos ({calcularTotalItems()})</span>
                <strong>S/ {Math.max(0, parseFloat(calcularSubtotalGeneral()) - 2.50).toFixed(2)}</strong>
              </div>
              <div className="carrito-summary-row">
                <span>Agregados</span>
                <strong>S/ 2.00</strong>
              </div>
              <div className="carrito-summary-row">
                <span>Empaque para llevar</span>
                <strong>S/ 0.50</strong>
              </div>
            </div>

            <div className="carrito-summary-subtotal">
              <span className="carrito-summary-subtotal-label">Subtotal</span>
              <strong className="carrito-summary-subtotal-value">S/ {calcularSubtotalGeneral()}</strong>
            </div>

            <p className="carrito-summary-disclaimer">El pago se realiza en el punto de recojo. En el siguiente paso eliges la hora.</p>

            <button className="carrito-btn-primary" onClick={handleElegirHoraRecojo}>
              Elegir hora de recojo
            </button>
          </div>
        </div>
      ) : (
        /* CARRITO VACÍO */
        <div>
          <div className="carrito-empty-box">
            <div className="carrito-empty-icon-circle">🛒</div>
            <h2 className="carrito-empty-title">Tu carrito está vacío</h2>
            <p className="carrito-empty-desc">Elige un local abierto y agrega tu primer producto para pedir con anticipación y recogerlo sin hacer cola.</p>
            <button className="carrito-btn-primary" onClick={() => navigate("/comensales/localescomensal")}>
              Ver locales abiertos
            </button>
          </div>

          <div>
            <h3 className="carrito-section-label">VUELVE A PEDIR LO DE SIEMPRE</h3>
            <div className="carrito-frecuentes-grid">
              <div className="carrito-frecuente-card">
                <div className="carrito-frecuente-info">
                  <div className="carrito-frecuente-thumb" />
                  <div>
                    <strong className="carrito-frecuente-name">Sándwich de pollo</strong>
                    <span className="carrito-frecuente-meta">Cafetería Central · S/ 9.50</span>
                  </div>
                </div>
                <button
                  className="carrito-btn-add-sm"
                  onClick={() => agregarFrecuente({ nombre: "Sándwich de pollo", detalles: "Pan francés", precio: 9.50 })}
                >
                  Agregar
                </button>
              </div>

              <div className="carrito-frecuente-card">
                <div className="carrito-frecuente-info">
                  <div className="carrito-frecuente-thumb" />
                  <div>
                    <strong className="carrito-frecuente-name">Jugo surtido</strong>
                    <span className="carrito-frecuente-meta">Cafetería Central · S/ 9.00</span>
                  </div>
                </div>
                <button
                  className="carrito-btn-add-sm"
                  onClick={() => agregarFrecuente({ nombre: "Jugo surtido", detalles: "Grande sin azúcar", precio: 9.00 })}
                >
                  Agregar
                </button>
              </div>

              <div className="carrito-frecuente-card">
                <div className="carrito-frecuente-info">
                  <div className="carrito-frecuente-thumb" />
                  <div>
                    <strong className="carrito-frecuente-name">Café pasado</strong>
                    <span className="carrito-frecuente-meta">Café de Biblioteca · S/ 4.00</span>
                  </div>
                </div>
                <button
                  className="carrito-btn-add-sm"
                  onClick={() => agregarFrecuente({ nombre: "Café pasado", detalles: "Empaque para llevar", precio: 4.00 })}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGOTADO */}
      {mostrarModalAgotado && (
        <div className="carrito-modal-overlay">
          <div className="carrito-modal-content">
            <div className="carrito-modal-header">
              <div className="carrito-modal-alert-icon">!</div>
              <div>
                <h2 className="carrito-modal-title">Un producto de tu carrito se agotó</h2>
                <p className="carrito-modal-desc">Cafetería Central marcó «Empanada de carne» como agotada. Quítala o reemplázala para continuar con tu pedido.</p>
              </div>
            </div>

            <div className="carrito-modal-item-info">
              <div className="carrito-frecuente-info">
                <div className="carrito-frecuente-thumb" />
                <div>
                  <strong style={{ fontSize: "14px", display: "block" }}>Empanada de carne</strong>
                  <span style={{ fontSize: "12px", color: "#718096" }}>1 unidad · S/ 5.00</span>
                </div>
              </div>
              <span className="carrito-badge-agotado">Agotado</span>
            </div>

            <h4 className="carrito-section-label">REEMPLAZAR POR</h4>

            <div className="carrito-modal-replacements">
              <div
                className={`carrito-replacement-card ${reemplazoSeleccionado === "Empanada de pollo" ? "selected" : ""}`}
                onClick={() => setReemplazoSeleccionado("Empanada de pollo")}
              >
                <strong style={{ fontSize: "12px", display: "block" }}>Empanada de pollo</strong>
                <span style={{ fontSize: "12px", color: "#d9381e", fontWeight: "bold" }}>S/ 5.00</span>
              </div>

              <div
                className={`carrito-replacement-card ${reemplazoSeleccionado === "Pan con palta" ? "selected" : ""}`}
                onClick={() => setReemplazoSeleccionado("Pan con palta")}
              >
                <strong style={{ fontSize: "12px", display: "block" }}>Pan con palta</strong>
                <span style={{ fontSize: "12px", color: "#718096" }}>S/ 8.50</span>
              </div>

              <div
                className={`carrito-replacement-card ${reemplazoSeleccionado === "Tostadas" ? "selected" : ""}`}
                onClick={() => setReemplazoSeleccionado("Tostadas")}
              >
                <strong style={{ fontSize: "12px", display: "block" }}>Tostadas</strong>
                <span style={{ fontSize: "12px", color: "#718096" }}>S/ 5.50</span>
              </div>
            </div>

            <div className="carrito-modal-actions">
              <button className="carrito-btn-secondary" onClick={handleQuitarYContinuar}>
                Quitar del carrito
              </button>
              <button className="carrito-btn-primary" style={{ width: "auto" }} onClick={handleReemplazarYContinuar}>
                Reemplazar y continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}