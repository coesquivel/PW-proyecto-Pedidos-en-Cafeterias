// src/pages/PedidosComensal/PedidosComensal.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerMisPedidos,
  fechaCorta,
  ETIQUETA_ESTADO,
  ESTADOS_EN_CURSO,
  repetirPedido,
} from '../../../api/pedidos';
import { mensajeDeError } from '../../../api/carta';
import './PedidosComensal.css';

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

// El estado "recibido" usa el mismo color que "en preparación"
const CLASE_ESTADO = {
  recibido: 'badge-status-preparacion',
  preparacion: 'badge-status-preparacion',
  listo: 'badge-status-listo',
  entregado: 'badge-status-entregado',
  rechazado: 'badge-status-rechazado',
};

// Cada cuánto se vuelve a pedir la lista para ver cambios de estado (ms)
const REFRESCO_MS = 15000;

export default function PedidosComensal({ setCarrito }) {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('todos');
  const [abierto, setAbierto] = useState(null); // id del pedido con el detalle desplegado
  const [repitiendo, setRepitiendo] = useState(null); // id del pedido que se está repitiendo

  // Vuelve a poner en el carrito lo que pediste. Si el carrito es de otro local, se ofrece vaciarlo.
  const handleRepetir = async (pedido) => {
    setRepitiendo(pedido.id);
    setError('');

    try {
      let resultado;
      try {
        resultado = await repetirPedido(pedido.id);
      } catch (e) {
        if (e?.response?.data?.error !== 'CART_OTHER_STORE') throw e;
        if (!window.confirm(`${e.response.data.message}.\n\n¿Vaciar el carrito y repetir este pedido?`)) return;
        resultado = await repetirPedido(pedido.id, true);
      }

      setCarrito(resultado.cart);
      if (resultado.skipped.length > 0) {
        window.alert(`No se pudo agregar (ya no disponible): ${resultado.skipped.join(', ')}.`);
      }
      navigate('/comensales/carrito');
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo repetir el pedido.'));
    } finally {
      setRepitiendo(null);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargar = () =>
      obtenerMisPedidos()
        .then((lista) => {
          if (!activo) return;
          setPedidos(lista);
          setError('');
        })
        .catch((e) => activo && setError(mensajeDeError(e, 'No se pudieron cargar tus pedidos.')))
        .finally(() => activo && setCargando(false));

    cargar();
    const temporizador = setInterval(cargar, REFRESCO_MS);

    return () => {
      activo = false;
      clearInterval(temporizador);
    };
  }, []);

  // Locales distintos de los que hay pedidos, para el filtro
  const locales = [];
  pedidos.forEach((p) => {
    if (!locales.some((l) => l.id === p.store.id)) locales.push(p.store);
  });

  const visibles = pedidos.filter((p) => filtroLocal === 'todos' || String(p.store.id) === filtroLocal);
  const enCurso = visibles.filter((p) => ESTADOS_EN_CURSO.includes(p.status));
  const historicos = visibles.filter((p) => !ESTADOS_EN_CURSO.includes(p.status));

  const tarjeta = (p) => {
    const esListo = p.status === 'listo';
    const esEntregado = p.status === 'entregado';
    const desplegado = abierto === p.id;

    return (
      <div key={p.id}>
        <div className={`pedido-row-card ${esListo ? 'pedido-row-card--listo' : ''}`}>
          <div className="pedido-info-block">
            <div className="pedido-title-code" style={{ minWidth: "180px" }}>
              <h3>{p.store.name}</h3>
              <span>{p.code}</span>
            </div>
            <div className="pedido-meta-item">
              <label>RECOJO</label>
              <span>{p.pickup_time}</span>
            </div>
            <div className="pedido-meta-item">
              <label>FECHA</label>
              <span>{fechaCorta(p.pickup_date)}</span>
            </div>
            <div className="pedido-meta-item">
              <label>ÍTEMS</label>
              <span>{p.items_count} {p.items_count === 1 ? 'producto' : 'productos'}</span>
            </div>
            <div className="pedido-meta-item">
              <label>TOTAL</label>
              <span>{soles(p.total)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className={`badge-status-pill ${CLASE_ESTADO[p.status]}`}>
              {ETIQUETA_ESTADO[p.status]}
            </span>
            <button
              className="btn-secondary-action"
              style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px" }}
              onClick={() => setAbierto(desplegado ? null : p.id)}
            >
              {desplegado ? 'Ocultar detalle' : 'Ver detalle'}
            </button>
            {(p.status === 'entregado' || p.status === 'rechazado') && (
              <button
                className="btn-secondary-action"
                style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px" }}
                disabled={repitiendo === p.id}
                onClick={() => handleRepetir(p)}
              >
                {repitiendo === p.id ? 'Agregando...' : 'Repetir pedido'}
              </button>
            )}
            {esEntregado && p.reviewed && (
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Calificado ✓</span>
            )}
            {esEntregado && !p.reviewed && (
              <button
                className="btn-primary-action"
                style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px", background: "#5B9B2E" }}
                onClick={() => navigate(`/comensales/calificaciones?pedido=${p.id}`)}
              >
                Calificar
              </button>
            )}
          </div>
        </div>

        {desplegado && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "12px 16px", margin: "-4px 0 12px 0", fontSize: "13px" }}>
            {esListo && (
              <p style={{ margin: "0 0 8px 0", color: "var(--text-muted)" }}>
                Tu pedido está listo. Dicta el código <strong>{p.code}</strong> en el mostrador para recoger y pagar.
              </p>
            )}
            {p.items.map((i) => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>
                  {i.quantity} × {i.name}
                  {i.options && i.options.length > 0 && <span style={{ color: "var(--text-muted)" }}> · {i.options.map((o) => o.name).join(', ')}</span>}
                  {i.notes && <span style={{ color: "var(--text-muted)" }}> · Nota: {i.notes}</span>}
                </span>
                <strong>{soles(i.subtotal)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="pedidos-layout">
      <div className="pedidos-header-row">
        <div>
          <h1 className="locales-title">Mis pedidos</h1>
          <p className="locales-subtitle">
            {enCurso.length} {enCurso.length === 1 ? 'pedido en curso' : 'pedidos en curso'} · {historicos.length} en el histórico
          </p>
        </div>
        <select
          className="filter-dropdown"
          value={filtroLocal}
          onChange={(e) => setFiltroLocal(e.target.value)}
        >
          <option value="todos">Local: todos</option>
          {locales.map((l) => (
            <option key={l.id} value={String(l.id)}>{l.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert-obligatorio">{error}</div>}
      {cargando && <p className="locales-subtitle">Cargando tus pedidos...</p>}

      {!cargando && pedidos.length === 0 && !error && (
        <p className="locales-subtitle">
          Aún no tienes pedidos. Elige un local y haz tu primer pedido.
        </p>
      )}

      {/* SECCIÓN EN CURSO */}
      {enCurso.length > 0 && (
        <>
          <div className="section-label-group">EN CURSO · {enCurso.length}</div>
          {enCurso.map(tarjeta)}
        </>
      )}

      {/* SECCIÓN HISTÓRICOS */}
      {historicos.length > 0 && (
        <>
          <div className="section-label-group section-label-group--muted" style={{ marginTop: "32px" }}>
            HISTÓRICOS
          </div>
          {historicos.map(tarjeta)}
        </>
      )}
    </main>
  );
}
