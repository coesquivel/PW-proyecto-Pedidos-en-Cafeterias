import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './HeaderPanel.css'
import './HeaderPanel.menus.css'   // estilos de los menús desplegables

// Datos de ejemplo (luego los reemplazas por tu API / sesión)
const SEDES = [
  'Cafetería Central',
  'Sanguchería Pabellón E',
  'Café de Biblioteca',
  'Juguería La Fuente',
]

const ESTADOS = [
  { id: 'abierto',    label: 'Abierto',              corto: 'Abierto',    desc: 'Recibiendo pedidos con normalidad' },
  { id: 'suspendido', label: 'Recepción suspendida', corto: 'Suspendido', desc: 'Visible, pero sin nuevos pedidos' },
  { id: 'cerrado',    label: 'Cerrado',              corto: 'Cerrado',    desc: 'Apareces como cerrado' },
]

export default function HeaderPanel() {
  const [sede, setSede] = useState(SEDES[0])
  const [estado, setEstado] = useState('abierto')
  const [menu, setMenu] = useState(null) // 'sede' | 'estado' | 'usuario' | null

  const rolUsuario = 'Encargado'
  const nombreUsuario = 'Carlos Campos'
  const inicialesUsuario = 'CC'

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

  const elegirSede = (s) => { setSede(s); setMenu(null) }
  const elegirEstado = (id) => { setEstado(id); setMenu(null) }

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

        {/* ===== Selector de sede ===== */}
        <div className="enterprise-navbar__dropdown enterprise-navbar__dropdown--sede">
          <button
            type="button"
            className="enterprise-navbar__sede"
            aria-haspopup="menu"
            aria-expanded={menu === 'sede'}
            onClick={() => alternar('sede')}
          >
            <span className="enterprise-navbar__sede-name">{sede}</span>
            <span className="enterprise-navbar__chevron">▾</span>
          </button>

          {menu === 'sede' && (
            <div className="enterprise-navbar__menu enterprise-navbar__menu--left" role="menu">
              <p className="enterprise-navbar__menu-title">Cambiar de local</p>
              {SEDES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="menuitemradio"
                  aria-checked={s === sede}
                  className={`enterprise-navbar__menu-item ${s === sede ? 'is-selected' : ''}`}
                  onClick={() => elegirSede(s)}
                >
                  <span>{s}</span>
                  {s === sede && <span className="enterprise-navbar__check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

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
