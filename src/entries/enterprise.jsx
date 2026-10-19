import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Estructura (Partials)
import Cabecera from '../partials/ControlPanel/HeaderPanel/HeaderPanel';
import Footer from '../partials/ControlPanel/FooterPanel/FooterPanel';
import SideBar from '../partials/ControlPanel/SideBarPanel/SideBarPanel';
//Partials no fue ordenado en su carpeta propia de ControlPanel/Enterprise/* por el momento

// 2. Vistas (Pages)
import Bandeja from '../pages/PagesEnterprise/Bandeja/Bandeja';
import ResumenDia from '../pages/PagesEnterprise/ResumenDia/ResumenDia';
import Entrega from '../pages/PagesEnterprise/Entrega/Entrega';
import OpcionesAgregados from '../pages/PagesEnterprise/OpcionesAgregados/OpcionesAgregados';
import Agotados from '../pages/PagesEnterprise/Agotados/Agotados';
import Perfil from '../pages/PagesEnterprise/Perfil/Perfil';
import PerfilVistaPrevia from '../pages/PagesEnterprise/Perfil/PerfilVistaPrevia';
import Horario from '../pages/PagesEnterprise/Horario/Horario';
import Micarta from '../pages/PagesEnterprise/Micarta/Micarta';
import NuevoProducto from '../pages/PagesEnterprise/Micarta/NuevoProducto';
import Resenas from '../pages/PagesEnterprise/Resenas/Resenas';
// import Agotados from '../pages/PagesEnterprise/Agotados';

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
            <Route path="/enterprises/PerfilVistaPrevia" element={<PerfilVistaPrevia />} />
            <Route path="/enterprises/horario" element={<Horario />} />
            <Route path="/enterprises/Micarta" element={<Micarta />} />
            <Route path="/enterprises/NuevoProducto" element={<NuevoProducto />} />
            <Route path="/enterprises/Resenas" element={<Resenas />} />
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