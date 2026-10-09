// src/entries/owner.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import Cabecera from '../partials/Cabecera'

function HolaMundo() {
  return (
    <>
        <h1>Hola</h1>
        <p>Hola mundo</p>
    </>
  )
}
// 3. Montaje en el DOM
const container = document.getElementById('root')
// la aplicacion en react se guardara en un div llamado root

if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <Cabecera />
      <HolaMundo />
    </React.StrictMode>
  )
}