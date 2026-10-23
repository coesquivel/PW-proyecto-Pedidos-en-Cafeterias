// src/pages/PagesOwner/Comensales/Comensales.jsx
// Una sola página con dos pestañas: Comensales y Locales.
// Rutas: /owner/comensales  y  /owner/locales

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../OwnerUI.css'
import './Comensales.css'

/* ---------- Datos de ejemplo ---------- */

const CARRERAS = ['Ing. Industrial', 'Derecho', 'Administración', 'Comunicación', 'Psicología', 'Arquitectura']

const quitarTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')

function crearComensal(id, nombre, carrera, pedidos, noRecogidos, bloqueado = false) {
  const [n, a] = nombre.split(' ')
  return {
    id,
    nombre,
    correo: `${quitarTildes(n)}.${quitarTildes(a)}@aloe.ulima.edu.pe`.toLowerCase(),
    carrera,
    pedidos,
    noRecogidos,
    estado: bloqueado ? 'Bloqueado' : 'Activo',
    motivo: bloqueado ? 'Pedidos no recogidos reiterados' : '',
  }
}

const COMENSALES_INICIALES = [
  crearComensal(1,  'Mateo Rojas Ibáñez',       'Ing. Industrial', 24, 0),
  crearComensal(2,  'Camila Ayala Ponce',       'Derecho',         31, 1),
  crearComensal(3,  'Diego Salazar Trigoso',    'Ing. Industrial', 6,  4, true),
  crearComensal(4,  'Andrea Núñez Lozano',      'Comunicación',    12, 0),
  crearComensal(5,  'Renzo Vílchez Paredes',    'Administración',  18, 1),
  crearComensal(6,  'Sofía Cárdenas Loayza',    'Psicología',      27, 0),
  crearComensal(7,  'Joaquín Bravo Silva',      'Arquitectura',    9,  0),
  crearComensal(8,  'Valeria Quispe Mendoza',   'Ing. Industrial', 22, 0),
  crearComensal(9,  'Luis Huamán Torres',       'Derecho',         15, 2),
  crearComensal(10, 'Fernanda Rivas Castro',    'Administración',  33, 0),
  crearComensal(11, 'Sebastián Cueva Marín',    'Comunicación',    8,  3),
  crearComensal(12, 'Lucía Paredes Vega',       'Psicología',      19, 0),
  crearComensal(13, 'Gabriel Soto Medina',      'Ing. Industrial', 14, 1),
  crearComensal(14, 'Daniela Flores Campos',    'Arquitectura',    25, 0),
  crearComensal(15, 'Hugo Palacios Reyes',      'Derecho',         5,  5, true),
  crearComensal(16, 'Isabella Córdova Luna',    'Comunicación',    29, 0),
  crearComensal(17, 'Marco Delgado Pinto',      'Administración',  11, 0),
  crearComensal(18, 'Natalia Esquivel Rojas',   'Ing. Industrial', 20, 1),
  crearComensal(19, 'Adrián Fuentes Salas',     'Psicología',      7,  2),
  crearComensal(20, 'Paula Guerra Zevallos',    'Derecho',         16, 0),
  crearComensal(21, 'Rodrigo Mejía Aguirre',    'Arquitectura',    13, 0),
]

const LOCALES_INICIALES = [
  { id: 1, nombre: 'Cafetería Central',          correo: 'central@campuspide.pe',     pedidos: 540, cancelados: 21, estado: 'Activo', motivo: '' },
  { id: 2, nombre: 'Menú Universitario N',       correo: 'menu.n@campuspide.pe',      pedidos: 402, cancelados: 25, estado: 'Activo', motivo: '' },
  { id: 3, nombre: 'Sanguchería del pabellón E', correo: 'sangucheria.e@campuspide.pe', pedidos: 310, cancelados: 18, estado: 'Activo', motivo: '' },
  { id: 4, nombre: 'Café de Biblioteca',         correo: 'biblioteca@campuspide.pe',  pedidos: 215, cancelados: 9,  estado: 'Activo', motivo: '' },
  { id: 5, nombre: 'Juguería La Fuente',         correo: 'lafuente@campuspide.pe',    pedidos: 117, cancelados: 9,  estado: 'Suspendido', motivo: 'Incumplimiento de horarios' },
]

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

  const [comensales, setComensales] = useState(COMENSALES_INICIALES)
  const [locales, setLocales] = useState(LOCALES_INICIALES)

  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('todos')
  const [carrera, setCarrera] = useState('todas')
  const [pagina, setPagina] = useState(1)

  const [modal, setModal] = useState(null) // { item }
  const [aviso, setAviso] = useState('')

  const items = esComensales ? comensales : locales
  const estadoNegativo = esComensales ? 'Bloqueado' : 'Suspendido'
  const palabraPlural = esComensales ? 'comensales' : 'locales'

  const hayFiltros = busqueda.trim() !== '' || estado !== 'todos' || (esComensales && carrera !== 'todas')

  const filtrados = useMemo(() => {
    const q = quitarTildes(busqueda.trim().toLowerCase())
    return items.filter((it) => {
      if (estado !== 'todos' && it.estado !== estado) return false
      if (esComensales && carrera !== 'todas' && it.carrera !== carrera) return false
      if (!q) return true
      const texto = quitarTildes(`${it.nombre} ${it.correo}`.toLowerCase())
      return texto.includes(q)
    })
  }, [items, busqueda, estado, carrera, esComensales])

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
    setCarrera('todas')
    setPagina(1)
  }

  function cambiarTab(destino) {
    if (destino !== tab) navigate(`/owner/${destino}`)
  }

  /* Acciones sobre la cuenta */

  function aplicarBloqueo(item, motivo, detalle) {
    const actualizar = (lista) =>
      lista.map((x) =>
        x.id === item.id ? { ...x, estado: estadoNegativo, motivo: detalle ? `${motivo} · ${detalle}` : motivo } : x
      )
    if (esComensales) setComensales(actualizar)
    else setLocales(actualizar)
    setModal(null)
    setAviso(`${esComensales ? 'Cuenta de' : 'Local'} ${item.nombre} ${esComensales ? 'bloqueada' : 'suspendido'}.`)
  }

  function reactivar(item) {
    const actualizar = (lista) =>
      lista.map((x) => (x.id === item.id ? { ...x, estado: 'Activo', motivo: '' } : x))
    if (esComensales) setComensales(actualizar)
    else setLocales(actualizar)
    setAviso(`${esComensales ? 'Cuenta de' : 'Local'} ${item.nombre} reactivad${esComensales ? 'a' : 'o'}.`)
  }

  /* Contenido del modal según la pestaña */

  const modalProps = modal
    ? esComensales
      ? {
          titulo: `Bloquear a ${modal.item.nombre.split(' ').slice(0, 2).join(' ')}`,
          descripcion: 'No podrá crear nuevos pedidos hasta que se reactive su cuenta. Los pedidos en curso se mantienen.',
          motivos: MOTIVOS_COMENSAL.map((t, i) => ({
            texto: t,
            etiqueta: i === 0 && modal.item.noRecogidos > 0 ? `${t} (${modal.item.noRecogidos})` : t,
          })),
          motivoInicial: modal.item.noRecogidos >= 3 ? MOTIVOS_COMENSAL[0] : '',
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
  if (esComensales && carrera !== 'todas') chips.push({ clave: 'carrera', texto: `Carrera: ${carrera}`, quitar: () => filtrar(setCarrera)('todas') })
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

        {esComensales && (
          <label className="owner-select">
            <select value={carrera} onChange={(e) => filtrar(setCarrera)(e.target.value)} aria-label="Carrera">
              <option value="todas">Carrera: todas</option>
              {CARRERAS.map((c) => (
                <option key={c} value={c}>Carrera: {c}</option>
              ))}
            </select>
          </label>
        )}

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
              <th className="num">{esComensales ? 'No recogidos' : 'Cancelados'}</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((it) => {
              const negativo = it.estado === estadoNegativo
              const indicador = esComensales ? it.noRecogidos : it.cancelados
              return (
                <tr key={it.id} className={negativo ? 'is-negativo' : ''} title={negativo ? `Motivo: ${it.motivo}` : undefined}>
                  <td>{it.nombre}</td>
                  <td className="cm-correo">{it.correo}</td>
                  <td className="num">{it.pedidos}</td>
                  <td className={`num ${esComensales && indicador >= 3 ? 'cm-alerta' : ''}`}>{indicador}</td>
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

        {visibles.length === 0 && <p className="owner-vacio cm-vacio">No hay resultados con esos filtros.</p>}
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
