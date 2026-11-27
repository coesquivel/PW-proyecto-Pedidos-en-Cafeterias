// src\pages\PagesComensal\MiCuentaComensal\MiCuentaComensal.jsx

import React from 'react';
import './MiCuentaComensal.css';

// Datos de ejemplo (luego se reemplazan por los de la API del comensal)
const CUENTA = {
  nombre: 'Mateo Ramírez',
  iniciales: 'MR',
  correo: 'mateo.ramirez@aloe.ulima.edu.pe',
  codigo: '20231234',
  telefono: '945 112 330',
};

export default function MiCuentaComensal() {
  return (
    <main className="comensal-main-layout micuenta-container">
      <div className="breadcrumbs">
        Cuenta &gt; <span>Mi cuenta</span>
      </div>

      <h1 className="locales-title">Mi cuenta</h1>
      <p className="locales-subtitle" style={{ marginBottom: '20px' }}>
        Gestiona tu información personal y preferencias de usuario.
      </p>

      <div className="micuenta-grid">
        <section className="micuenta-card micuenta-perfil">
          <div className="micuenta-avatar">{CUENTA.iniciales}</div>
          <h2 className="micuenta-nombre">{CUENTA.nombre}</h2>
          <p className="micuenta-rol">Comensal · Universidad de Lima</p>
          <form method="POST" action="/logout">
            <button type="submit" className="btn-secondary-action micuenta-salir">Cerrar sesión</button>
          </form>
        </section>

        <section className="micuenta-card">
          <h3 className="micuenta-card-title">Datos personales</h3>
          <dl className="micuenta-datos">
            <div><dt>Nombre</dt><dd>{CUENTA.nombre}</dd></div>
            <div><dt>Correo</dt><dd>{CUENTA.correo}</dd></div>
            <div><dt>Código</dt><dd>{CUENTA.codigo}</dd></div>
            <div><dt>Teléfono</dt><dd>{CUENTA.telefono}</dd></div>
          </dl>
        </section>
      </div>
    </main>
  );
}
