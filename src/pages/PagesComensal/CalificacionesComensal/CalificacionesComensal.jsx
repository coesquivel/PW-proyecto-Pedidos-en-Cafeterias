// src\pages\CalificacionesComensal\CalificacionesComensal.jsx

import React from 'react';
import './CalificacionesComensal.css';

export default function CalificacionesComensal() {
  return (
    <main className="comensal-main-layout calificaciones-container">
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "bold" }}>Mis calificaciones</h1>
        <p style={{ color: "#718096" }}>Opiniones y valoraciones que has dejado a los locales del campus.</p>
      </div>
    </main>
  );
}