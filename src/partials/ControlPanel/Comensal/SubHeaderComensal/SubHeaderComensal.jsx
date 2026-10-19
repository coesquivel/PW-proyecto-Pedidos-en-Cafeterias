// src/partials/ControlPanel/SubHeader/SubHeaderComensal.jsx
import { NavLink } from 'react-router-dom';
import './SubHeaderComensal.css';

const navItems = [
  { label: 'Locales', path: '/comensales/localescomensal' },
  { label: 'Mis pedidos', path: '/comensales/pedidos', badge: '2' },
  { label: 'Mis calificaciones', path: '/comensales/calificaciones' },
  { label: 'Mi cuenta', path: '/comensales/micuenta' },
];

export default function SubHeaderComensal() {
  return (
    <nav className="comensal-subheader-tabs">
      <ul className="tabs-list">
        {navItems.map((item) => (
          <li key={item.path} className="tab-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `tab-link ${isActive ? 'tab-link--active' : ''}`
              }
            >
              <span>{item.label}</span>
              {item.badge && <span className="tab-badge">{item.badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}