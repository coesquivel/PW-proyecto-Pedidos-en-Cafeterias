// src/partials/ControlPanel/HeaderPanel/HeaderComensal.jsx

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerMiPerfil } from '../../../../api/locales'
import './HeaderComensal.css'

export default function HeaderComensal({ cantidadItems = 0 }) {
  const [busqueda, setBusqueda] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)

  const cantidadCarrito = cantidadItems
  const [perfil, setPerfil] = useState(null)
  const nombreUsuario = perfil ? perfil.name : ''
  const inicialesUsuario = perfil ? perfil.initials : ''

  // Nombre real de la cuenta en sesión
  useEffect(() => {
    obtenerMiPerfil().then(setPerfil).catch(() => setPerfil(null))
  }, [])

  // Cierra el menú al hacer clic fuera o al presionar Escape
  useEffect(() => {
    const clickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false)
      }
    }
    const escape = (e) => {
      if (e.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('mousedown', clickFuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', clickFuera)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  return (
    <header className="comensal-header">
      <div className="comensal-navbar">
        {/* IZQUIERDA: Logotipo */}
        <div className="comensal-navbar__left">
          <Link className="comensal-navbar__brand" to="/comensales/localescomensal">
            Campus Pide
          </Link>
        </div>

        {/* CENTRO: Buscador */}
        <div className="comensal-navbar__center">
          <div className="comensal-navbar__search-box">
            <input
              type="text"
              className="comensal-navbar__search-input"
              placeholder="Buscar producto o local..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* DERECHA: Carrito y Menú de Usuario */}
        <div className="comensal-navbar__right">
          <Link to="/comensales/carrito" className="comensal-navbar__cart-btn">
            <span>Carrito</span>
            {cantidadCarrito > 0 && (
              <span className="comensal-navbar__cart-badge">
                {cantidadCarrito}
              </span>
            )}
          </Link>

          <div className="comensal-navbar__dropdown" ref={menuRef}>
            <button
              type="button"
              className="comensal-navbar__user-btn"
              title="Cuenta de usuario"
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((v) => !v)}
            >
              <span className="comensal-navbar__avatar">{inicialesUsuario}</span>
              <span className="comensal-navbar__user-name">{nombreUsuario}</span>
              <span className="comensal-navbar__user-chevron">▾</span>
            </button>

            {menuAbierto && (
              <div className="comensal-navbar__menu" role="menu">
                <div className="comensal-navbar__menu-header">{nombreUsuario}</div>
                <form method="POST" action="/logout">
                  <button
                    type="submit"
                    role="menuitem"
                    className="comensal-navbar__menu-item comensal-navbar__menu-item--danger"
                  >
                    Cerrar sesión
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}