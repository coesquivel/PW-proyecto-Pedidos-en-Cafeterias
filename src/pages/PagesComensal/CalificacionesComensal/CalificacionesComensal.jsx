// src/pages/PagesComensal/CalificacionesComensal/CalificacionesComensal.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CalificacionesComensal.css';

// Datos de ejemplo del pedido a calificar (luego vendrán del backend)
const pedido = {
  codigo: 'PED-4790',
  local: 'Sanguchería del pabellón E',
  fechaEntrega: '12/09/2026',
  horaEntrega: '12:04',
};

const productosIniciales = [
  { id: 1, nombre: 'Sándwich de pollo deshilachado', cantidad: 2, precio: 19.00, estrellas: 5, comentario: '' },
  { id: 2, nombre: 'Chicha morada', cantidad: 1, precio: 4.50, estrellas: 3, comentario: 'Estaba poco fría.' },
];

function Estrellas({ valor, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);

  return (
    <div className={`rating-stars rating-stars--${size}`} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`rating-star ${n <= (hover || valor) ? 'rating-star--on' : ''}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} de 5`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function CalificacionesComensal() {
  const navigate = useNavigate();
  const [estrellasLocal, setEstrellasLocal] = useState(4);
  const [comentarioLocal, setComentarioLocal] = useState('');
  const [productos, setProductos] = useState(productosIniciales);
  const [enviado, setEnviado] = useState(false);

  const actualizarProducto = (id, campo, valor) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  const handleEnviar = () => {
    // Aquí se enviará la calificación al backend
    console.log({ pedido: pedido.codigo, estrellasLocal, comentarioLocal, productos });
    setEnviado(true);
  };

  if (enviado) {
    return (
      <main className="comensal-main-layout calificaciones-container">
        <div className="calif-card calif-card--centrado">
          <h2 className="locales-title" style={{ fontSize: '22px' }}>¡Gracias por tu calificación!</h2>
          <p className="locales-subtitle" style={{ marginBottom: '24px' }}>
            Tu opinión ayuda a {pedido.local} a mejorar su atención.
          </p>
          <button className="btn-primary-action" onClick={() => navigate('/comensales/pedidos')}>
            Volver a mis pedidos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="comensal-main-layout calificaciones-container">
      <div className="calif-breadcrumbs">
        Mis calificaciones <span className="calif-breadcrumbs-sep">›</span> <span>Calificar {pedido.codigo}</span>
      </div>

      <h1 className="calif-title">Califica tu pedido</h1>
      <p className="calif-subtitle">
        {pedido.codigo} · {pedido.local} · entregado el {pedido.fechaEntrega} a las {pedido.horaEntrega}
      </p>

      {/* CALIFICACIÓN DEL LOCAL */}
      <section className="calif-card">
        <label className="calif-label">El local</label>
        <div className="calif-local-row">
          <Estrellas valor={estrellasLocal} onChange={setEstrellasLocal} size="lg" />
          <span className="calif-local-score">{estrellasLocal} de 5</span>
          <span className="calif-local-hint">Puntualidad del recojo y atención en el mostrador.</span>
        </div>
        <textarea
          className="calif-textarea"
          placeholder="Cuéntanos cómo fue tu recojo (opcional)..."
          value={comentarioLocal}
          onChange={(e) => setComentarioLocal(e.target.value)}
        />
      </section>

      {/* CALIFICACIÓN DE PRODUCTOS */}
      <label className="calif-label calif-section-label">Los productos que consumiste</label>
      {productos.map((p) => (
        <div key={p.id} className="calif-product-row">
          <div className="calif-product-left">
            <div className="calif-product-thumb"></div>
            <div className="calif-product-info">
              <h4>{p.nombre}</h4>
              <p>
                {p.cantidad} {p.cantidad === 1 ? 'unidad' : 'unidades'} · S/ {p.precio.toFixed(2)}
              </p>
            </div>
          </div>
          <Estrellas valor={p.estrellas} onChange={(n) => actualizarProducto(p.id, 'estrellas', n)} />
          <input
            type="text"
            className="calif-input"
            placeholder="Comentario opcional..."
            value={p.comentario}
            onChange={(e) => actualizarProducto(p.id, 'comentario', e.target.value)}
          />
        </div>
      ))}

      {/* ACCIONES */}
      <div className="calif-actions">
        <button className="btn-secondary-action" onClick={() => navigate('/comensales/pedidos')}>
          Calificar después
        </button>
        <button className="btn-primary-action" onClick={handleEnviar}>
          Enviar calificación
        </button>
      </div>
    </main>
  );
}