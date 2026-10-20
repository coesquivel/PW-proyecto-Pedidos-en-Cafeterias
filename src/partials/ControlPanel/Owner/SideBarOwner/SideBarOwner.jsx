// src/partials/ControlPanel/Owner/SideBarOwner/SideBarOwner.jsx
import { NavLink } from 'react-router-dom'
import './SideBarOwner.css'

const sections = [
  {
    title: 'MÉTRICAS',
    items: [
      { label: 'Tablero de ventas', path: '/owner/tablero' },
      { label: 'Ventas por producto y franja', path: '/owner/ventas' },
    ],
  },
  {
    title: 'CUENTAS',
    items: [
      { label: 'Comensales', path: '/owner/comensales' },
      { label: 'Locales', path: '/owner/locales' },
      { label: 'Solicitudes de registro', path: '/owner/solicitudes', badge: 2 },
    ],
  },
  {
    title: 'CONTENIDO',
    items: [
      { label: 'Ranking de productos y locales', path: '/owner/ranking' },
    ],
  },
]

export default function SideBarOwner() {
  return (
    <div className="sidebar-owner">
      {sections.map((section) => (
        <section className="sidebar-owner__section" key={section.title}>
          <h3 className="sidebar-owner__title">{section.title}</h3>

          <nav>
            {section.items.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-owner__item ${isActive ? 'sidebar-owner__item--active' : ''}`
                }
              >
                <span>{item.label}</span>

                {item.badge !== undefined && (
                  <span className="sidebar-owner__badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </section>
      ))}
    </div>
  )
}