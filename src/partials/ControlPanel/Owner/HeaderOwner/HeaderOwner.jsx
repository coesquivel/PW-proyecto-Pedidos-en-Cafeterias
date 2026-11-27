// src/partials/ControlPanel/Owner/HeaderOwner/HeaderOwner.jsx
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './HeaderOwner.css'

export default function HeaderOwner() {
  const navigate = useNavigate()
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

  // Enter o clic en la lupa: lleva a Comensales con el texto ya buscado
  const buscar = (e) => {
    e.preventDefault()
    const q = busqueda.trim()
    navigate(q ? `/owner/comensales?q=${encodeURIComponent(q)}` : '/owner/comensales')
  }

  return (
    <nav className="owner-navbar">

      <Link className="owner-navbar__brand" to="/owner">
        Campus Pide <span className="owner-navbar__panel">· administración</span>
      </Link>

      <form className="owner-navbar__search-form" role="search" onSubmit={buscar}>
        <input
          type="search"
          className="owner-navbar__search"
          placeholder="Buscar comensal o local… (Enter)"
          aria-label="Buscar comensal o local"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </form>

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