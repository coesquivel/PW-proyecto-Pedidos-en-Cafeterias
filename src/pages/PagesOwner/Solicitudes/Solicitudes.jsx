// src/pages/PagesOwner/Solicitudes/Solicitudes.jsx
import { useEffect, useState } from 'react';
import { listarSolicitudes, cambiarEstadoSolicitud } from '../../../api/solicitudes';
import './Solicitudes.css';

const mensajeDeError = (error) =>
  error?.response?.data?.message || 'No se pudo completar la acción. Intenta de nuevo.';

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [sede, setSede] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [seleccionadaId, setSeleccionadaId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    listarSolicitudes()
      .then(setSolicitudes)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  const sedes = [...new Set(solicitudes.map((s) => s.campus))];

  const solicitudesFiltradas = solicitudes
    .filter((s) => (sede === 'todas' ? true : s.campus === sede))
    .filter((s) => (filtroEstado === 'todos' ? true : s.status === filtroEstado));

  const solicitudActiva =
    solicitudesFiltradas.find((s) => s.id === seleccionadaId) || solicitudesFiltradas[0] || null;

  const total = (estado) => solicitudes.filter((s) => s.status === estado).length;

  const cambiarEstado = async (id, status) => {
    setGuardando(true);
    setError('');
    try {
      const actualizada = await cambiarEstadoSolicitud(id, status);
      setSolicitudes((prev) => prev.map((s) => (s.id === id ? actualizada : s)));
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const pestana = (valor, texto, cantidad, alerta = false) => (
    <button
      type="button"
      className={`solicitudes-tab ${filtroEstado === valor ? 'solicitudes-tab--active' : ''}`}
      onClick={() => setFiltroEstado(valor)}
    >
      {texto}
      <span className={`solicitudes-tab-badge ${alerta ? 'solicitudes-tab-badge--alert' : ''}`}>{cantidad}</span>
    </button>
  );

  return (
    <div className="solicitudes-page">
      <div className="solicitudes-topbar">
        <div>
          <span className="solicitudes-breadcrumb">Cuentas › Solicitudes de registro</span>
          <h1 className="solicitudes-title">Solicitudes de registro</h1>
          <p className="solicitudes-subtitle">{total('pendiente')} solicitudes pendientes de revisión</p>
        </div>

        <div className="solicitudes-filtros">
          <select className="solicitudes-select" value={sede} onChange={(e) => setSede(e.target.value)}>
            <option value="todas">Sede: todas</option>
            {sedes.map((s) => (
              <option key={s} value={s}>Sede: {s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="solicitudes-alerta-rechazo">{error}</div>}

      <div className="solicitudes-tabs">
        {pestana('pendiente', 'Por revisar', total('pendiente'), true)}
        {pestana('activo', 'Aprobadas', total('activo'))}
        {pestana('rechazado', 'Observadas / Rechazadas', total('rechazado'))}
        {pestana('todos', 'Todas', solicitudes.length)}
      </div>

      <div className="solicitudes-grid">
        <section className="solicitudes-card">
          <div className="solicitudes-card-header">
            <h2 className="solicitudes-card-label">RESTAURANTES POSTULANTES</h2>
            <span className="solicitudes-card-count">{solicitudesFiltradas.length} resultados</span>
          </div>

          {cargando ? (
            <p className="solicitudes-empty">Cargando solicitudes…</p>
          ) : solicitudesFiltradas.length === 0 ? (
            <p className="solicitudes-empty">No hay solicitudes con estos filtros.</p>
          ) : (
            <ul className="solicitudes-list">
              {solicitudesFiltradas.map((item) => {
                const activa = solicitudActiva && solicitudActiva.id === item.id;
                return (
                  <li
                    key={item.id}
                    className={`solicitudes-item ${activa ? 'solicitudes-item--active' : ''}`}
                    onClick={() => setSeleccionadaId(item.id)}
                  >
                    <div className="solicitudes-avatar">{item.commercial_name.charAt(0)}</div>
                    <div className="solicitudes-item-info">
                      <div className="solicitudes-item-top">
                        <span className="solicitudes-item-nombre">{item.commercial_name}</span>
                        <span className={`solicitudes-pill solicitudes-pill--${item.status}`}>
                          {item.status === 'pendiente' && 'Pendiente'}
                          {item.status === 'activo' && 'Aprobado'}
                          {item.status === 'rechazado' && 'Observado'}
                        </span>
                      </div>
                      <span className="solicitudes-item-meta">RUC {item.ruc || '—'}</span>
                      <span className="solicitudes-item-fecha">{item.campus} · {item.campus_location}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="solicitudes-helper-note">
            Sugerencia: verifica que la ficha RUC se encuentre en estado Activo y Habido antes de habilitar el acceso al panel de local.
          </p>
        </section>

        <section className="solicitudes-card solicitudes-card--detalle">
          {!solicitudActiva ? (
            <div className="solicitudes-empty-detail">
              Selecciona una solicitud del listado para revisar sus datos y habilitar la cuenta.
            </div>
          ) : (
            <>
              <div className="solicitudes-detalle-header">
                <div>
                  <span className="solicitudes-card-label">SOLICITUD DE LOCAL #{solicitudActiva.id}</span>
                  <h2 className="solicitudes-detalle-titulo">{solicitudActiva.commercial_name}</h2>
                </div>
                <span className={`solicitudes-pill solicitudes-pill--lg solicitudes-pill--${solicitudActiva.status}`}>
                  {solicitudActiva.status === 'pendiente' && 'Pendiente de revisión'}
                  {solicitudActiva.status === 'activo' && 'Local habilitado'}
                  {solicitudActiva.status === 'rechazado' && 'Solicitud observada'}
                </span>
              </div>

              <div className="solicitudes-datos-grid">
                <div className="solicitudes-dato-box">
                  <span className="solicitudes-dato-label">RUC</span>
                  <strong className="solicitudes-dato-valor">{solicitudActiva.ruc || '—'}</strong>
                </div>
                <div className="solicitudes-dato-box">
                  <span className="solicitudes-dato-label">UBICACIÓN SOLICITADA</span>
                  <strong className="solicitudes-dato-valor">
                    {solicitudActiva.campus} ({solicitudActiva.campus_location})
                  </strong>
                </div>
                <div className="solicitudes-dato-box">
                  <span className="solicitudes-dato-label">CONTACTO DIRECTO</span>
                  <strong className="solicitudes-dato-valor">
                    {solicitudActiva.email} · {solicitudActiva.phone || 'sin teléfono'}
                  </strong>
                </div>
              </div>

              <div className="solicitudes-footer-actions">
                <span className="solicitudes-fecha-registro">
                  {solicitudActiva.status === 'activo'
                    ? 'Puede iniciar sesión y aparece a los comensales.'
                    : 'No puede iniciar sesión hasta ser aprobado.'}
                </span>

                <div className="solicitudes-botones">
                  {solicitudActiva.status !== 'rechazado' && (
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--outline-danger"
                      disabled={guardando}
                      onClick={() => cambiarEstado(solicitudActiva.id, 'rechazado')}
                    >
                      Observar / Rechazar
                    </button>
                  )}

                  {solicitudActiva.status !== 'activo' ? (
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--primary"
                      disabled={guardando}
                      onClick={() => cambiarEstado(solicitudActiva.id, 'activo')}
                    >
                      Aprobar y habilitar local
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--ghost"
                      disabled={guardando}
                      onClick={() => cambiarEstado(solicitudActiva.id, 'pendiente')}
                    >
                      Mover a revisión nuevamente
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
