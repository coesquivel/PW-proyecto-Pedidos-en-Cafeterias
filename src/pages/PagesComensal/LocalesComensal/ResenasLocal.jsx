// src/pages/PagesComensal/LocalesComensal/ResenasLocal.jsx
import React, { useEffect, useState } from 'react';
import { obtenerResenasLocal } from '../../../api/resenas';
import './ResenasLocal.css';

const POR_PAGINA = 3;

const FILTROS = [
  { id: "todas", label: "Todas", cumple: () => true },
  { id: "5", label: "5 ★", cumple: (r) => r.estrellas === 5 },
  { id: "4", label: "4 ★", cumple: (r) => r.estrellas === 4 },
  { id: "3", label: "3 ★ o menos", cumple: (r) => r.estrellas <= 3 },
];

const ORDENES = {
  recientes: (a, b) => b.fecha.localeCompare(a.fecha),
  mejores: (a, b) => b.estrellas - a.estrellas || b.fecha.localeCompare(a.fecha),
  peores: (a, b) => a.estrellas - b.estrellas || b.fecha.localeCompare(a.fecha),
};

const formatearFecha = (iso) => iso.split("-").reverse().join("/");

const iniciales = (nombre) => nombre.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const colorBarra = (estrellas) => {
  if (estrellas >= 4) return "var(--success)";
  if (estrellas === 3) return "var(--warning)";
  return "var(--danger)";
};

function Estrellas({ valor, className = "" }) {
  return (
    <span className={`resenas-stars ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.floor(valor) ? "resenas-star--on" : "resenas-star--off"}>★</span>
      ))}
    </span>
  );
}

export default function ResenasLocal({ local, onVolverLocales, onVerCarta }) {
  const [filtro, setFiltro] = useState("todas");
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);

  const [resenas, setResenas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerResenasLocal(local.id)
      .then((datos) => {
        setResumen(datos.summary);
        setResenas(
          datos.reviews.map((r) => ({
            id: r.id,
            autor: r.author,
            estrellas: r.rating,
            fecha: r.date,
            texto: r.comment || "",
            respuesta: r.reply,
            productos: r.products.map((p) => p.name),
          }))
        );
      })
      .catch(() => setResenas([]))
      .finally(() => setCargando(false));
  }, [local.id]);

  const DISTRIBUCION = [5, 4, 3, 2, 1].map((estrellas) => ({
    estrellas,
    cantidad: resumen ? resumen.distribution[estrellas] : 0,
  }));
  const totalCalificaciones = resumen ? resumen.total : 0;
  const calificacion = resumen && resumen.average !== null ? resumen.average : 0;
  const maxCantidad = Math.max(1, ...DISTRIBUCION.map((d) => d.cantidad));

  const filtroActivo = FILTROS.find((f) => f.id === filtro);
  const resenasFiltradas = resenas.filter(filtroActivo.cumple).sort(ORDENES[orden]);
  const totalPaginas = Math.max(1, Math.ceil(resenasFiltradas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const resenasPagina = resenasFiltradas.slice(inicio, inicio + POR_PAGINA);

  const cambiarFiltro = (id) => {
    setFiltro(id);
    setPagina(1);
  };

  const cambiarOrden = (valor) => {
    setOrden(valor);
    setPagina(1);
  };

  return (
    <div className="resenas-layout">
      <div className="resenas-breadcrumbs">
        <button onClick={onVolverLocales}>Locales</button>
        <span className="resenas-breadcrumbs-sep">›</span>
        <button onClick={onVerCarta}>{local.nombre}</button>
        <span className="resenas-breadcrumbs-sep">›</span>
        <strong>Reseñas</strong>
      </div>

      <h1 className="resenas-title">Reseñas de {local.nombre}</h1>

      <div className="resenas-grid">
        {/* COLUMNA IZQUIERDA: RESUMEN */}
        <aside>
          <div className="resenas-card resenas-score-card">
            <span className="resenas-score">{totalCalificaciones ? calificacion.toFixed(1) : "—"}</span>
            <Estrellas valor={calificacion} className="resenas-stars--lg" />
            <span className="resenas-score-count">{totalCalificaciones} calificaciones</span>
          </div>

          <div className="resenas-card resenas-dist-card">
            {DISTRIBUCION.map((d) => (
              <div key={d.estrellas} className="resenas-dist-row">
                <span className="resenas-dist-label">{d.estrellas} ★</span>
                <div className="resenas-dist-bar">
                  <div
                    className="resenas-dist-fill"
                    style={{ width: `${totalCalificaciones ? (d.cantidad / totalCalificaciones) * 100 : 0}%`, background: colorBarra(d.estrellas), minWidth: d.cantidad > 0 && d.cantidad < maxCantidad ? "4px" : 0 }}
                  ></div>
                </div>
                <span className="resenas-dist-count">{d.cantidad}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* COLUMNA DERECHA: LISTA DE RESEÑAS */}
        <section>
          <div className="resenas-toolbar">
            <div className="resenas-filtros">
              <span className="resenas-filtros-label">Filtrar:</span>
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  className={`resenas-chip ${filtro === f.id ? "resenas-chip--active" : ""}`}
                  onClick={() => cambiarFiltro(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select className="resenas-orden" value={orden} onChange={(e) => cambiarOrden(e.target.value)}>
              <option value="recientes">Ordenar: más recientes</option>
              <option value="mejores">Ordenar: mejor nota</option>
              <option value="peores">Ordenar: peor nota</option>
            </select>
          </div>

          {resenasPagina.length === 0 ? (
            <div className="resenas-card resenas-vacio">{cargando ? "Cargando reseñas…" : "No hay reseñas con este filtro todavía."}</div>
          ) : (
            resenasPagina.map((r) => (
              <article key={r.id} className="resenas-card resenas-item">
                <div className="resenas-item-head">
                  <div className="resenas-autor">
                    <span className="resenas-avatar">{iniciales(r.autor)}</span>
                    <span className="resenas-autor-nombre">{r.autor}</span>
                    <Estrellas valor={r.estrellas} />
                  </div>
                  <span className="resenas-fecha">{formatearFecha(r.fecha)}</span>
                </div>
                {r.texto && <p className="resenas-texto">{r.texto}</p>}
                {r.respuesta && <p className="resenas-texto"><strong>Respuesta del local:</strong> {r.respuesta}</p>}
                <div className="resenas-tags">
                  {r.productos.map((p) => (
                    <span key={p} className="resenas-tag">{p}</span>
                  ))}
                </div>
              </article>
            ))
          )}

          <div className="resenas-footer">
            <span className="resenas-mostrando">
              {resenasFiltradas.length === 0
                ? "Sin reseñas"
                : `Mostrando ${inicio + 1} a ${inicio + resenasPagina.length} de ${resenasFiltradas.length} reseñas`}
            </span>
            <div className="resenas-paginacion">
              <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>‹</button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === pagina ? "resenas-page--active" : ""}
                  onClick={() => setPagina(n)}
                >
                  {n}
                </button>
              ))}
              <button disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}>›</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}