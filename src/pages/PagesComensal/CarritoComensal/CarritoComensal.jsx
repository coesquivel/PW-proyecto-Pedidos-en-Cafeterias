// src/pages/CarritoComensal/CarritoComensal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CarritoComensal.css';

export default function CarritoComensal({ items = [], setItems }) {
  const navigate = useNavigate();
  const [productoAgotadoModal, setProductoAgotadoModal] = useState(false);

  const subtotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const costoAgregados = items.length > 0 ? 2.00 : 0;
  const costoEmpaque = items.length > 0 ? 0.50 : 0;
  const totalGeneral = subtotal + costoAgregados + costoEmpaque;

  const handleCambiarCantidad = (id, cambio) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nuevaCant = item.cantidad + cambio;
          if (nuevaCant <= 0) return null;
          return { ...item, cantidad: nuevaCant, subtotal: nuevaCant * item.precioUnitario };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const handleVaciarCarrito = () => {
    setItems([]);
  };

  // VISTA CARRITO VACÍO
  if (items.length === 0) {
    return (
      <main className="carrito-layout">
        <div className="cart-card-container" style={{ textAlign: "center", padding: "48px 20px", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ width: "48px", height: "48px", background: "var(--primary-soft)", border: "1px solid var(--primary-soft)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--primary)", fontSize: "20px" }}>
            🛒
          </div>
          <h2 className="locales-title" style={{ fontSize: "22px" }}>Tu carrito está vacío</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            Elige un local abierto y agrega tu primer producto para pedir con anticipación y recogerlo sin hacer cola.
          </p>
          <button className="btn-primary-action" onClick={() => navigate('/comensales/localescomensal')}>
            Ver locales abiertos
          </button>
        </div>

        {/* VUELVE A PEDIR LO DE SIEMPRE */}
        <div style={{ marginTop: "40px" }}>
          <label className="field-label" style={{ display: "block", marginBottom: "12px" }}>VUELVE A PEDIR LO DE SIEMPRE</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { id: 101, nombre: "Sándwich de pollo", local: "Cafetería Central · S/ 9.50" },
              { id: 102, nombre: "Menú ejecutivo", local: "Menú Universitario N · S/ 14.00" },
              { id: 103, nombre: "Café pasado", local: "Café de Biblioteca · S/ 3.50" }
            ].map((p) => (
              <div key={p.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", background: "repeating-linear-gradient(-45deg, #FCEAE7, #FCEAE7 5px, #EFE2DC 5px, #EFE2DC 10px)", borderRadius: "8px" }}></div>
                  <div>
                    <h5 className="product-title" style={{ fontSize: "14px", margin: 0 }}>{p.nombre}</h5>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{p.local}</span>
                  </div>
                </div>
                <button className="btn-primary-action" style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px" }}>Agregar</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // VISTA CARRITO CON ÍTEMS (3.4)
  return (
    <main className="carrito-layout">
      <div className="breadcrumbs">
        Cafetería Central &gt; <span>Tu carrito</span>
      </div>

      <h1 className="locales-title">Tu carrito</h1>
      <p className="locales-subtitle" style={{ marginBottom: "16px" }}>
        {items.length} items de Cafetería Central
      </p>

      <div className="carrito-grid-main">
        <div>
          <div className="info-banner-local">
            <i>i</i> Todos los ítems deben ser del mismo local. Para pedir en otro local, confirma o vacía este carrito.
          </div>

          <div className="cart-card-container">
            {items.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-left">
                  <div className="cart-item-thumb"></div>
                  <div className="cart-item-info">
                    <h4>{item.nombre}</h4>
                    <p>{item.detalles}</p>
                    {item.nota && <p className="nota-text">Nota: {item.nota}</p>}
                  </div>
                </div>

                <div className="cart-item-right">
                  <div className="counter-box">
                    <button onClick={() => handleCambiarCantidad(item.id, -1)}>-</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => handleCambiarCantidad(item.id, 1)}>+</button>
                  </div>
                  <span className="price-text" style={{ minWidth: "70px", textAlign: "right" }}>
                    S/ {item.subtotal.toFixed(2)}
                  </span>
                  <button className="btn-link-danger" onClick={() => handleCambiarCantidad(item.id, -item.cantidad)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <button className="btn-secondary-action" onClick={() => navigate('/comensales/localescomensal')}>
                Seguir agregando
              </button>
              <button className="btn-link-danger" onClick={handleVaciarCarrito}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>

        {/* RESUMEN LATERAL */}
        <div className="resumen-card-side">
          <h3>Resumen</h3>
          <div className="resumen-line">
            <span>Productos ({items.reduce((a, b) => a + b.cantidad, 0)})</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="resumen-line">
            <span>Agregados</span>
            <span>S/ {costoAgregados.toFixed(2)}</span>
          </div>
          <div className="resumen-line">
            <span>Empaque para llevar</span>
            <span>S/ {costoEmpaque.toFixed(2)}</span>
          </div>

          <div className="resumen-line resumen-line--total">
            <span>Subtotal</span>
            <span>S/ {totalGeneral.toFixed(2)}</span>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "16px 0", lineHeight: "1.4" }}>
            El pago se realiza en el punto de recojo. En el siguiente paso eliges la hora.
          </p>

          <button
            className="btn-primary-action"
            style={{ width: "100%" }}
            onClick={() => {
              if (items.some(i => i.nombre.includes("Empanada"))) {
                setProductoAgotadoModal(true);
              } else {
                navigate('/comensales/confirmacion');
              }
            }}
          >
            Elegir hora de recojo
          </button>
        </div>
      </div>

      {/* MODAL AVISO PRODUCTO AGOTADO */}
      {productoAgotadoModal && (
        <div className="modal-overlay">
          <div className="modal-detalle-card" style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", background: "#FDF6E2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#B7791F", fontWeight: "bold", fontSize: "20px" }}>!</div>
              <div>
                <h3 className="section-title" style={{ margin: 0 }}>Un producto de tu carrito se agotó</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
                  Cafetería Central marcó «Empanada de carne» como agotada. Quítala o reemplázala para continuar con tu pedido.
                </p>
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "40px", height: "40px", background: "repeating-linear-gradient(-45deg, #FCEAE7, #FCEAE7 5px, #EFE2DC 5px, #EFE2DC 10px)", borderRadius: "6px" }}></div>
                <div>
                  <h5 className="product-title" style={{ fontSize: "14px", margin: 0 }}>Empanada de carne</h5>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>1 unidad · S/ 5.00</span>
                </div>
              </div>
              <span className="status-pill pill-closed">Agotado</span>
            </div>

            <label className="field-label" style={{ display: "block", marginBottom: "8px" }}>REEMPLAZAR POR</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
              <div style={{ background: "var(--primary-soft)", border: "1px solid var(--primary)", borderRadius: "var(--radius-container)", padding: "10px", cursor: "pointer" }}>
                <strong style={{ fontSize: "13px", display: "block" }}>Empanada de pollo</strong>
                <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "bold" }}>S/ 5.00</span>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "10px", cursor: "pointer" }}>
                <strong style={{ fontSize: "13px", display: "block" }}>Pan con palta</strong>
                <span style={{ fontSize: "12px", color: "var(--text)" }}>S/ 8.50</span>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "10px", cursor: "pointer" }}>
                <strong style={{ fontSize: "13px", display: "block" }}>Tostadas</strong>
                <span style={{ fontSize: "12px", color: "var(--text)" }}>S/ 5.50</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="btn-secondary-action" onClick={() => setProductoAgotadoModal(false)}>Quitar del carrito</button>
              <button className="btn-primary-action" onClick={() => { setProductoAgotadoModal(false); navigate('/comensales/confirmacion'); }}>Reemplazar y continuar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}