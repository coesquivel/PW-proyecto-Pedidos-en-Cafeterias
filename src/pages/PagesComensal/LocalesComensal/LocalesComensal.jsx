// src\pages\PagesComensal\LocalesComensal\LocalesComensal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResenasLocal from './ResenasLocal';
import {
  obtenerLocales,
  obtenerCartaLocal,
  localALista,
  productoAComensal,
  categoriasDeCarta,
} from '../../../api/locales';
import { mensajeDeError } from '../../../api/carta';
import { agregarAlCarrito, vaciarCarrito, ahoraEnLima } from '../../../api/pedidos';
import './LocalesComensal.css';

// Los locales y sus cartas vienen de la API (ver src/api/locales.js)

// Estilo del recuadro de foto: la imagen real si existe; si no, el placeholder con rayas
const FONDO_RAYAS = "repeating-linear-gradient(-45deg, #FCEAE7, #FCEAE7 5px, #EFE2DC 5px, #EFE2DC 10px)";
const fondoFoto = (url) => (url ? `center / cover no-repeat url(${url})` : FONDO_RAYAS);

export default function LocalesComensal({ setCarrito }) {
  const navigate = useNavigate();

  // Estados de Filtros y Navegación
  const [verTodos, setVerTodos] = useState(false);
  const [localSeleccionado, setLocalSeleccionado] = useState(null);
  const [busquedaCarta, setBusquedaCarta] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [soloAbiertos, setSoloAbiertos] = useState(false);
  const [localResenas, setLocalResenas] = useState(null);

  // Datos reales (API)
  const [locales, setLocales] = useState([]);
  const [cargandoLocales, setCargandoLocales] = useState(true);
  const [productos, setProductos] = useState([]);
  const [cargandoCarta, setCargandoCarta] = useState(false);
  const [errorApi, setErrorApi] = useState("");

  useEffect(() => {
    obtenerLocales()
      .then((lista) => setLocales(lista.map(localALista)))
      .catch((e) => setErrorApi(mensajeDeError(e, "No se pudieron cargar los locales.")))
      .finally(() => setCargandoLocales(false));
  }, []);

  // Estados Modal Detalle de Producto
  const [productoDetalle, setProductoDetalle] = useState(null);
  // Opciones elegidas en el detalle: { [id del grupo]: [ids de alternativas] }
  const [opcionesElegidas, setOpcionesElegidas] = useState({});
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");
  const [errorObligatorio, setErrorObligatorio] = useState(false); // false o id del grupo obligatorio sin elegir
  const [agregando, setAgregando] = useState(false);
  const [errorAgregar, setErrorAgregar] = useState("");

  // Filtrado de Locales
  // Los locales abiertos van primero; los cerrados quedan atenuados al final
  const ordenados = [...locales].sort((a, b) => (a.estado === "Abierto" ? 0 : 1) - (b.estado === "Abierto" ? 0 : 1));
  const localesVisibles = soloAbiertos ? ordenados.filter((l) => l.estado === "Abierto") : ordenados;
  const abiertos = locales.filter((l) => l.estado === "Abierto").length;
  const cerrados = locales.length - abiertos;
  const esTodosCerrados = !cargandoLocales && locales.length > 0 && abiertos === 0 && !verTodos;
  const horaAhora = (() => {
    const m = ahoraEnLima().minutos;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  })();

  // Categorías de la carta (en el orden del local) y filtrado de productos:
  // con texto en el buscador se busca en toda la carta; sin texto, solo en la categoría activa
  const categoriasCarta = categoriasDeCarta(productos);
  const textoBusqueda = busquedaCarta.trim().toLowerCase();
  const productosFiltrados = productos.filter((p) =>
    textoBusqueda
      ? p.nombre.toLowerCase().includes(textoBusqueda) ||
        p.descripcion.toLowerCase().includes(textoBusqueda)
      : p.categoria === categoriaActiva
  );

  // Abre la carta de un local: pide sus productos a la API
  const handleVerCarta = async (local) => {
    setLocalSeleccionado(local);
    setBusquedaCarta("");
    setProductos([]);
    setCategoriaActiva("");
    setErrorApi("");
    setCargandoCarta(true);

    try {
      const lista = (await obtenerCartaLocal(local.id)).map(productoAComensal);
      setProductos(lista);
      setCategoriaActiva(categoriasDeCarta(lista)[0] || "");
    } catch (e) {
      setErrorApi(mensajeDeError(e, "No se pudo cargar la carta del local."));
    } finally {
      setCargandoCarta(false);
    }
  };

  const handleAbrirDetalle = (prod) => {
    setProductoDetalle(prod);
    setOpcionesElegidas({});
    setCantidad(1);
    setNota("");
    setErrorObligatorio(false);
    setErrorAgregar("");
  };

  // Única: reemplaza la elección del grupo. Múltiple: agrega o quita la alternativa.
  const handleElegirOpcion = (grupo, alternativaId) => {
    setErrorObligatorio(false);
    setOpcionesElegidas((prev) => {
      const actuales = prev[grupo.id] || [];
      if (grupo.seleccion === "unica") return { ...prev, [grupo.id]: [alternativaId] };
      return {
        ...prev,
        [grupo.id]: actuales.includes(alternativaId)
          ? actuales.filter((id) => id !== alternativaId)
          : [...actuales, alternativaId],
      };
    });
  };

  const idsElegidos = () => Object.values(opcionesElegidas).flat();

  const calcularTotalProducto = () => {
    if (!productoDetalle) return "0.00";
    const elegidos = idsElegidos();
    const extras = productoDetalle.grupos
      .flatMap((g) => g.alternativas)
      .filter((alt) => elegidos.includes(alt.id))
      .reduce((suma, alt) => suma + alt.precio, 0);
    return ((productoDetalle.precio + extras) * cantidad).toFixed(2);
  };

  const handleAgregarAlCarrito = async () => {
    const faltante = productoDetalle.grupos.find(
      (g) => g.obligatorio && !(opcionesElegidas[g.id] || []).length
    );
    if (faltante) {
      setErrorObligatorio(faltante.id);
      return;
    }

    setAgregando(true);
    setErrorAgregar("");

    const datos = { product_id: productoDetalle.id, quantity: cantidad, notes: nota, options: idsElegidos() };

    try {
      let carritoActual;
      try {
        carritoActual = await agregarAlCarrito(datos);
      } catch (e) {
        // El carrito es de un solo local: si tiene productos de otro, se ofrece vaciarlo
        if (e?.response?.data?.error === "CART_OTHER_STORE") {
          const vaciar = window.confirm(`${e.response.data.message}.\n\n¿Vaciar el carrito y agregar este producto?`);
          if (!vaciar) {
            setAgregando(false);
            return;
          }
          await vaciarCarrito();
          carritoActual = await agregarAlCarrito(datos);
        } else {
          throw e;
        }
      }

      setCarrito(carritoActual);
      setProductoDetalle(null);
      navigate("/comensales/carrito");
    } catch (e) {
      setErrorAgregar(mensajeDeError(e, "No se pudo agregar el producto al carrito."));
    } finally {
      setAgregando(false);
    }
  };

  // VISTA RESEÑAS DEL LOCAL
  if (localResenas) {
    return (
      <main className="comensal-main-layout">
        <ResenasLocal
          local={localResenas}
          onVolverLocales={() => {
            setLocalResenas(null);
            setLocalSeleccionado(null);
          }}
          onVerCarta={() => {
            handleVerCarta(localResenas);
            setLocalResenas(null);
          }}
        />
      </main>
    );
  }

  return (
    <main className="comensal-main-layout">
      {/* CASO: NINGÚN LOCAL ABIERTO */}
      {esTodosCerrados ? (
        <div>
          <h1 className="locales-title">Locales del campus</h1>
          <p className="locales-subtitle">Ningún local recibe pedidos en este momento · {horaAhora}</p>

          <div className="empty-state-box">
            <div className="clock-icon-circle">⏰</div>
            <h2 className="section-title" style={{ margin: "0 0 8px 0" }}>Ningún local está abierto ahora</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
              Puedes revisar los locales mientras tanto y pedir en cuanto abran.
            </p>
            <div className="empty-actions">
              <button className="btn-primary-action" onClick={() => setVerTodos(true)}>
                Ver cartas de todos los locales
              </button>
              <button className="btn-secondary-action">
                Avísame cuando abran
              </button>
            </div>
          </div>

          <div className="proximas-aperturas">
            <h3 className="section-title">Próximas aperturas</h3>
            <div className="proximas-grid">
              {locales.map((loc) => (
                <div key={loc.id} className="proxima-card">
                  <div className="proxima-thumb"></div>
                  <div>
                    <h4 className="product-title" style={{ margin: 0 }}>{loc.nombre}</h4>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{loc.aperturaProx ? `Abre ${loc.aperturaProx}` : "Sin horario por ahora"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !localSeleccionado ? (
        /* CASO DEFAULT: LOCALES DEL CAMPUS */
        <div>
          <div className="locales-header-bar">
            <div>
              <h1 className="locales-title">Locales del campus</h1>
              <p className="locales-subtitle">
                {abiertos} {abiertos === 1 ? "local abierto" : "locales abiertos"} ahora
                {cerrados > 0 ? ` · ${cerrados} ${cerrados === 1 ? "cerrado" : "cerrados"}` : ""} · sede Monterrico
              </p>
            </div>
            <div className="locales-filter-controls">
              <select className="filter-dropdown" defaultValue="Monterrico">
                <option value="Monterrico">Sede: Monterrico</option>
                <option value="SanIsidro">Sede: San Isidro</option>
              </select>
              <button
                className={`filter-btn-toggle ${soloAbiertos ? "active" : ""}`}
                onClick={() => setSoloAbiertos(!soloAbiertos)}
              >
                {soloAbiertos ? "Solo abiertos ✕" : "Solo abiertos"}
              </button>
              <select className="filter-dropdown" defaultValue="espera">
                <option value="espera">Ordenar: menor espera</option>
                <option value="calificacion">Ordenar: mejor calificados</option>
              </select>
            </div>
          </div>

          {errorApi && <div className="alert-obligatorio">{errorApi}</div>}
          {cargandoLocales && <p className="locales-subtitle">Cargando locales…</p>}
          {!cargandoLocales && !errorApi && locales.length === 0 && (
            <p className="locales-subtitle">Todavía no hay locales disponibles.</p>
          )}

          <div className="locales-grid">
            {localesVisibles.map((local) => {
              const esCerrado = local.estado === "Cerrado";
              return (
                <article key={local.id} className={`local-card ${esCerrado ? "local-card--cerrado" : ""}`}>
                  <div className="local-card-image-placeholder" style={local.logo ? { background: fondoFoto(local.logo) } : undefined}>{local.logo ? "" : "foto local"}</div>
                  <div className="local-card-body">
                    <div className="local-title-row">
                      <h3>{local.nombre}</h3>
                      <span className={esCerrado || local.estado === "Suspendido" ? "status-pill pill-closed" : "status-pill pill-open"}>
                        {local.estado}
                      </span>
                    </div>
                    <p className="local-location-info">{local.ubicacion}</p>
                    <p className="local-time-rating">
                      {esCerrado && local.aperturaProx ? `Abre ${local.aperturaProx} · ` : ""}
                      {local.estado === "Suspendido" ? "Sin recepción de pedidos por ahora · " : ""}
                      {local.tiempoPrep ? `${local.tiempoPrep} · ` : ""}
                      <button className="btn-link-resenas" onClick={() => setLocalResenas(local)}>
                        Ver reseñas
                      </button>
                    </p>
                    <button
                      className={esCerrado ? "btn-ver-carta btn-ver-carta--disabled" : "btn-ver-carta"}
                      disabled={esCerrado}
                      onClick={() => handleVerCarta(local)}
                    >
                      Ver carta
                    </button>
                  </div>
                </article>
              );
            })}

            <div className="local-card-info-box">
              Los locales cerrados se muestran atenuados al final de la lista, nunca ocultos.
            </div>
          </div>
        </div>
      ) : (
        /* CASO CARTA DEL LOCAL SELECCIONADO */
        <div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setLocalSeleccionado(null)}>
              Locales
            </span>
            {" > "}
            <strong style={{ color: "var(--text)" }}>{localSeleccionado.nombre}</strong>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", boxShadow: "var(--shadow-warm)" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "56px", height: "56px", background: fondoFoto(localSeleccionado.logo), borderRadius: "var(--radius-container)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                {localSeleccionado.logo ? "" : "foto"}
              </div>
              <div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <h2 className="section-title" style={{ margin: 0 }}>{localSeleccionado.nombre}</h2>
                  <span className="status-pill pill-open">Abierto</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
                  {localSeleccionado.ubicacion || "Campus"}
                </p>
              </div>
            </div>
            <button className="btn-secondary-action" onClick={() => setLocalResenas(localSeleccionado)}>
              Ver reseñas
            </button>
          </div>

          {/* Categorías */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "16px" }}>
            {categoriasCarta.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                style={{
                  background: categoriaActiva === cat ? "var(--primary)" : "var(--surface)",
                  color: categoriaActiva === cat ? "var(--surface)" : "var(--text)",
                  border: `1px solid ${categoriaActiva === cat ? "var(--primary)" : "var(--border)"}`,
                  padding: "6px 16px",
                  borderRadius: "var(--radius-chip)",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <input
              type="text"
              style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "10px 16px", fontSize: "14px", outline: "none", fontFamily: "var(--font-body)" }}
              placeholder="Buscar producto o plato..."
              value={busquedaCarta}
              onChange={(e) => setBusquedaCarta(e.target.value)}
            />
          </div>

          {/* CARGANDO / ERROR / LOCAL SIN PRODUCTOS */}
          {cargandoCarta ? (
            <p className="locales-subtitle">Cargando carta…</p>
          ) : errorApi ? (
            <div className="alert-obligatorio">{errorApi}</div>
          ) : productos.length === 0 ? (
            <div className="sin-resultados-card">
              <div className="question-circle">?</div>
              <h3 className="section-title" style={{ margin: "0 0 8px 0" }}>
                Este local aún no tiene productos
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                Vuelve más tarde para ver su carta.
              </p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="sin-resultados-card">
              <div className="question-circle">?</div>
              <h3 className="section-title" style={{ margin: "0 0 8px 0" }}>
                Sin resultados para "{busquedaCarta}"
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 16px 0" }}>
                No encontramos productos que coincidan con tu búsqueda en {localSeleccionado.nombre}.
              </p>
              <div className="filter-active-tags">
                <span className="tag-pill">Búsqueda: {busquedaCarta}</span>
                <button
                  style={{ background: "transparent", border: "none", color: "var(--primary)", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                  onClick={() => setBusquedaCarta("")}
                >
                  Limpiar búsqueda
                </button>
              </div>
            </div>
          ) : (
            /* GRILLA DE PRODUCTOS CARTA */
            <div className="productos-grid">
              {productosFiltrados.map((prod) => (
                <div key={prod.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-warm)", opacity: prod.agotado ? 0.5 : 1 }}>
                  <div style={{ height: "140px", background: fondoFoto(prod.imagen), display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                    {prod.imagen ? "" : "foto 1:1"}
                  </div>
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 className="product-title" style={{ margin: 0 }}>{prod.nombre}</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "18px", margin: "6px 0 12px" }}>{prod.descripcion}</p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="price-text">S/ {prod.precio.toFixed(2)}</span>
                      
                      <button
                        style={{
                          background: prod.agotado ? "var(--bg)" : "var(--primary)",
                          color: prod.agotado ? "var(--text-muted)" : "var(--surface)",
                          border: prod.agotado ? "1px solid var(--border)" : "none",
                          padding: "8px 16px",
                          borderRadius: "var(--radius-container)",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                        onClick={() => handleAbrirDetalle(prod)}
                      >
                        {prod.agotado ? "Agotado" : "Agregar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {productoDetalle && (
        <div className="modal-overlay">
          <div className="modal-detalle-card">
            <button className="btn-close-modal" onClick={() => setProductoDetalle(null)}>✕</button>

            {/* PRODUCTO AGOTADO */}
            {productoDetalle.agotado ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ height: "160px", width: "160px", background: fondoFoto(productoDetalle.imagen), borderRadius: "var(--radius-card)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  {productoDetalle.imagen ? "" : "foto 1:1"}
                </div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {productoDetalle.nombre} <span className="status-pill pill-closed" style={{ marginLeft: "8px" }}>Agotado</span>
                </h2>
                <p style={{ color: "var(--text-muted)", margin: "8px 0 16px", fontSize: "14px" }}>{productoDetalle.descripcion}</p>
                <span className="price-text" style={{ fontSize: "20px", display: "block", marginBottom: "20px" }}>S/ {productoDetalle.precio.toFixed(2)}</span>
                
                <button className="btn-disabled-wide" disabled>Agotado por hoy</button>
                <button className="btn-outline-wide" onClick={() => setProductoDetalle(null)}>Volver a la carta</button>
              </div>
            ) : (
              /* PRODUCTO DISPONIBLE / OPCIONES */
              <div className="detalle-layout">
                <div>
                  <div style={{ height: "200px", background: fondoFoto(productoDetalle.imagen), borderRadius: "var(--radius-card)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                    {productoDetalle.imagen ? "" : "foto 1:1"}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
                    {localSeleccionado?.nombre}
                    {productoDetalle.tiempoPrep ? ` · ${productoDetalle.tiempoPrep} min de preparación` : ""}
                  </p>
                </div>

                <div>
                  <h2 className="section-title" style={{ margin: 0 }}>{productoDetalle.nombre}</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "6px 0 16px" }}>{productoDetalle.descripcion}</p>

                  {/* ALERTA OPCIÓN OBLIGATORIA */}
                  {errorObligatorio && (
                    <div className="alert-obligatorio">
                      Elige una opción en «{productoDetalle.grupos.find((g) => g.id === errorObligatorio)?.nombre}» para continuar.
                    </div>
                  )}

                  {/* GRUPOS DE OPCIONES Y AGREGADOS DEL LOCAL */}
                  {productoDetalle.grupos.map((grupo) => {
                    const faltaEste = errorObligatorio === grupo.id;
                    return (
                      <div key={grupo.id} className={`group-box ${faltaEste ? "group-box-error" : ""}`}>
                        <label className="field-label" style={{ color: faltaEste ? "var(--primary)" : "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                          {grupo.nombre.toUpperCase()} · {grupo.obligatorio ? "OBLIGATORIO" : "OPCIONAL"}
                        </label>
                        {grupo.alternativas.map((alt) => {
                          const marcada = (opcionesElegidas[grupo.id] || []).includes(alt.id);
                          return (
                            <label key={alt.id} className={grupo.seleccion === "unica" ? "radio-option" : "checkbox-option"}>
                              <span>
                                <input
                                  type={grupo.seleccion === "unica" ? "radio" : "checkbox"}
                                  name={`grupo-${grupo.id}`}
                                  checked={marcada}
                                  onChange={() => handleElegirOpcion(grupo, alt.id)}
                                  style={{ marginRight: "8px" }}
                                />
                                {alt.nombre}
                              </span>
                              <span style={{ color: "var(--text-muted)" }}>
                                {alt.precio === 0 ? "Sin costo" : `+ S/ ${alt.precio.toFixed(2)}`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* NOTA PARA EL LOCAL */}
                  <div className="group-box">
                    <label className="field-label" style={{ display: "block", marginBottom: "8px" }}>NOTA PARA EL LOCAL</label>
                    <textarea
                      className="nota-textarea"
                      placeholder="Sin cebolla, por favor."
                      maxLength={120}
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                    />
                  </div>

                  {errorAgregar && <div className="alert-obligatorio">{errorAgregar}</div>}

                  {/* BOTTOM BAR DE ACCIÓN */}
                  <div className="modal-bottom-bar">
                    <div className="counter-box">
                      <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
                      <span>{cantidad}</span>
                      <button onClick={() => setCantidad(cantidad + 1)}>+</button>
                    </div>

                    <button className="btn-primary-action" style={{ flex: 1 }} onClick={handleAgregarAlCarrito} disabled={agregando}>
                      {agregando ? "Agregando..." : `Agregar al carrito · S/ ${calcularTotalProducto()}`}
                    </button>

                    <button className="btn-secondary-action" onClick={() => setProductoDetalle(null)}>
                      Volver
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