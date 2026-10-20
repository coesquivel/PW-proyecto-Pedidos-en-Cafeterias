// src/partials/ControlPanel/Owner/HeaderOwner/HeaderOwner.jsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './HeaderOwner.css'

export default function HeaderOwner() {
  const [busqueda, setBusqueda] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)

  const nombreUsuario = 'Administración'
  const inicialesUsuario = 'AD'

  const menuRef = useRef(null)

  // Cierra el menú al hacer clic fuera o al presionar Escape
  useEffect(() => {
    const fuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false)
    }
    const tecla = (e) => {
      if (e.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [])

  return (
    <nav className="owner-navbar">

      <Link className="owner-navbar__brand" to="/owner">
        Campus Pide <span className="owner-navbar__panel">· administración</span>
      </Link>

      <input
        type="search"
        className="owner-navbar__search"
        placeholder="Buscar comensal, local o código de pedido..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="owner-navbar__dropdown" ref={menuRef}>
        <button
          type="button"
          className="owner-navbar__user"
          aria-haspopup="menu"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span className="owner-navbar__avatar">{inicialesUsuario}</span>
          <span>{nombreUsuario}</span>
          <span className="owner-navbar__chevron">▾</span>
        </button>

        {menuAbierto && (
          <div className="owner-navbar__menu" role="menu">
            <form method="POST" action="/logout">
              <button type="submit" role="menuitem" className="owner-navbar__menu-item">
                Cerrar sesión
              </button>
            </form>
          </div>
        )}
      </div>

    </nav>
  )
}