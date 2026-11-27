// src/pages/PagesOwner/Comensales/Comensales.jsx
// Una sola página con dos pestañas: Comensales y Locales.
// Rutas: /owner/comensales  y  /owner/locales

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../OwnerUI.css'
import {
  obtenerComensales, obtenerLocalesOwner, cambiarEstadoComensal, cambiarEstadoLocalOwner,
} from '../../../api/owner'
import { mensajeDeError } from '../../../api/carta'
import './Comensales.css'

const quitarTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')

// Comensal de la API -> fila de la tabla
const comensalAFila = (d) => ({
  id: d.id,
  nombre: d.name,
  correo: d.email,
  pedidos: d.orders,
  entregados: d.delivered,
  estado: d.status === 'bloqueado' ? 'Bloqueado' : 'Activo',
  motivo: d.reason || '',
})

// Local de la API -> fila de la tabla
const localAFila = (l) => ({
  id: l.id,
  nombre: l.name,
  correo: l.email,
  pedidos: l.orders,
  cancelados: l.cancelled,
  estado: l.status === 'suspendido' ? 'Suspendido' : 'Activo',
  motivo: l.reason || '',
})

const MOTIVOS_COMENSAL = [
  'Pedidos no recogidos reiterados',
  'Uso indebido de la plataforma',
  'Solicitud del propio usuario',
]

const MOTIVOS_LOCAL = [
  'Incumplimiento de horarios',
  'Reclamos reiterados de comensales',
  'Solicitud del propio local',
]

const POR_PAGINA = 7

/* ---------- Ventana emergente ---------- */

function ModalAccion({ titulo, descripcion, motivos, motivoInicial, etiquetaAccion, onCancelar, onConfirmar }) {
  const [motivo, setMotivo] = useState(motivoInicial)
  const [detalle, setDetalle] = useState('')

  useEffect(() => {
    const escape = (e) => { if (e.key === 'Escape') onCancelar() }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onCancelar])

  return (
    <div className="cm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancelar() }}>
      <div className="cm-modal" role="dialog" aria-modal="true" aria-labelledby="cm-titulo">
        <h2 className="cm-modal__titulo" id="cm-titulo">{titulo}</h2>
        <p className="cm-modal__texto">{descripcion}</p>

        <fieldset className="cm-modal__motivos">
          <legend>Motivo · obligatorio</legend>
          {motivos.map((m) => (
            <label key={m.texto} className={`cm-radio ${motivo === m.texto ? 'is-activo' : ''}`}>
              <input
                type="radio"
                name="motivo"
                checked={motivo === m.texto}
                onChange={() => setMotivo(m.texto)}
              />
              <span className="cm-radio__punto" />
              <span>{m.etiqueta || m.texto}</span>
            </label>
          ))}
        </fieldset>

        <textarea
          className="cm-modal__detalle"
          placeholder="Detalle interno (opcional)..."
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          rows={4}
        />

        <div className="cm-modal__acciones">
          <button type="button" className="owner-btn" onClick={onCancelar}>Cancelar</button>
          <button
            type="button"
            className="owner-btn owner-btn--danger"
            disabled={!motivo}
            onClick={() => onConfirmar(motivo, detalle.trim())}
          >
            {etiquetaAccion}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Página ---------- */

export default function Comensales({ tab = 'comensales' }) {
  const navigate = useNavigate()
  const esComensales = tab === 'comensales'

  const [comensales, setComensales] = useState([])
  const [locales, setLocales] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([obtenerComensales(), obtenerLocalesOwner()])
      .then(([listaComensales, listaLocales]) => {
        setComensales(listaComensales.map(comensalAFila))
        setLocales(listaLocales.map(localAFila))
      })
      .catch((e) => setAviso(mensajeDeError(e, 'No se pudieron cargar las cuentas.')))
      .finally(() => setCargando(false))
  }, [])

  // El buscador del encabezado envía el texto en ?q=...
  const [params] = useSearchParams()
  const textoUrl = params.get('q') || ''
  const [busqueda, setBusqueda] = useState(textoUrl)
  const [estado, setEstado] = useState('todos')
  const [pagina, setPagina] = useState(1)

  // Si se busca de nuevo desde el encabezado, actualiza el filtro y vuelve a la página 1
  useEffect(() => {
    setBusqueda(textoUrl)
    setPagina(1)
  }, [textoUrl])

  const [modal, setModal] = useState(null) // { item }
  const [aviso, setAviso] = useState('')

  const items = esComensales ? comensales : locales
  const estadoNegativo = esComensales ? 'Bloqueado' : 'Suspendido'
  const palabraPlural = esComensales ? 'comensales' : 'locales'

  const hayFiltros = busqueda.trim() !== '' || estado !== 'todos'

  const filtrados = useMemo(() => {
    const q = quitarTildes(busqueda.trim().toLowerCase())
    return items.filter((it) => {
      if (estado !== 'todos' && it.estado !== estado) return false
      if (!q) return true
      const texto = quitarTildes(`${it.nombre} ${it.correo}`.toLowerCase())
      return texto.includes(q)
    })
  }, [items, busqueda, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  function filtrar(setter) {
    return (valor) => {
      setter(valor)
      setPagina(1)
      setAviso('')
    }
  }

  function limpiarTodo() {
    setBusqueda('')
    setEstado('todos')
    setPagina(1)
  }

  function cambiarTab(destino) {
    if (destino !== tab) navigate(`/owner/${destino}`)
  }

  /* Acciones sobre la cuenta */

  const reemplazar = (fila) => (lista) => lista.map((x) => (x.id === fila.id ? fila : x))

  async function aplicarBloqueo(item, motivo, detalle) {
    const razon = detalle ? `${motivo} · ${detalle}` : motivo
    try {
      if (esComensales) {
        setComensales(reemplazar(comensalAFila(await cambiarEstadoComensal(item.id, 'bloqueado', razon))))
      } else {
        setLocales(reemplazar(localAFila(await cambiarEstadoLocalOwner(item.id, 'suspendido', razon))))
      }
      setModal(null)
      setAviso(`${esComensales ? 'Cuenta de' : 'Local'} ${item.nombre} ${esComensales ? 'bloqueada' : 'suspendido'}.`)
    } catch (e) {
      setModal(null)
      setAviso(mensajeDeError(e, 'No se pudo aplicar el cambio.'))
    }
  }

  async function reactivar(item) {
    try {
      if (esComensales) {
        setComensales(reemplazar(comensalAFila(await cambiarEstadoComensal(item.id, 'activo'))))
      } else {
        setLocales(reemplazar(localAFila(await cambiarEstadoLocalOwner(item.id, 'activo'))))
      }
      setAviso(`${esComensales ? 'Cuenta de' : 'Local'} ${item.nombre} reactivad${esComensales ? 'a' : 'o'}.`)
    } catch (e) {
      setAviso(mensajeDeError(e, 'No se pudo reactivar.'))
    }
  }

  /* Contenido del modal según la pestaña */

  const modalProps = modal
    ? esComensales
      ? {
          titulo: `Bloquear a ${modal.item.nombre.split(' ').slice(0, 2).join(' ')}`,
          descripcion: 'No podrá crear nuevos pedidos hasta que se reactive su cuenta. Los pedidos en curso se mantienen.',
          motivos: MOTIVOS_COMENSAL.map((t) => ({ texto: t })),
          motivoInicial: '',
          etiquetaAccion: 'Bloquear cuenta',
        }
      : {
          titulo: `Suspender ${modal.item.nombre}`,
          descripcion: 'El local dejará de recibir pedidos hasta que se reactive. Los pedidos en curso se mantienen.',
          motivos: MOTIVOS_LOCAL.map((t) => ({ texto: t })),
          motivoInicial: '',
          etiquetaAccion: 'Suspender local',
        }
    : null

  /* Chips de filtros activos */
  const chips = []
  if (estado !== 'todos') chips.push({ clave: 'estado', texto: `Estado: ${estado}`, quitar: () => filtrar(setEstado)('todos') })

  return (
    <section className="owner-page">
      <p className="owner-page__crumbs">Cuentas › {esComensales ? 'Comensales' : 'Locales'}</p>

      <div className="owner-page__head">
        <h1 className="owner-page__title">Usuarios y locales</h1>
      </div>

      {/* Pestañas */}
      <div className="cm-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={esComensales}
          className={`cm-tab ${esComensales ? 'is-activo' : ''}`}
          onClick={() => cambiarTab('comensales')}
        >
          Comensales · {comensales.length}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!esComensales}
          className={`cm-tab ${!esComensales ? 'is-activo' : ''}`}
          onClick={() => cambiarTab('locales')}
        >
          Locales · {locales.length}
        </button>
      </div>

      {/* Filtros */}
      <div className="cm-filtros">
        <input
          type="search"
          className="cm-buscador"
          placeholder={esComensales ? 'Buscar por nombre o correo institucional...' : 'Buscar por nombre o correo del local...'}
          value={busqueda}
          onChange={(e) => filtrar(setBusqueda)(e.target.value)}
        />

        <label className="owner-select">
          <select value={estado} onChange={(e) => filtrar(setEstado)(e.target.value)} aria-label="Estado">
            <option value="todos">Estado: todos</option>
            <option value="Activo">Estado: Activo</option>
            <option value={estadoNegativo}>Estado: {estadoNegativo}</option>
          </select>
        </label>

        {chips.map((c) => (
          <span key={c.clave} className="cm-chip">
            {c.texto}
            <button type="button" aria-label={`Quitar filtro ${c.texto}`} onClick={c.quitar}>✕</button>
          </span>
        ))}

        {hayFiltros && (
          <button type="button" className="cm-limpiar" onClick={limpiarTodo}>Limpiar todo</button>
        )}
      </div>

      {aviso && (
        <p className="cm-aviso" role="status">
          {aviso}
          <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso('')}>✕</button>
        </p>
      )}

      {/* Tabla */}
      <div className="cm-tabla-wrap">
        <table className="cm-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>{esComensales ? 'Correo institucional' : 'Correo del local'}</th>
              <th className="num">Pedidos</th>
              <th className="num">{esComensales ? 'Entregados' : 'Rechazados'}</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((it) => {
              const negativo = it.estado === estadoNegativo
              const indicador = esComensales ? it.entregados : it.cancelados
              return (
                <tr key={it.id} className={negativo ? 'is-negativo' : ''} title={negativo ? `Motivo: ${it.motivo}` : undefined}>
                  <td>{it.nombre}</td>
                  <td className="cm-correo">{it.correo}</td>
                  <td className="num">{it.pedidos}</td>
                  <td className="num">{indicador}</td>
                  <td>
                    <span className={`cm-estado ${negativo ? 'cm-estado--neg' : 'cm-estado--ok'}`}>{it.estado}</span>
                  </td>
                  <td>
                    {negativo ? (
                      <button type="button" className="cm-accion" onClick={() => reactivar(it)}>Reactivar</button>
                    ) : (
                      <button type="button" className="cm-accion" onClick={() => setModal({ item: it })}>
                        {esComensales ? 'Bloquear' : 'Suspender'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {cargando && <p className="owner-vacio cm-vacio">Cargando…</p>}
        {!cargando && visibles.length === 0 && <p className="owner-vacio cm-vacio">No hay resultados con esos filtros.</p>}
      </div>

      {/* Pie de tabla */}
      <div className="cm-pie">
        <span className="cm-pie__texto">
          {filtrados.length === 0
            ? `Mostrando 0 de ${items.length} ${palabraPlural}`
            : `Mostrando ${inicio + 1} a ${inicio + visibles.length} de ${filtrados.length} ${palabraPlural}`}
        </span>

        {totalPaginas > 1 && (
          <nav className="cm-paginas" aria-label="Paginación">
            <button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)} aria-label="Anterior">‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={n === paginaActual ? 'is-activo' : ''}
                aria-current={n === paginaActual ? 'page' : undefined}
                onClick={() => setPagina(n)}
              >
                {n}
              </button>
            ))}
            <button type="button" disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)} aria-label="Siguiente">›</button>
          </nav>
        )}
      </div>

      {modal && (
        <ModalAccion
          key={modal.item.id}
          {...modalProps}
          onCancelar={() => setModal(null)}
          onConfirmar={(motivo, detalle) => aplicarBloqueo(modal.item, motivo, detalle)}
        />
      )}
    </section>
  )
}
