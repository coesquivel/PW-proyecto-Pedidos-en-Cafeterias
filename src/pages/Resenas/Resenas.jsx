
import React, { useMemo, useState, useEffect } from 'react';
import './Resenas.css';

const RESENAS_INICIALES = [
  {
    id: 1,
    autor: 'María Fernanda',
    iniciales: 'MF',
    avatarColor: 'rose',
    fecha: '2026-10-10',
    pedido: '#4587',
    calificacion: 5,
    producto: 'Sándwich de pollo deshilachado',
    comentario: 'Llegó rápido y estaba muy rico. El pan estaba fresco.',
    respuesta: null,
  },
  {
    id: 2,
    autor: 'Diego R.',
    iniciales: 'DR',
    avatarColor: 'blue',
    fecha: '2026-10-08',
    pedido: '#4562',
    calificacion: 4,
    producto: 'Latte + croissant',
    comentario: 'Buen sabor, aunque el café llegó un poco tibio.',
    respuesta: null,
  },
  {
    id: 3,
    autor: 'Valeria P.',
    iniciales: 'VP',
    avatarColor: 'mint',
    fecha: '2026-09-20',
    pedido: '#4510',
    calificacion: 1,
    producto: 'Ensalada César',
    comentario: 'El pedido tardó más de lo esperado.',
    respuesta: null,
  },
];

const FORMATEAR_FECHA = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const renderEstrellas = (rating) =>
  '★'.repeat(rating) + '☆'.repeat(5 - rating);

export default function Resenas() {
  const [resenas, setResenas] = useState(RESENAS_INICIALES);
  const [filtroEstrellas, setFiltroEstrellas] = useState('todas');
  const [filtroTiempo, setFiltroTiempo] = useState('30_dias');
  const [busqueda, setBusqueda] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [resenaSeleccionada, setResenaSeleccionada] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [toastMensaje, setToastMensaje] = useState('');

  useEffect(() => {
    if (!toastMensaje) return undefined;

    const temporizador = window.setTimeout(
      () => setToastMensaje(''),
      3000
    );

    return () => window.clearTimeout(temporizador);
  }, [toastMensaje]);

  const resenasFiltradas = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    let fechaLimite = null;

    if (filtroTiempo === '7_dias') {
      fechaLimite = new Date(hoy);
      fechaLimite.setDate(fechaLimite.getDate() - 6);
      fechaLimite.setHours(0, 0, 0, 0);
    } else if (filtroTiempo === '30_dias') {
      fechaLimite = new Date(hoy);
      fechaLimite.setDate(fechaLimite.getDate() - 29);
      fechaLimite.setHours(0, 0, 0, 0);
    }

    const consulta = busqueda.trim().toLocaleLowerCase('es');

    return resenas.filter((resena) => {
      if (
        filtroEstrellas === '5' &&
        resena.calificacion !== 5
      ) return false;

      if (
        filtroEstrellas === '4' &&
        resena.calificacion !== 4
      ) return false;

      if (
        filtroEstrellas === '3_o_menos' &&
        resena.calificacion > 3
      ) return false;

      if (fechaLimite) {
        const fechaResena = new Date(`${resena.fecha}T12:00:00`);

        if (
          Number.isNaN(fechaResena.getTime()) ||
          fechaResena < fechaLimite ||
          fechaResena > hoy
        ) return false;
      }

      if (consulta) {
        const coincide = [
          resena.autor,
          resena.producto,
          resena.comentario,
          resena.pedido,
          resena.respuesta || '',
        ].some((valor) =>
          valor.toLocaleLowerCase('es').includes(consulta)
        );

        if (!coincide) return false;
      }

      return true;
    });
  }, [resenas, filtroEstrellas, filtroTiempo, busqueda]);

  const totalResenas = resenas.length;

  const promedio = totalResenas
    ? resenas.reduce((suma, r) => suma + r.calificacion, 0) /
      totalResenas
    : 0;

  const distribucion = [5, 4, 3, 2, 1].map((estrellas) => {
    const cantidad = resenas.filter(
      (r) => r.calificacion === estrellas
    ).length;

    return {
      estrellas,
      cantidad,
      porcentaje: totalResenas
        ? Math.round((cantidad / totalResenas) * 100)
        : 0,
    };
  });

  const abrirModal = (resena) => {
    setResenaSeleccionada(resena);
    setTextoRespuesta(resena.respuesta || '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setResenaSeleccionada(null);
    setTextoRespuesta('');
  };

  const enviarRespuesta = (e) => {
    e.preventDefault();

    if (!textoRespuesta.trim() || !resenaSeleccionada) return;

    setResenas((anteriores) =>
      anteriores.map((resena) =>
        resena.id === resenaSeleccionada.id
          ? { ...resena, respuesta: textoRespuesta.trim() }
          : resena
      )
    );

    cerrarModal();
    setToastMensaje('Respuesta guardada correctamente');
  };

  const descargarReporte = () => {
    const columnas = [
      'ID',
      'Autor',
      'Fecha',
      'Pedido',
      'Calificacion',
      'Producto',
      'Comentario',
      'Respuesta',
    ];

    const escaparCSV = (valor) =>
      `"${String(valor ?? '').replace(/"/g, '""')}"`;

    const filas = resenasFiltradas.map((r) => [
      r.id,
      r.autor,
      r.fecha,
      r.pedido,
      r.calificacion,
      r.producto,
      r.comentario,
      r.respuesta || '',
    ]);

    const contenido = '\uFEFF' + [
      columnas,
      ...filas,
    ].map((fila) => fila.map(escaparCSV).join(';')).join('\r\n');

    const archivo = new Blob([contenido], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = 'reporte-resenas.csv';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);

    setToastMensaje('Reporte descargado correctamente');
  };

  return (
    <main className="reviews-main">
      <div className="reviews-content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">Local &gt; Reseñas</div>
            <h1>Reseñas de clientes</h1>
            <p className="subtitle">
              Opiniones sobre los pedidos de tu cafetería
            </p>
          </div>

          <button
            type="button"
            className="button-primary download-button"
            onClick={descargarReporte}
          >
            <span className="download-icon" aria-hidden="true">⤓</span>
            Descargar reporte
          </button>
        </div>

        <section className="overview-grid" aria-label="Resumen de calificaciones">
          <div className="panel rating-summary">
            <div className="rating-number">{promedio.toFixed(1)}</div>

            <div className="rating-details">
              <div className="big-stars" aria-label={`${promedio.toFixed(1)} de 5 estrellas`}>
                {'★'.repeat(Math.round(promedio))}
                <span>{'★'.repeat(5 - Math.round(promedio))}</span>
              </div>
              <div className="rating-out-of">de 5.0</div>
              <div className="rating-count">
                {totalResenas} {totalResenas === 1 ? 'reseña' : 'reseñas'}
              </div>
            </div>
          </div>

          <div className="panel distribution">
            {distribucion.map((item) => (
              <div className="rating-row" key={item.estrellas}>
                <span>{item.estrellas}</span>
                <span className="star-small" aria-hidden="true">★</span>

                <div
                  className="bar-track"
                  role="progressbar"
                  aria-label={`${item.estrellas} estrellas`}
                  aria-valuenow={item.porcentaje}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bar-fill"
                    style={{ width: `${item.porcentaje}%` }}
                  />
                </div>

                <span className="count">{item.cantidad}</span>
                <span className="percent">({item.porcentaje}%)</span>
              </div>
            ))}
          </div>
        </section>

        <section className="filters" aria-label="Filtros de reseñas">
          <select
            className="filter-control primary-filter"
            aria-label="Filtrar por calificación"
            value={filtroEstrellas}
            onChange={(e) => setFiltroEstrellas(e.target.value)}
          >
            <option value="todas">Todas las calificaciones</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3_o_menos">3 estrellas o menos</option>
          </select>

          <select
            className="filter-control"
            aria-label="Filtrar por período"
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
          >
            <option value="7_dias">Últimos 7 días</option>
            <option value="30_dias">Últimos 30 días</option>
            <option value="todos">Todo el historial</option>
          </select>

          <input
            type="search"
            className="filter-control search-input"
            aria-label="Buscar reseñas"
            placeholder="Buscar por cliente, producto o comentario"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </section>

        <div className="results-info">
          Mostrando {resenasFiltradas.length}{' '}
          {resenasFiltradas.length === 1 ? 'reseña' : 'reseñas'}
        </div>

        <section className="review-list" aria-label="Lista de reseñas">
          {resenasFiltradas.length > 0 ? (
            resenasFiltradas.map((item) => (
              <article className="review-card" key={item.id}>
                <div className="review-author">
                  <div className={`avatar ${item.avatarColor}`}>
                    {item.iniciales}
                  </div>

                  <div className="author-details">
                    <div className="author-name">{item.autor}</div>
                    <span
                      className="review-stars"
                      aria-label={`${item.calificacion} de 5 estrellas`}
                    >
                      {renderEstrellas(item.calificacion)}
                    </span>
                  </div>

                  <div className="review-meta">
                    {FORMATEAR_FECHA(item.fecha)}
                    <span className="meta-dot">•</span>
                    Pedido {item.pedido}
                  </div>
                </div>

                <div className="review-body">
                  <div className="product-name">{item.producto}</div>
                  <div className="review-comment">{item.comentario}</div>

                  {item.respuesta && (
                    <div className="business-reply">
                      <strong>Tu respuesta:</strong> {item.respuesta}
                    </div>
                  )}
                </div>

                <div className="review-actions">
                  <span
                    className={`reply-status ${
                      item.respuesta ? 'answered' : 'pending'
                    }`}
                  >
                    {item.respuesta ? 'Respondida' : 'Sin respuesta'}
                  </span>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => abrirModal(item)}
                  >
                    {item.respuesta ? 'Editar respuesta' : 'Responder'}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <strong>No se encontraron reseñas</strong>
              <p>Prueba cambiando los filtros o el término de búsqueda.</p>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setFiltroEstrellas('todas');
                  setFiltroTiempo('todos');
                  setBusqueda('');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>
      </div>

      {modalAbierto && resenaSeleccionada && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cerrarModal();
          }}
        >
          <section
            className="reply-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reply-modal-title"
          >
            <div className="modal-header">
              <h2 id="reply-modal-title">
                {resenaSeleccionada.respuesta ? 'Editar respuesta' : 'Responder a'}{' '}
                {resenaSeleccionada.autor}
              </h2>

              <button
                type="button"
                className="close-modal"
                aria-label="Cerrar ventana"
                onClick={cerrarModal}
              >
                &times;
              </button>
            </div>

            <p className="modal-subtitle">
              Producto: <strong>{resenaSeleccionada.producto}</strong>
            </p>

            <div className="modal-comment">
              “{resenaSeleccionada.comentario}”
            </div>

            <form onSubmit={enviarRespuesta}>
              <label className="field-label" htmlFor="respuesta-cliente">
                Tu respuesta
              </label>

              <textarea
                id="respuesta-cliente"
                className="reply-textarea"
                placeholder="Escribe tu respuesta para el cliente..."
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                maxLength={1000}
                required
                autoFocus
              />

              <div className="character-count">
                {textoRespuesta.length}/1000 caracteres
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="button-primary">
                  Guardar respuesta
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toastMensaje && (
        <div className="toast" role="status" aria-live="polite">
          {toastMensaje}
        </div>
      )}
    </main>
  );
}
