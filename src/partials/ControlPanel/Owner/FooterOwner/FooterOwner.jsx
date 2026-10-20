// src/partials/ControlPanel/Owner/FooterOwner/FooterOwner.jsx
import './FooterOwner.css'

export default function FooterOwner() {
  const soporte = 'campuspide@ulima.edu.pe'

  return (
    <div className="owner-footer">
      <div className="owner-footer__left">
        <span>Campus Pide · administración</span>
        <span>
          Soporte: <a href={`mailto:${soporte}`}>{soporte}</a>
        </span>
      </div>

      <span>Sesión iniciada como Administración</span>
    </div>
  )
}