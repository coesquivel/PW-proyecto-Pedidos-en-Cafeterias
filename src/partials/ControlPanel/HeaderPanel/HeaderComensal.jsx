// src/partials/ControlPanel/HeaderPanel/HeaderComensal.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import './HeaderComensal.css'

export default function HeaderComensal() {
  const [localSeleccionado, setLocalSeleccionado] = useState('Cafetería Central')
  const [busqueda, setBusqueda] = useState('')
  const cantidadCarrito = 3
  const nombreUsuario = 'Mateo'
  const inicialesUsuario = 'MR'

  return (
    <header className="comensal-header">
      <div className="comensal-navbar">
        {/* IZQUIERDA: Logotipo y selector de local */}
        <div className="comensal-navbar__left">
          <Link className="comensal-navbar__brand" to="/comensales/localescomensal">
            Campus Pide
          </Link>

          <div className="comensal-navbar__select-wrapper">
            <select
              className="comensal-navbar__select"
              value={localSeleccionado}
              onChange={(e) => setLocalSeleccionado(e.target.value)}
            >
              <option value="Cafetería Central">Cafetería Central</option>
              <option value="Sanguchería Pabellón E">Sanguchería Pabellón E</option>
              <option value="Café de Biblioteca">Café de Biblioteca</option>
            </select>
            <span className="comensal-navbar__select-chevron">▾</span>
          </div>
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

          <button
            type="button"
            className="comensal-navbar__user-btn"
            title="Cuenta de usuario"
          >
            <span className="comensal-navbar__avatar">{inicialesUsuario}</span>
            <span className="comensal-navbar__user-name">{nombreUsuario}</span>
            <span className="comensal-navbar__user-chevron">▾</span>
          </button>
        </div>
      </div>
    </header>
  )
}