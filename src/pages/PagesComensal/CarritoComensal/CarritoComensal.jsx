// src/pages/CarritoComensal/CarritoComensal.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerCarrito,
  cambiarCantidadCarrito,
  quitarDelCarrito,
  vaciarCarrito,
} from '../../../api/pedidos';
import { mensajeDeError } from '../../../api/carta';
import './CarritoComensal.css';

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

export default function CarritoComensal({ carrito, setCarrito }) {
  const navigate = useNavigate();
  const [productoAgotadoModal, setProductoAgotadoModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');

  const items = carrito.items;
  const agotados = items.filter((i) => !i.available);
  const nombreLocal = carrito.store ? carrito.store.name : '';

  // Al entrar se vuelve a pedir el carrito para ver precios y disponibilidad al día
  useEffect(() => {
    obtenerCarrito()
      .then(setCarrito)
      .catch((e) => setError(mensajeDeError(e, 'No se pudo cargar tu carrito.')))
      .finally(() => setCargando(false));
  }, [setCarrito]);

  // Ejecuta una llamada que devuelve el carrito actualizado
  const actualizar = async (llamada, mensajeError) => {
    setOcupado(true);
    setError('');
    try {
      setCarrito(await llamada());
    } catch (e) {
      setError(mensajeDeError(e, mensajeError));
    } finally {
      setOcupado(false);
    }
  };

  const handleCambiarCantidad = (item, cambio) => {
    const nueva = item.quantity + cambio;
    if (nueva < 1) return handleQuitar(item);
    return actualizar(() => cambiarCantidadCarrito(item.id, nueva), 'No se pudo cambiar la cantidad.');
  };

  const handleQuitar = (item) =>
    actualizar(() => quitarDelCarrito(item.id), 'No se pudo quitar el producto.');

  const handleVaciarCarrito = () =>
    actualizar(() => vaciarCarrito(), 'No se pudo vaciar el carrito.');

  // Quita del carrito los productos que el local marcó como agotados
  const handleQuitarAgotados = async () => {
    setOcupado(true);
    setError('');
    try {
      let actual = carrito;
      for (const item of agotados) {
        actual = await quitarDelCarrito(item.id);
      }
      setCarrito(actual);
      setProductoAgotadoModal(false);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudieron quitar los productos agotados.'));
    } finally {
      setOcupado(false);
    }
  };

  const handleContinuar = () => {
    if (agotados.length > 0) {
      setProductoAgotadoModal(true);
    } else {
      navigate('/comensales/confirmacion');
    }
  };

  if (cargando && items.length === 0) {
    return (
      <main className="carrito-layout">
        <p className="locales-subtitle">Cargando tu carrito...</p>
      </main>
    );
  }

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
          {error && <div className="alert-obligatorio">{error}</div>}
          <button className="btn-primary-action" onClick={() => navigate('/comensales/localescomensal')}>
            Ver locales abiertos
          </button>
        </div>
      </main>
    );
  }

  // VISTA CARRITO CON ÍTEMS (3.4)
  return (
    <main className="carrito-layout">
      <div className="breadcrumbs">
        {nombreLocal} &gt; <span>Tu carrito</span>
      </div>

      <h1 className="locales-title">Tu carrito</h1>
      <p className="locales-subtitle" style={{ marginBottom: "16px" }}>
        {carrito.count} {carrito.count === 1 ? 'producto' : 'productos'} de {nombreLocal}
      </p>

      {error && <div className="alert-obligatorio" style={{ marginBottom: "12px" }}>{error}</div>}

      <div className="carrito-grid-main">
        <div>
          <div className="info-banner-local">
            <i>i</i> Todos los ítems deben ser del mismo local. Para pedir en otro local, confirma o vacía este carrito.
          </div>

          <div className="cart-card-container">
            {items.map((item) => (
              <div key={item.id} className="cart-item-row" style={item.available ? undefined : { opacity: 0.6 }}>
                <div className="cart-item-left">
                  <div className="cart-item-thumb"></div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>
                      {soles(item.price)} c/u
                      {!item.available && ' · Agotado'}
                    </p>
                    {item.options && item.options.length > 0 && <p className="nota-text">{item.options.map((o) => o.name).join(', ')}</p>}
                    {item.notes && <p className="nota-text">Nota: {item.notes}</p>}
                  </div>
                </div>

                <div className="cart-item-right">
                  <div className="counter-box">
                    <button disabled={ocupado} onClick={() => handleCambiarCantidad(item, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button disabled={ocupado} onClick={() => handleCambiarCantidad(item, 1)}>+</button>
                  </div>
                  <span className="price-text" style={{ minWidth: "70px", textAlign: "right" }}>
                    {soles(item.subtotal)}
                  </span>
                  <button className="btn-link-danger" disabled={ocupado} onClick={() => handleQuitar(item)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <button className="btn-secondary-action" onClick={() => navigate('/comensales/localescomensal')}>
                Seguir agregando
              </button>
              <button className="btn-link-danger" disabled={ocupado} onClick={handleVaciarCarrito}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>

        {/* RESUMEN LATERAL */}
        <div className="resumen-card-side">
          <h3>Resumen</h3>
          <div className="resumen-line">
            <span>Productos ({carrito.count})</span>
            <span>{soles(carrito.total)}</span>
          </div>

          <div className="resumen-line resumen-line--total">
            <span>Total</span>
            <span>{soles(carrito.total)}</span>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "16px 0", lineHeight: "1.4" }}>
            El pago se realiza en el punto de recojo. En el siguiente paso eliges la hora.
          </p>

          <button
            className="btn-primary-action"
            style={{ width: "100%" }}
            disabled={ocupado}
            onClick={handleContinuar}
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
                <h3 className="section-title" style={{ margin: 0 }}>
                  {agotados.length === 1 ? 'Un producto de tu carrito se agotó' : 'Algunos productos de tu carrito se agotaron'}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
                  {nombreLocal} los marcó como agotados. Quítalos para continuar con tu pedido.
                </p>
              </div>
            </div>

            {agotados.map((item) => (
              <div key={item.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <h5 className="product-title" style={{ fontSize: "14px", margin: 0 }}>{item.name}</h5>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} · {soles(item.subtotal)}</span>
                </div>
                <span className="status-pill pill-closed">Agotado</span>
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn-secondary-action" onClick={() => setProductoAgotadoModal(false)}>Cerrar</button>
              <button className="btn-primary-action" disabled={ocupado} onClick={handleQuitarAgotados}>Quitar del carrito</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
