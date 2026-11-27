// src/pages/PagesComensal/CalificacionesComensal/CalificacionesComensal.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { obtenerMisPedidos, fechaCorta } from '../../../api/pedidos';
import { enviarCalificacion, obtenerMisCalificaciones } from '../../../api/resenas';
import { mensajeDeError } from '../../../api/carta';
import './CalificacionesComensal.css';

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

function CalificarPedido({ idPedido }) {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [estrellasLocal, setEstrellasLocal] = useState(5);
  const [comentarioLocal, setComentarioLocal] = useState('');
  const [productos, setProductos] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // El pedido a calificar se toma de "Mis pedidos"; los productos se agrupan (una línea por producto)
  useEffect(() => {
    obtenerMisPedidos()
      .then((pedidos) => {
        const encontrado = pedidos.find((p) => p.id === idPedido);
        setPedido(encontrado || null);

        if (encontrado) {
          const porProducto = new Map();
          encontrado.items.forEach((item) => {
            if (!item.product_id) return;
            const actual = porProducto.get(item.product_id);
            if (actual) {
              actual.cantidad += item.quantity;
              actual.precio += item.subtotal;
            } else {
              porProducto.set(item.product_id, {
                id: item.product_id,
                nombre: item.name,
                cantidad: item.quantity,
                precio: item.subtotal,
                estrellas: 5,
                comentario: '',
              });
            }
          });
          setProductos([...porProducto.values()]);
        }
      })
      .catch(() => setPedido(null))
      .finally(() => setCargando(false));
  }, [idPedido]);

  const actualizarProducto = (id, campo, valor) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  const handleEnviar = async () => {
    if (enviando || enviado) return;
    setEnviando(true);
    setError('');
    try {
      await enviarCalificacion(pedido.id, {
        store_rating: estrellasLocal,
        comment: comentarioLocal,
        products: productos.map((p) => ({ product_id: p.id, rating: p.estrellas, comment: p.comentario })),
      });
      setEnviado(true);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo enviar la calificación. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return <main className="comensal-main-layout calificaciones-container"><p className="calif-subtitle">Cargando pedido…</p></main>;
  }

  // Calificación enviada: pantalla de confirmación (antes el formulario volvía a mostrarse con el botón activo)
  if (enviado) {
    return (
      <main className="comensal-main-layout calificaciones-container">
        <div className="calif-card calif-card--centrado">
          <h2 className="locales-title" style={{ fontSize: '22px' }}>¡Calificación enviada!</h2>
          <p className="locales-subtitle" style={{ marginBottom: '24px' }}>
            Gracias por calificar tu pedido {pedido.code}. Tu opinión ayuda a otros comensales.
          </p>
          <div className="calif-actions" style={{ justifyContent: 'center' }}>
            <button className="btn-secondary-action" onClick={() => navigate('/comensales/pedidos')}>
              Volver a mis pedidos
            </button>
            <button className="btn-primary-action" onClick={() => navigate('/comensales/calificaciones')}>
              Ver mis calificaciones
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!pedido || pedido.status !== 'entregado' || pedido.reviewed) {
    return (
      <main className="comensal-main-layout calificaciones-container">
        <div className="calif-card calif-card--centrado">
          <h2 className="locales-title" style={{ fontSize: '22px' }}>
            {pedido?.reviewed ? 'Ya calificaste este pedido' : 'No puedes calificar este pedido'}
          </h2>
          <p className="locales-subtitle" style={{ marginBottom: '24px' }}>
            Solo se pueden calificar tus pedidos entregados, una sola vez.
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
        Mis calificaciones <span className="calif-breadcrumbs-sep">›</span> <span>Calificar {pedido.code}</span>
      </div>

      <h1 className="calif-title">Califica tu pedido</h1>
      <p className="calif-subtitle">
        {pedido.code} · {pedido.store.name} · recojo {fechaCorta(pedido.pickup_date)} a las {pedido.pickup_time}
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

      {error && <div className="alert-obligatorio" role="alert">{error}</div>}

      {/* ACCIONES */}
      <div className="calif-actions">
        <button className="btn-secondary-action" onClick={() => navigate('/comensales/pedidos')}>
          Calificar después
        </button>
        <button className="btn-primary-action" onClick={handleEnviar} disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar calificación'}
        </button>
      </div>
    </main>
  );
}
// Lista de lo que el comensal ya calificó (con la respuesta del local) y de los pedidos pendientes de calificar
function MisCalificaciones() {
  const navigate = useNavigate();
  const [calificaciones, setCalificaciones] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([obtenerMisCalificaciones(), obtenerMisPedidos()])
      .then(([hechas, pedidos]) => {
        setCalificaciones(hechas);
        setPendientes(pedidos.filter((p) => p.status === 'entregado' && !p.reviewed));
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="comensal-main-layout calificaciones-container">
      <h1 className="calif-title">Mis calificaciones</h1>
      <p className="calif-subtitle">Lo que opinaste de tus pedidos y las respuestas de los locales.</p>

      {cargando && <p className="calif-subtitle">Cargando…</p>}

      {pendientes.length > 0 && (
        <>
          <label className="calif-label calif-section-label">Pendientes de calificar</label>
          {pendientes.map((p) => (
            <div key={p.id} className="calif-product-row">
              <div className="calif-product-info">
                <h4>{p.code} · {p.store.name}</h4>
                <p>Recojo {fechaCorta(p.pickup_date)} · S/ {p.total.toFixed(2)}</p>
              </div>
              <button className="btn-primary-action" onClick={() => navigate(`/comensales/calificaciones?pedido=${p.id}`)}>
                Calificar
              </button>
            </div>
          ))}
        </>
      )}

      <label className="calif-label calif-section-label">Ya calificados</label>
      {!cargando && calificaciones.length === 0 && (
        <div className="calif-card"><p className="calif-subtitle" style={{ margin: 0 }}>Aún no has calificado ningún pedido.</p></div>
      )}
      {calificaciones.map((c) => (
        <section key={c.id} className="calif-card">
          <h4 style={{ margin: 0 }}>{c.order_code} · {c.store.name}</h4>
          <p className="calif-subtitle" style={{ margin: '4px 0 8px' }}>{fechaCorta(c.date)}</p>
          <Estrellas valor={c.rating} onChange={() => {}} size="lg" />
          {c.comment && <p style={{ margin: '8px 0 0' }}>{c.comment}</p>}
          {c.products.map((p) => (
            <p key={p.product_id} className="calif-subtitle" style={{ margin: '6px 0 0' }}>
              {p.name}: {'★'.repeat(p.rating)}{'☆'.repeat(5 - p.rating)}{p.comment ? ` · ${p.comment}` : ''}
            </p>
          ))}
          {c.reply && (
            <p style={{ margin: '12px 0 0', padding: '10px 12px', background: '#FCEAE7', borderRadius: '8px' }}>
              <strong>Respuesta de {c.store.name}:</strong> {c.reply}
            </p>
          )}
        </section>
      ))}
    </main>
  );
}

// Con ?pedido=ID se califica ese pedido; sin parámetro se muestra el historial
export default function CalificacionesComensal() {
  const [params] = useSearchParams();
  const idPedido = Number(params.get('pedido'));

  return idPedido ? <CalificarPedido idPedido={idPedido} /> : <MisCalificaciones />;
}
