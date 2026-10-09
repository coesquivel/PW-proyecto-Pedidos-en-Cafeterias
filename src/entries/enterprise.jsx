import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Estructura (Partials)
import Cabecera from '../partials/ControlPanel/HeaderPanel/HeaderPanel';
import Footer from '../partials/ControlPanel/FooterPanel/FooterPanel';
import SideBar from '../partials/ControlPanel/SideBarPanel/SideBarPanel';

// 2. Vistas (Pages)
import Bandeja from '../pages/Bandeja/Bandeja';
import ResumenDia from '../pages/ResumenDia/ResumenDia';
import Entrega from '../pages/Entrega/Entrega';
import OpcionesAgregados from '../pages/OpcionesAgregados/OpcionesAgregados';
import Agotados from '../pages/Agotados/Agotados';
import Perfil from '../pages/Perfil/Perfil';
import Horario from '../pages/Horario/Horario';
import Micarta from '../pages/Micarta/Micarta';
// import Agotados from '../pages/Agotados';

// 3. CSS base
import './enterprise.css';

function EnterpriseApp() {
  return (
    <BrowserRouter>
      <div className="app">

        <header className="app-header">
          <Cabecera />
        </header>

        <div className="app-body">

          <aside className="app-sidebar">
            <SideBar />
          </aside>

          <Routes>
            <Route path="/enterprises" element={<Navigate to="/enterprises/bandeja" replace />} />
            <Route path="/enterprises/bandeja" element={<Bandeja />} />
            <Route path="/enterprises/resumenDia" element={<ResumenDia />} />
            <Route path="/enterprises/entrega" element={<Entrega />} />
            <Route path="/enterprises/opcionesAgregados" element={<OpcionesAgregados />} />
            <Route path="/enterprises/agotados" element={<Agotados />} />
            <Route path="/enterprises/perfil" element={<Perfil />} />
            <Route path="/enterprises/horario" element={<Horario />} />
            <Route path="/enterprises/Micarta" element={<Micarta />} />
            {/* <Route path="/enterprises/agotados" element={<Agotados />} /> */}
          </Routes>

        </div>

        <footer className="app-footer">
          <Footer />
        </footer>

      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <EnterpriseApp />
    </React.StrictMode>
  );
}