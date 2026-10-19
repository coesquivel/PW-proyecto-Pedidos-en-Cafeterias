// src/pages/LocalesComensal/LocalesComensal.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LocalesComensal.css';

// Base de datos simulada para el catálogo interactivo
const LOCALES_DATA = [
  {
    id: 1,
    nombre: 'Cafetería Central',
    estado: 'Abierto',
    ubicacion: 'Pabellón A, primer piso',
    horario: '07:00 a 19:00',
    tiempoPrep: '12 min de preparación',
    calificacion: 4.6,
    resenasCount: 128,
  },
  {
    id: 2,
    nombre: 'Sanguchería pabellón E',
    estado: 'Abierto',
    ubicacion: 'Pabellón E, primer piso',
    horario: '08:00 a 18:00',
    tiempoPrep: '10 min de preparación',
    calificacion: 4.3,
  },
  {
    id: 3,
    nombre: 'Café de Biblioteca',
    estado: 'Abierto',
    ubicacion: 'Biblioteca, piso 1',
    horario: '08:00 a 20:00',
    tiempoPrep: '6 min de preparación',
    calificacion: 4.8,
  },
  {
    id: 4,
    nombre: 'Menú Universitario N',
    estado: 'Abierto',
    ubicacion: 'Pabellón N, patio norte',
    horario: '11:30 a 15:00',
    tiempoPrep: '15 min de preparación',
    calificacion: 4.5,
  },
  {
    id: 5,
    nombre: 'Juguería La Fuente',
    estado: 'Cerrado',
    ubicacion: 'Patio central',
    horario: 'abre mañana 09:00',
    tiempoPrep: '8 min de preparación',
    calificacion: 4.5,
  },
];

const PRODUCTOS_CAFETERIA = [
  {
    id: 'p1',
    nombre: 'Sándwich de pollo deshilachado',
    descripcion: 'Pan francés, pollo deshilachado y salsa criolla.',
    precio: 9.50,
    categoria: 'Desayunos',
    agotado: false,
    opciones: {
      tipoPan: [
        { id: 'f', nombre: 'Pan francés', precio: 0 },
        { id: 'c', nombre: 'Pan ciabatta', precio: 1.00 },
        { id: 'i', nombre: 'Pan integral', precio: 1.50 },
      ],
      paraLlevar: [
        { id: 'local', nombre: 'En el local', precio: 0 },
        { id: 'llevar', nombre: 'Empaque para llevar', precio: 0.50 },
      ],
      agregados: [
        { id: 'queso', nombre: 'Agregar queso', precio: 2.00 },
        { id: 'palta', nombre: 'Palta extra', precio: 2.50 },
        { id: 'doble', nombre: 'Doble porción de pollo', precio: 4.00 },
      ]
    }
  },
  {
    id: 'p2',
    nombre: 'Pan con palta',
    descripcion: 'Pan ciabatta, palta fuerte y tomate.',
    precio: 8.50,
    categoria: 'Desayunos',
    agotado: false,
  },
  {
    id: 'p3',
    nombre: 'Tostadas con mermelada',
    descripcion: 'Pan de molde, mermelada de fresa y mantequilla.',
    precio: 5.50,
    categoria: 'Desayunos',
    agotado: false,
  },
  {
    id: 'p4',
    nombre: 'Café pasado',
    descripcion: 'Café de Chanchamayo, taza de 8 oz.',
    precio: 3.50,
    categoria: 'Desayunos',
    agotado: false,
  },
  {
    id: 'p5',
    nombre: 'Ensalada de frutas',
    descripcion: 'Frutas de estación picadas.',
    precio: 7.00,
    categoria: 'Desayunos',
    agotado: true,
  },
  {
    id: 'p6',
    nombre: 'Jugo surtido',
    descripcion: 'Papaya, plátano y naranja licuados al momento.',
    precio: 6.50,
    categoria: 'Desayunos',
    agotado: false,
  },
  {
    id: 'p7',
    nombre: 'Chicha morada',
    descripcion: 'Vaso de 16 oz, endulzada al momento.',
    precio: 4.50,
    categoria: 'Desayunos',
    agotado: false,
  },
  {
    id: 'p8',
    nombre: 'Empanada de carne',
    descripcion: 'Masa casera con carne y aceituna. Se agotó por hoy en Cafetería Central.',
    precio: 5.00,
    categoria: 'Desayunos',
    agotado: true,
  }
];

export default function LocalesComensal() {
  const navigate = useNavigate();

  // Estados de vista
  const [esTodosCerrados, setEsTodosCerrados] = useState(false);
  const [localSeleccionado, setLocalSeleccionado] = useState(null); // null = Lista de locales
  const [busquedaCarta, setBusquedaCarta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Desayunos');
  
  // Estado para modal / detalle del producto
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [panElegido, setPanElegido] = useState('');
  const [paraLlevarElegido, setParaLlevarElegido] = useState('local');
  const [agregadosElegidos, setAgregadosElegidos] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState('');
  const [errorObligatorio, setErrorObligatorio] = useState(false);

  // --- FILTROS DE CARTA ---
  const productosFiltrados = PRODUCTOS_CAFETERIA.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busquedaCarta.toLowerCase()) ||
                              p.descripcion.toLowerCase().includes(busquedaCarta.toLowerCase());
    return coincideBusqueda;
  });

  // --- HANDLERS ---
  const handleVerCarta = (local) => {
    setLocalSeleccionado(local);
    setBusquedaCarta('');
    setCategoriaActiva('Desayunos');
  };

  const handleAbrirDetalle = (prod) => {
    setProductoDetalle(prod);
    setPanElegido('');
    setParaLlevarElegido('local');
    setAgregadosElegidos([]);
    setCantidad(1);
    setNota('');
    setErrorObligatorio(false);
  };

  const handleToggleAgregado = (id) => {
    if (agregadosElegidos.includes(id)) {
      setAgregadosElegidos(agregadosElegidos.filter(item => item !== id));
    } else {
      setAgregadosElegidos([...agregadosElegidos, id]);
    }
  };

  const handleAgregarAlCarrito = () => {
    if (productoDetalle?.opciones?.tipoPan && !panElegido) {
      setErrorObligatorio(true);
      return;
    }
    // Redirigir al Carrito
    navigate('/comensales/carrito');
  };

  // Calcular precio total del producto configurado
  const calcularTotalProducto = () => {
    if (!productoDetalle) return 0;
    let base = productoDetalle.precio;
    
    if (productoDetalle.opciones) {
      const panObj = productoDetalle.opciones.tipoPan?.find(p => p.id === panElegido);
      if (panObj) base += panObj.precio;

      const llevarObj = productoDetalle.opciones.paraLlevar?.find(p => p.id === paraLlevarElegido);
      if (llevarObj) base += llevarObj.precio;

      agregadosElegidos.forEach(agrId => {
        const agrObj = productoDetalle.opciones.agregados?.find(a => a.id === agrId);
        if (agrObj) base += agrObj.precio;
      });
    }
    return (base * cantidad).toFixed(2);
  };

  return (
    <main className="comensal-main-layout">
      {/* Botón de prueba en desarrollo para conmutar estado global de horario */}
      <div className="simulador-bar">
        <span>Modo simulador:</span>
        <button 
          className="btn-simulador" 
          onClick={() => { setEsTodosCerrados(!esTodosCerrados); setLocalSeleccionado(null); }}
        >
          {esTodosCerrados ? "Cambiar a Horario Abierto (Día)" : "Cambiar a Fuera de Horario (22:40)"}
        </button>
      </div>

      {/* =========================================================================
          VISTA 3.1: TODOS CERRADOS (FUERA DE HORARIO)
         ========================================================================= */}
      {esTodosCerrados ? (
        <div className="locales-cerrados-container">
          <h1 className="locales-title">Locales del campus</h1>
          <p className="locales-subtitle">Ningún local recibe pedidos en este momento · 22:40</p>

          <div className="empty-state-box">
            <div className="clock-icon-circle">⏰</div>
            <h2>Ningún local está abierto ahora</h2>
            <p>Los locales del campus reciben pedidos desde las 07:00. Puedes revisar las cartas mientras tanto y pedir en cuanto abran.</p>
            <div className="empty-actions">
              <button className="btn-primary-action" onClick={() => setEsTodosCerrados(false)}>
                Ver cartas de todos los locales
              </button>
              <button className="btn-secondary-action">
                Avísame cuando abran
              </button>
            </div>
          </div>

          <div className="proximas-aperturas">
            <h3>PRÓXIMAS APERTURAS</h3>
            <div className="proximas-grid">
              <div className="proxima-card">
                <div className="proxima-thumb"></div>
                <div>
                  <strong>Cafetería Central</strong>
                  <p>Abre mañana a las 07:00</p>
                </div>
              </div>
              <div className="proxima-card">
                <div className="proxima-thumb"></div>
                <div>
                  <strong>Café de Biblioteca</strong>
                  <p>Abre mañana a las 08:00</p>
                </div>
              </div>
              <div className="proxima-card">
                <div className="proxima-thumb"></div>
                <div>
                  <strong>Menú Universitario N</strong>
                  <p>Abre mañana a las 11:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* =========================================================================
              VISTA 3.1: LISTA DE LOCALES (DEFAULT)
             ========================================================================= */}
          {!localSeleccionado ? (
            <div className="locales-view-container">
              <div className="locales-header-bar">
                <div>
                  <h1 className="locales-title">Locales del campus</h1>
                  <p className="locales-subtitle">
                    4 locales abiertos ahora · 1 cerrado · sede Monterrico
                  </p>
                </div>

                <div className="locales-filter-controls">
                  <select className="filter-dropdown" defaultValue="Monterrico">
                    <option value="Monterrico">Sede: Monterrico</option>
                  </select>
                  <button className="filter-btn-toggle">Solo abiertos ✕</button>
                  <select className="filter-dropdown" defaultValue="menor_espera">
                    <option value="menor_espera">Ordenar: menor espera</option>
                  </select>
                </div>
              </div>

              <div className="locales-cards-grid">
                {LOCALES_DATA.map((local) => {
                  const esCerrado = local.estado === 'Cerrado';
                  return (
                    <article key={local.id} className={`local-card ${esCerrado ? 'local-card--closed' : ''}`}>
                      <div className="local-card-image-placeholder">
                        <span>foto local</span>
                      </div>
                      <div className="local-card-body">
                        <div className="local-title-row">
                          <h3>{local.nombre}</h3>
                          <span className={`status-pill ${esCerrado ? 'pill-closed' : 'pill-open'}`}>
                            {local.estado}
                          </span>
                        </div>
                        <p className="local-location-info">{local.ubicacion} · {local.horario}</p>
                        <p className="local-time-rating">{local.tiempoPrep} · {local.calificacion} ★</p>

                        <button
                          type="button"
                          className={`btn-ver-carta ${esCerrado ? 'btn-ver-carta--disabled' : ''}`}
                          disabled={esCerrado}
                          onClick={() => handleVerCarta(local)}
                        >
                          Ver carta
                        </button>
                      </div>
                    </article>
                  );
                })}

                <article className="local-card-info-box">
                  <p>Los locales cerrados se muestran atenuados al final de la lista, nunca ocultos.</p>
                </article>
              </div>
            </div>
          ) : (
            /* =========================================================================
                VISTA 3.2: CARTA DEL LOCAL (CAFETERÍA CENTRAL)
               ========================================================================= */
            <div className="carta-local-container">
              <div className="breadcrumb">
                <span onClick={() => setLocalSeleccionado(null)} className="link-back">Locales</span> &gt; <strong>{localSeleccionado.nombre}</strong>
              </div>

              <div className="local-header-info">
                <div className="local-header-main">
                  <div className="local-avatar-placeholder"></div>
                  <div>
                    <div className="local-title-badge">
                      <h2>{localSeleccionado.nombre}</h2>
                      <span className="status-pill pill-open">{localSeleccionado.estado}</span>
                    </div>
                    <p className="local-subtitle-text">
                      {localSeleccionado.ubicacion} · cierra 19:00 · {localSeleccionado.tiempoPrep} · {localSeleccionado.calificacion} ★ ({localSeleccionado.resenasCount || 128})
                    </p>
                  </div>
                </div>
                <button className="btn-secondary-action">Ver reseñas</button>
              </div>

              {/* Categorías y Buscador de Carta */}
              <div className="categories-pills">
                {['Desayunos', 'Sándwiches', 'Menú del día', 'Jugos y bebidas', 'Snacks', 'Postres', 'Café'].map((cat) => (
                  <button
                    key={cat}
                    className={`cat-pill ${categoriaActiva === cat ? 'active' : ''}`}
                    onClick={() => setCategoriaActiva(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="carta-filters-row">
                <input
                  type="text"
                  className="search-carta-input"
                  placeholder="Buscar en esta carta..."
                  value={busquedaCarta}
                  onChange={(e) => setBusquedaCarta(e.target.value)}
                />
                <select className="filter-dropdown"><option>Hasta S/ 10</option></select>
                <button className="filter-btn-toggle">Solo disponibles ✕</button>
              </div>

              {/* =========================================================================
                  VISTA 3.2 - SIN RESULTADOS DE BÚSQUEDA
                 ========================================================================= */}
              {productosFiltrados.length === 0 ? (
                <div className="sin-resultados-card">
                  <div className="filter-active-tags">
                    <span className="tag-pill">«{busquedaCarta}» ✕</span>
                    <span className="tag-pill">Hasta S/ 10 ✕</span>
                    <button className="link-limpiar" onClick={() => setBusquedaCarta('')}>Limpiar todo</button>
                  </div>
                  <div className="question-circle">?</div>
                  <h3>Ningún producto coincide con tu búsqueda</h3>
                  <p>Prueba con otro término, sube el límite de precio o revisa la carta completa del local.</p>
                  <button className="btn-primary-action" onClick={() => setBusquedaCarta('')}>Ver toda la carta</button>
                </div>
              ) : (
                /* RETÍCULA DE PRODUCTOS DE LA CARTA */
                <div className="productos-grid">
                  {productosFiltrados.map((prod) => (
                    <div key={prod.id} className={`producto-card ${prod.agotado ? 'prod-agotado' : ''}`}>
                      <div className="prod-img-placeholder">foto 1:1</div>
                      <div className="prod-info">
                        <h4>{prod.nombre}</h4>
                        <p>{prod.descripcion}</p>
                        <div className="prod-price-row">
                          <span className="prod-price">S/ {prod.precio.toFixed(2)}</span>
                          {prod.agotado ? (
                            <button className="btn-agregar-prod disabled" onClick={() => handleAbrirDetalle(prod)}>
                              Agotado
                            </button>
                          ) : (
                            <button className="btn-agregar-prod" onClick={() => handleAbrirDetalle(prod)}>
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          VISTA 3.3 Y PIEZAS SUELTAS: MODAL / DETALLE DEL PRODUCTO
         ========================================================================= */}
      {productoDetalle && (
        <div className="modal-overlay">
          <div className="modal-detalle-card">
            <button className="btn-close-modal" onClick={() => setProductoDetalle(null)}>✕</button>

            {/* VISTA PRODUCTO AGOTADO */}
            {productoDetalle.agotado ? (
              <div className="detalle-agotado-box">
                <div className="prod-img-placeholder modal-img">foto 1:1</div>
                <div className="detalle-head">
                  <h2>{productoDetalle.nombre} <span className="pill-closed">Agotado</span></h2>
                  <p>{productoDetalle.descripcion}</p>
                  <span className="prod-price">S/ {productoDetalle.precio.toFixed(2)}</span>
                </div>
                <div className="modal-actions-stack">
                  <button className="btn-disabled-wide">Agotado por hoy</button>
                  <button className="btn-outline-wide" onClick={() => setProductoDetalle(null)}>
                    Ver productos similares
                  </button>
                </div>
              </div>
            ) : (
              /* VISTA PRODUCTO DISPONIBLE CON OPCIONES */
              <div className="detalle-layout">
                <div className="detalle-img-side">
                  <div className="prod-img-placeholder modal-img">foto del producto 1:1</div>
                  <p className="subtext-local">{localSeleccionado?.nombre || 'Cafetería Central'} · 8 min de preparación · 4.9 ★ (62)</p>
                </div>

                <div className="detalle-info-side">
                  <h2>{productoDetalle.nombre}</h2>
                  <p className="prod-desc-full">{productoDetalle.descripcion} Preparado al momento del recojo.</p>

                  {/* ALERTA DE OPCIÓN OBLIGATORIA SIN ELEGIR */}
                  {errorObligatorio && (
                    <div className="alert-obligatorio">
                      Elige un tipo de pan para continuar.
                    </div>
                  )}

                  {/* Opciones Configurables */}
                  {productoDetalle.opciones && (
                    <div className="options-groups">
                      {/* TIPO DE PAN (OBLIGATORIO) */}
                      <div className={`group-box ${errorObligatorio ? 'group-box-error' : ''}`}>
                        <label className="group-title">TIPO DE PAN · OBLIGATORIO</label>
                        {productoDetalle.opciones.tipoPan.map((pan) => (
                          <label key={pan.id} className="radio-option">
                            <input
                              type="radio"
                              name="tipoPan"
                              value={pan.id}
                              checked={panElegido === pan.id}
                              onChange={() => { setPanElegido(pan.id); setErrorObligatorio(false); }}
                            />
                            <span>{pan.nombre}</span>
                            <span className="price-tag">{pan.precio === 0 ? 'Sin costo' : `+ S/ ${pan.precio.toFixed(2)}`}</span>
                          </label>
                        ))}
                      </div>

                      {/* PARA LLEVAR (OPCIONAL) */}
                      <div className="group-box">
                        <label className="group-title">PARA LLEVAR · OPCIONAL</label>
                        {productoDetalle.opciones.paraLlevar.map((op) => (
                          <label key={op.id} className="radio-option">
                            <input
                              type="radio"
                              name="paraLlevar"
                              value={op.id}
                              checked={paraLlevarElegido === op.id}
                              onChange={() => setParaLlevarElegido(op.id)}
                            />
                            <span>{op.nombre}</span>
                            <span className="price-tag">{op.precio === 0 ? 'Sin costo' : `+ S/ ${op.precio.toFixed(2)}`}</span>
                          </label>
                        ))}
                      </div>

                      {/* AGREGADOS (OPCIONAL) */}
                      <div className="group-box">
                        <label className="group-title">AGREGADOS · OPCIONAL</label>
                        {productoDetalle.opciones.agregados.map((agr) => (
                          <label key={agr.id} className="checkbox-option">
                            <input
                              type="checkbox"
                              checked={agregadosElegidos.includes(agr.id)}
                              onChange={() => handleToggleAgregado(agr.id)}
                            />
                            <span>{agr.nombre}</span>
                            <span className="price-tag">+ S/ {agr.precio.toFixed(2)}</span>
                          </label>
                        ))}
                      </div>

                      {/* NOTA PARA EL LOCAL */}
                      <div className="group-box">
                        <label className="group-title">NOTA PARA EL LOCAL</label>
                        <textarea
                          className="nota-textarea"
                          placeholder="Sin cebolla, por favor."
                          maxLength={120}
                          value={nota}
                          onChange={(e) => setNota(e.target.value)}
                        />
                        <span className="char-count">Máximo 120 caracteres.</span>
                      </div>
                    </div>
                  )}

                  {/* Barra de Acciones y Cantidad */}
                  <div className="modal-bottom-bar">
                    <div className="counter-box">
                      <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
                      <span>{cantidad}</span>
                      <button onClick={() => setCantidad(cantidad + 1)}>+</button>
                    </div>

                    <button className="btn-primary-action flex-grow" onClick={handleAgregarAlCarrito}>
                      Agregar al carrito · S/ {calcularTotalProducto()}
                    </button>

                    <button className="btn-secondary-action" onClick={() => setProductoDetalle(null)}>
                      Volver a la carta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}