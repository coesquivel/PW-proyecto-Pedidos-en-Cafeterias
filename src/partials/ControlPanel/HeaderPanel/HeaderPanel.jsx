import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerMiLocal, obtenerMiPerfil, cambiarEstadoLocal } from '../../../api/locales'
import './HeaderPanel.css'
import './HeaderPanel.menus.css'   // estilos de los menús desplegables

const ESTADOS = [
  { id: 'abierto',    label: 'Abierto',              corto: 'Abierto',    desc: 'Recibiendo pedidos con normalidad' },
  { id: 'suspendido', label: 'Recepción suspendida', corto: 'Suspendido', desc: 'Visible, pero sin nuevos pedidos' },
  { id: 'cerrado',    label: 'Cerrado',              corto: 'Cerrado',    desc: 'Apareces como cerrado' },
]

export default function HeaderPanel() {
  const [sede, setSede] = useState('')           // nombre del local en sesión
  const [perfil, setPerfil] = useState(null)
  const [estado, setEstado] = useState('abierto')
  const [menu, setMenu] = useState(null) // 'sede' | 'estado' | 'usuario' | null

  const rolUsuario = 'Encargado'
  const nombreUsuario = perfil ? perfil.name : ''
  const inicialesUsuario = perfil ? perfil.initials : ''

  useEffect(() => {
    obtenerMiLocal()
      .then((local) => { setSede(local.commercial_name); setEstado(local.reception_status) })
      .catch(() => setSede(''))
    obtenerMiPerfil().then(setPerfil).catch(() => setPerfil(null))

    // Si el estado se cambia desde otra pantalla (Agotados), el encabezado se actualiza
    const alCambiar = (e) => setEstado(e.detail)
    window.addEventListener('estado-local', alCambiar)
    return () => window.removeEventListener('estado-local', alCambiar)
  }, [])

  const navRef = useRef(null)

  // Cierra el menú al hacer clic fuera o al presionar Escape
  useEffect(() => {
    const fuera = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenu(null)
    }
    const tecla = (e) => {
      if (e.key === 'Escape') setMenu(null)
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [])

  const alternar = (nombre) => setMenu((actual) => (actual === nombre ? null : nombre))

  const elegirEstado = async (id) => {
    const anterior = estado
    setEstado(id)
    setMenu(null)
    try {
      await cambiarEstadoLocal(id)
    } catch {
      setEstado(anterior)   // si no se pudo guardar, vuelve al estado que tenía
    }
  }

  const estadoActual = ESTADOS.find((e) => e.id === estado)

  return (
    <nav className="enterprise-navbar" ref={navRef}>

      {/* IZQUIERDA */}
      <div className="enterprise-navbar__left">

        <Link className="enterprise-navbar__brand" to="/enterprises">
          Campus Pide
        </Link>

        <span className="enterprise-navbar__separator">·</span>

        <span className="enterprise-navbar__panel">Panel del local</span>

        {/* ===== Local en sesión ===== */}
        <span className="enterprise-navbar__sede-name">{sede}</span>

      </div>


      {/* DERECHA */}
      <div className="enterprise-navbar__right">

        {/* ===== Estado del local ===== */}
        <div className="enterprise-navbar__status">
          <span className="enterprise-navbar__status-label">Estado del local:</span>

          <div className="enterprise-navbar__dropdown">
            <button
              type="button"
              className={`enterprise-navbar__status-button enterprise-navbar__status-button--${estado}`}
              aria-haspopup="menu"
              aria-expanded={menu === 'estado'}
              onClick={() => alternar('estado')}
            >
              <span className="enterprise-navbar__status-dot" />
              <span>{estadoActual.corto}</span>
              <span className="enterprise-navbar__status-chevron">▾</span>
            </button>

            {menu === 'estado' && (
              <div className="enterprise-navbar__menu enterprise-navbar__menu--right" role="menu">
                <p className="enterprise-navbar__menu-title">Estado del local</p>
                {ESTADOS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={e.id === estado}
                    className={`enterprise-navbar__menu-item ${e.id === estado ? 'is-selected' : ''}`}
                    onClick={() => elegirEstado(e.id)}
                  >
                    <span className={`enterprise-navbar__menu-dot enterprise-navbar__menu-dot--${e.id}`} />
                    <span className="enterprise-navbar__menu-text">
                      <strong>{e.label}</strong>
                      <small>{e.desc}</small>
                    </span>
                    {e.id === estado && <span className="enterprise-navbar__check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* ===== Usuario ===== */}
        <div className="enterprise-navbar__dropdown">
          <button
            type="button"
            className="enterprise-navbar__user"
            title="Perfil de usuario"
            aria-haspopup="menu"
            aria-expanded={menu === 'usuario'}
            onClick={() => alternar('usuario')}
          >
            <span className="enterprise-navbar__avatar">{inicialesUsuario}</span>
            <span className="enterprise-navbar__user-name">{rolUsuario}</span>
            <span className="enterprise-navbar__user-chevron">▾</span>
          </button>

          {menu === 'usuario' && (
            <div className="enterprise-navbar__menu enterprise-navbar__menu--right" role="menu">
              <div className="enterprise-navbar__menu-header">
                <strong>{nombreUsuario}</strong>
                <small>{rolUsuario} · {sede}</small>
              </div>

              <Link
                to="/enterprises/perfil"
                role="menuitem"
                className="enterprise-navbar__menu-item"
                onClick={() => setMenu(null)}
              >
                Perfil del local
              </Link>
              <Link
                to="/enterprises/horario"
                role="menuitem"
                className="enterprise-navbar__menu-item"
                onClick={() => setMenu(null)}
              >
                Horario de atención
              </Link>

              <div className="enterprise-navbar__menu-sep" />

              <form method="POST" action="/enterprises/logout">
              <button
                type="submit"
                role="menuitem"
                className="enterprise-navbar__menu-item enterprise-navbar__menu-item--danger"
              >
                Cerrar sesión
              </button>
            </form>
            </div>
          )}
        </div>

      </div>

    </nav>
  )
}
