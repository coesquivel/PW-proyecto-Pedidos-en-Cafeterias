import { Link } from 'react-router-dom'
import './HeaderPanel.css'

export default function HeaderPanel() {
  const sede = 'Cafetería Central'
  const localAbierto = true
  const rolUsuario = 'Encargado'
  const inicialesUsuario = 'CC'

  return (
    <nav className="enterprise-navbar">

      {/* IZQUIERDA */}
      <div className="enterprise-navbar__left">

        <Link
          className="enterprise-navbar__brand"
          to="/enterprises"
        >
          Campus Pide
        </Link>

        <span className="enterprise-navbar__separator">
          ·
        </span>

        <span className="enterprise-navbar__panel">
          Panel del local
        </span>

        <button
          type="button"
          className="enterprise-navbar__sede"
        >
          <span className="enterprise-navbar__sede-name">
            {sede}
          </span>

          <span className="enterprise-navbar__chevron">
            ▾
          </span>
        </button>

      </div>


      {/* DERECHA */}
      <div className="enterprise-navbar__right">

        <div className="enterprise-navbar__status">

          <span className="enterprise-navbar__status-label">
            Estado del local:
          </span>

          <span
            className={`enterprise-navbar__status-button ${
              localAbierto
                ? 'enterprise-navbar__status-button--open'
                : 'enterprise-navbar__status-button--closed'
            }`}
          >
            <span className="enterprise-navbar__status-dot" />

            <span>
              {localAbierto ? 'Abierto' : 'Cerrado'}
            </span>

            <span className="enterprise-navbar__status-chevron">
              ▾
            </span>
          </span>

        </div>


        <button
          type="button"
          className="enterprise-navbar__user"
          title="Perfil de usuario"
        >
          <span className="enterprise-navbar__avatar">
            {inicialesUsuario}
          </span>

          <span className="enterprise-navbar__user-name">
            {rolUsuario}
          </span>

          <span className="enterprise-navbar__user-chevron">
            ▾
          </span>
        </button>

      </div>

    </nav>
  )
}
