// src/partials/ControlPanel/SubHeader/SubHeaderComensal.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './SubHeaderComensal.css';

export default function SubHeaderComensal() {
  return (
    <nav className="comensal-subheader-tabs">
      <ul className="tabs-list">
        <li>
          <NavLink
            to="/comensales/localescomensal"
            className={({ isActive }) => (isActive ? 'tab-link tab-link--active' : 'tab-link')}
          >
            Locales
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/comensales/pedidos"
            className={({ isActive }) => (isActive ? 'tab-link tab-link--active' : 'tab-link')}
          >
            Mis pedidos <span className="tab-badge">2</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/comensales/calificaciones"
            className={({ isActive }) => (isActive ? 'tab-link tab-link--active' : 'tab-link')}
          >
            Mis calificaciones
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/comensales/micuenta"
            className={({ isActive }) => (isActive ? 'tab-link tab-link--active' : 'tab-link')}
          >
            Mi cuenta
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}