// src/pages/PagesOwner/Solicitudes/Solicitudes.jsx
import { useState } from 'react';
import './Solicitudes.css';

const SOLICITUDES_INICIALES = [
  {
    id: 1,
    nombre: 'Juguería y Frutería El Trébol',
    razonSocial: 'Inversiones Gastronómicas El Trébol S.A.C.',
    ruc: '20608451239',
    categoria: 'bebidas',
    categoriaLabel: 'Juguería y Bebidas',
    sede: 'monterrico',
    sedeLabel: 'Campus Monterrico (Pabellón G)',
    representante: 'María Elena Quispe Vargas',
    correo: 'mquispe@eltreboljugos.pe',
    telefono: '+51 987 452 110',
    fechaSolicitud: '14/09/2026 · 10:42',
    tiempoEstimado: '8 min prom.',
    estado: 'pendiente',
    descripcion: 'Especialistas en jugos naturales de estación, bowls de frutas, smoothies proteicos y sándwiches integrales ligeros para alumnos y docentes.',
    documentos: [
      { nombre: 'Ficha RUC - SUNAT (Activo y Habido)', verificado: true },
      { nombre: 'Carnet de Sanidad vigente (4 manipuladores)', verificado: true },
      { nombre: 'Propuesta de Carta y Precios 2026-II', verificado: true },
      { nombre: 'Certificado de Inspección Sanitaria Municipal', verificado: true },
    ],
    platosDestacados: [
      { nombre: 'Jugo Especial c/ Algarrobina', precio: 'S/ 9.50' },
      { nombre: 'Bowl Amazónico de Açaí y Granola', precio: 'S/ 14.00' },
      { nombre: 'Triple Clásico de Palta, Huevo y Tomate', precio: 'S/ 8.50' },
    ],
  },
  {
    id: 2,
    nombre: 'Wok & Roll Express',
    razonSocial: 'Sabores Orientales del Perú S.R.L.',
    ruc: '20559182341',
    categoria: 'menu',
    categoriaLabel: 'Almuerzos y Fusión',
    sede: 'monterrico',
    sedeLabel: 'Campus Monterrico (Patio Central)',
    representante: 'Carlos Alberto Wong Mejía',
    correo: 'cwong@wokandroll.com.pe',
    telefono: '+51 994 118 302',
    fechaSolicitud: '15/09/2026 · 08:15',
    tiempoEstimado: '12 min prom.',
    estado: 'pendiente',
    descripcion: 'Cocina rápida al wok con opciones de chaufa universitario, tallarines saltados al instante, makis acevichados y combos ejecutivos.',
    documentos: [
      { nombre: 'Ficha RUC - SUNAT (Activo y Habido)', verificado: true },
      { nombre: 'Carnet de Sanidad vigente (6 manipuladores)', verificado: true },
      { nombre: 'Propuesta de Carta y Precios 2026-II', verificado: true },
      { nombre: 'Póliza de Responsabilidad Civil de Locales', verificado: false },
    ],
    platosDestacados: [
      { nombre: 'Combo Aeropuerto + Siu Mai (4 und)', precio: 'S/ 15.90' },
      { nombre: 'Bowl Teriyaki de Pollo Crocante', precio: 'S/ 14.50' },
      { nombre: 'Tabla de 10 Makis Acevichados + Bebida', precio: 'S/ 16.50' },
    ],
  },
  {
    id: 3,
    nombre: 'La Barra del Café Artesanal',
    razonSocial: 'Tostaduría Andina Gourmet S.A.C.',
    ruc: '20601198432',
    categoria: 'desayunos',
    categoriaLabel: 'Cafetería y Desayunos',
    sede: 'sanisidro',
    sedeLabel: 'Sede San Isidro (Piso 1)',
    representante: 'Diego Alonso Mendoza Ríos',
    correo: 'dmendoza@barracafe.pe',
    telefono: '+51 945 882 719',
    fechaSolicitud: '10/09/2026 · 16:20',
    tiempoEstimado: '5 min prom.',
    estado: 'aprobado',
    descripcion: 'Café de especialidad de Villa Rica y Cajamarca, métodos de filtrado V60, espresso bar y pastelería artesanal recién horneada.',
    documentos: [
      { nombre: 'Ficha RUC - SUNAT (Activo y Habido)', verificado: true },
      { nombre: 'Carnet de Sanidad vigente', verificado: true },
      { nombre: 'Propuesta de Carta y Precios 2026-II', verificado: true },
      { nombre: 'Certificado de Inspección Sanitaria Municipal', verificado: true },
    ],
    platosDestacados: [
      { nombre: 'Flat White Doble Origen Villa Rica', precio: 'S/ 8.00' },
      { nombre: 'Croissant de Mantequilla con Jamón Serrano', precio: 'S/ 11.50' },
    ],
  },
  {
    id: 4,
    nombre: 'Dulce Tentación & Churros',
    razonSocial: 'Postres Rápidos Lima S.A.C.',
    ruc: '20609928174',
    categoria: 'snacks',
    categoriaLabel: 'Snacks y Postres',
    sede: 'monterrico',
    sedeLabel: 'Campus Monterrico (Pabellón N)',
    representante: 'Lucía Fernanda Torres Paredes',
    correo: 'contacto@dulcetentacion.pe',
    telefono: '+51 922 741 008',
    fechaSolicitud: '08/09/2026 · 11:05',
    tiempoEstimado: '10 min prom.',
    estado: 'rechazado',
    motivoRechazo: 'No adjuntó certificado vigente de trampa de grasas ni carnet de sanidad del personal de turno tarde.',
    descripcion: 'Venta de churros rellenos de manjar, waffles belgas, crepes dulces y bebidas calientes.',
    documentos: [
      { nombre: 'Ficha RUC - SUNAT (Activo y Habido)', verificado: true },
      { nombre: 'Carnet de Sanidad vigente', verificado: false },
      { nombre: 'Propuesta de Carta y Precios 2026-II', verificado: true },
    ],
    platosDestacados: [
      { nombre: 'Porción de 4 Churros Españoles c/ Manjar', precio: 'S/ 7.50' },
      { nombre: 'Waffle con Fresas y Fudge Casero', precio: 'S/ 12.00' },
    ],
  },
];

const SEDES = [
  { value: 'todas', label: 'Sede: todas' },
  { value: 'monterrico', label: 'Sede: Monterrico' },
  { value: 'sanisidro', label: 'Sede: San Isidro' },
];

const CATEGORIAS = [
  { value: 'todas', label: 'Categoría: todas' },
  { value: 'desayunos', label: 'Categoría: desayunos' },
  { value: 'bebidas', label: 'Categoría: bebidas' },
  { value: 'menu', label: 'Categoría: menú' },
  { value: 'snacks', label: 'Categoría: snacks' },
];

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INICIALES);
  const [sede, setSede] = useState('todas');
  const [categoria, setCategoria] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [seleccionadaId, setSeleccionadaId] = useState(1);
  const [notaRechazo, setNotaRechazo] = useState('');
  const [mostrarInputRechazo, setMostrarInputRechazo] = useState(false);

  // Filtrado
  const solicitudesFiltradas = solicitudes
    .filter((s) => (sede === 'todas' ? true : s.sede === sede))
    .filter((s) => (categoria === 'todas' ? true : s.categoria === categoria))
    .filter((s) => (filtroEstado === 'todos' ? true : s.estado === filtroEstado));

  const solicitudActiva =
    solicitudesFiltradas.find((s) => s.id === seleccionadaId) ||
    solicitudesFiltradas[0] ||
    null;

  const totalPendientes = solicitudes.filter((s) => s.estado === 'pendiente').length;
  const totalAprobadas = solicitudes.filter((s) => s.estado === 'aprobado').length;
  const totalRechazadas = solicitudes.filter((s) => s.estado === 'rechazado').length;

  const cambiarEstado = (id, nuevoEstado, motivo = '') => {
    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, estado: nuevoEstado, motivoRechazo: motivo || item.motivoRechazo }
          : item
      )
    );
    setMostrarInputRechazo(false);
    setNotaRechazo('');
  };

  return (
    <div className="solicitudes-page">
      {/* TOPBAR IGUAL AL ESTILO DE RANKING Y VENTAS */}
      <div className="solicitudes-topbar">
        <div>
          <span className="solicitudes-breadcrumb">Cuentas › Solicitudes de registro</span>
          <h1 className="solicitudes-title">Solicitudes de registro</h1>
          <p className="solicitudes-subtitle">
            Periodo 01/09/2026 al 15/09/2026 · {totalPendientes} solicitudes pendientes de revisión
          </p>
        </div>

        <div className="solicitudes-filtros">
          <select
            className="solicitudes-select"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
          >
            {SEDES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            className="solicitudes-select"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PESTAÑAS DE ESTADO (TABS) */}
      <div className="solicitudes-tabs">
        <button
          type="button"
          className={`solicitudes-tab ${filtroEstado === 'pendiente' ? 'solicitudes-tab--active' : ''}`}
          onClick={() => setFiltroEstado('pendiente')}
        >
          Por revisar
          <span className="solicitudes-tab-badge solicitudes-tab-badge--alert">
            {totalPendientes}
          </span>
        </button>

        <button
          type="button"
          className={`solicitudes-tab ${filtroEstado === 'aprobado' ? 'solicitudes-tab--active' : ''}`}
          onClick={() => setFiltroEstado('aprobado')}
        >
          Aprobadas
          <span className="solicitudes-tab-badge">{totalAprobadas}</span>
        </button>

        <button
          type="button"
          className={`solicitudes-tab ${filtroEstado === 'rechazado' ? 'solicitudes-tab--active' : ''}`}
          onClick={() => setFiltroEstado('rechazado')}
        >
          Observadas / Rechazadas
          <span className="solicitudes-tab-badge">{totalRechazadas}</span>
        </button>

        <button
          type="button"
          className={`solicitudes-tab ${filtroEstado === 'todos' ? 'solicitudes-tab--active' : ''}`}
          onClick={() => setFiltroEstado('todos')}
        >
          Todas ({solicitudes.length})
        </button>
      </div>

      {/* GRID PRINCIPAL (LISTA IZQUIERDA + DETALLE DERECHA) */}
      <div className="solicitudes-grid">
        {/* COLUMNA 1: BANDEJA DE SOLICITUDES */}
        <section className="solicitudes-card">
          <div className="solicitudes-card-header">
            <h2 className="solicitudes-card-label">RESTAURANTES POSTULANTES</h2>
            <span className="solicitudes-card-count">{solicitudesFiltradas.length} resultados</span>
          </div>

          {solicitudesFiltradas.length === 0 ? (
            <p className="solicitudes-empty">No hay solicitudes con estos filtros.</p>
          ) : (
            <ul className="solicitudes-list">
              {solicitudesFiltradas.map((item) => {
                const activa = solicitudActiva && solicitudActiva.id === item.id;
                return (
                  <li
                    key={item.id}
                    className={`solicitudes-item ${activa ? 'solicitudes-item--active' : ''}`}
                    onClick={() => {
                      setSeleccionadaId(item.id);
                      setMostrarInputRechazo(false);
                    }}
                  >
                    <div className="solicitudes-avatar">
                      {item.nombre.charAt(0)}
                    </div>

                    <div className="solicitudes-item-info">
                      <div className="solicitudes-item-top">
                        <span className="solicitudes-item-nombre">{item.nombre}</span>
                        <span className={`solicitudes-pill solicitudes-pill--${item.estado}`}>
                          {item.estado === 'pendiente' && 'Pendiente'}
                          {item.estado === 'aprobado' && 'Aprobado'}
                          {item.estado === 'rechazado' && 'Observado'}
                        </span>
                      </div>

                      <span className="solicitudes-item-meta">
                        RUC {item.ruc} · {item.categoriaLabel}
                      </span>
                      <span className="solicitudes-item-fecha">
                        {item.sedeLabel} · {item.fechaSolicitud}
                      </span>
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

        {/* COLUMNA 2: EXPEDIENTE Y ACCIONES DE APROBACIÓN */}
        <section className="solicitudes-card solicitudes-card--detalle">
          {!solicitudActiva ? (
            <div className="solicitudes-empty-detail">
              Selecciona una solicitud del listado para revisar su expediente y habilitar la cuenta.
            </div>
          ) : (
            <>
              <div className="solicitudes-detalle-header">
                <div>
                  <span className="solicitudes-card-label">EXPEDIENTE DEL LOCAL #{solicitudActiva.id}026</span>
                  <h2 className="solicitudes-detalle-titulo">{solicitudActiva.nombre}</h2>
                  <p className="solicitudes-detalle-razon">{solicitudActiva.razonSocial}</p>
                </div>

                <span className={`solicitudes-pill solicitudes-pill--lg solicitudes-pill--${solicitudActiva.estado}`}>
                  {solicitudActiva.estado === 'pendiente' && 'Pendiente de revisión'}
                  {solicitudActiva.estado === 'aprobado' && 'Local habilitado'}
                  {solicitudActiva.estado === 'rechazado' && 'Solicitud observada'}
                </span>
              </div>

              <p className="solicitudes-descripcion">{solicitudActiva.descripcion}</p>

              {/* DATOS COMERCIALES */}
              <div className="solicitudes-datos-grid">
                <div className="solicitudes-dato-box">
                  <span className="solicitudes-dato-label">RUC</span>
                  <strong className="solicitudes-dato-valor">{solicitudActiva.ruc}</strong>
                </div>
                <div className="solicitudes-dato-box">
                  <span className="solicitudes-dato-label">UBICACIÓN SOLICITADA</span>
                  <strong className="solicitudes-dato-valor">{solicitudActiva.sedeLabel}</strong>
                </div>
                <div className="solicitudes-dato-box">
                  <span className="solicitudes-dato-label">REPRESENTANTE LEGAL</span>
                  <strong className="solicitudes-dato-valor">{solicitudActiva.representante}</strong>
                </div>
                <div className="solicitudes-dato-box">
                  <span className="solicitudes-dato-label">CONTACTO DIRECTO</span>
                  <strong className="solicitudes-dato-valor">
                    {solicitudActiva.correo} · {solicitudActiva.telefono}
                  </strong>
                </div>
              </div>

              {/* SUB-COLUMNAS: DOCUMENTACIÓN Y CARTA PROPUESTA */}
              <div className="solicitudes-subgrid">
                <div>
                  <h3 className="solicitudes-section-subtitle">DOCUMENTACIÓN ADJUNTA</h3>
                  <ul className="solicitudes-doc-list">
                    {solicitudActiva.documentos.map((doc, idx) => (
                      <li key={idx} className="solicitudes-doc-item">
                        <span className="solicitudes-doc-name">{doc.nombre}</span>
                        <span
                          className={`solicitudes-doc-status ${
                            doc.verificado ? 'solicitudes-doc-status--ok' : 'solicitudes-doc-status--warn'
                          }`}
                        >
                          {doc.verificado ? 'Verificado' : 'Pendiente'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="solicitudes-section-subtitle">MUESTRA DE CARTA INICIAL</h3>
                  <ul className="solicitudes-menu-preview">
                    {solicitudActiva.platosDestacados.map((plato, idx) => (
                      <li key={idx} className="solicitudes-menu-item">
                        <span>{plato.nombre}</span>
                        <strong>{plato.precio}</strong>
                      </li>
                    ))}
                  </ul>
                  <span className="solicitudes-tiempo-nota">
                    Tiempo de despacho declarado: <strong>{solicitudActiva.tiempoEstimado}</strong>
                  </span>
                </div>
              </div>

              {/* ALERTA SI FUE RECHAZADO */}
              {solicitudActiva.estado === 'rechazado' && solicitudActiva.motivoRechazo && (
                <div className="solicitudes-alerta-rechazo">
                  <strong>Motivo de observación registrado:</strong> {solicitudActiva.motivoRechazo}
                </div>
              )}

              {/* CAJA PARA ESCRIBIR MOTIVO DE RECHAZO */}
              {mostrarInputRechazo && (
                <div className="solicitudes-rechazo-form">
                  <label className="solicitudes-dato-label">
                    INDICA EL MOTIVO DE LA OBSERVACIÓN O RECHAZO:
                  </label>
                  <textarea
                    className="solicitudes-textarea"
                    rows="2"
                    placeholder="Ej. Falta adjuntar copia legible del carnet de sanidad o corregir RUC..."
                    value={notaRechazo}
                    onChange={(e) => setNotaRechazo(e.target.value)}
                  />
                  <div className="solicitudes-rechazo-actions">
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--ghost"
                      onClick={() => setMostrarInputRechazo(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--danger"
                      onClick={() =>
                        cambiarEstado(
                          solicitudActiva.id,
                          'rechazado',
                          notaRechazo || 'Documentación incompleta en el expediente.'
                        )
                      }
                    >
                      Confirmar observación
                    </button>
                  </div>
                </div>
              )}

              {/* BOTONES DE ACCIÓN DEL OWNER */}
              <div className="solicitudes-footer-actions">
                <span className="solicitudes-fecha-registro">
                  Recibido el {solicitudActiva.fechaSolicitud}
                </span>

                <div className="solicitudes-botones">
                  {solicitudActiva.estado !== 'rechazado' && !mostrarInputRechazo && (
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--outline-danger"
                      onClick={() => setMostrarInputRechazo(true)}
                    >
                      Observar / Rechazar
                    </button>
                  )}

                  {solicitudActiva.estado !== 'aprobado' ? (
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--primary"
                      onClick={() => cambiarEstado(solicitudActiva.id, 'aprobado')}
                    >
                      Aprobar y habilitar local
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="solicitudes-btn solicitudes-btn--ghost"
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