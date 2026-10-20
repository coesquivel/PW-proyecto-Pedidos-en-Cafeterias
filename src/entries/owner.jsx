// src/entries/owner.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// 1. Estructura (Partials)
import HeaderOwner from '../partials/ControlPanel/Owner/HeaderOwner/HeaderOwner'
import SideBarOwner from '../partials/ControlPanel/Owner/SideBarOwner/SideBarOwner'
import FooterOwner from '../partials/ControlPanel/Owner/FooterOwner/FooterOwner'

// 2. Vistas (Pages)
import Ranking from '../pages/PagesOwner/Ranking/Ranking'

// 3. CSS base
import './owner.css'

// Secciones del menú que todavía no tienen página
function EnConstruccion() {
  return <p className="owner-en-construccion">Esta sección aún no está disponible.</p>
}

function OwnerApp() {
  return (
    <BrowserRouter>
      <div className="owner-app">

        <header className="owner-app-header">
          <HeaderOwner />
        </header>

        <div className="owner-app-body">

          <aside className="owner-app-sidebar">
            <SideBarOwner />
          </aside>

          <main className="owner-app-content">
            <Routes>
              <Route path="/owner" element={<Navigate to="/owner/ranking" replace />} />
              <Route path="/owner/ranking" element={<Ranking />} />
              <Route path="*" element={<EnConstruccion />} />
            </Routes>
          </main>

        </div>

        <footer className="owner-app-footer">
          <FooterOwner />
        </footer>

      </div>
    </BrowserRouter>
  )
}

// 4. Montaje en el DOM
const container = document.getElementById('root')

if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <OwnerApp />
    </React.StrictMode>
  )
}