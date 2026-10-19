import "./PerfilVistaPrevia.css";
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';


/* Datos de ejemplo (luego puedes reemplazarlos por datos de tu API) */
const LOCAL = {
  nombre: "Cafetería Central",
  ubicacion: "Pabellón A, primer piso · Sede Monterrico · RUC 20512345678",
  descripcion:
    "Desayunos, menú del día y café pasado. Atendemos pedidos anticipados desde las 07:00 con recojo en el mostrador principal del pabellón A.",
  correo: "cafeteriacentral@ulima.edu.pe",
  telefono: "945 112 330",
  preparacion: "12 minutos",
  calificacion: "4.6 · 128 calificaciones",
};

export default function PerfilVistaPrevia() {
    const navigate = useNavigate();
  return (
    <div className="pv-app p-4">
      {/* 1. RUTA DE NAVEGACIÓN (breadcrumb): "Local › Perfil del local" */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb pv-xs mb-1">
          <li className="breadcrumb-item">Local</li>
          <li className="breadcrumb-item active">Perfil del local</li>
        </ol>
      </nav>

      {/* 2. ENCABEZADO: título a la izquierda + botón "Editar perfil" a la derecha */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h1 className="pv-titulo h4 mb-0">Perfil del local</h1>
        <button 
        className="btn btn-sm btn-outline-danger px-3" 
        type="button"
        onClick={() => navigate('/enterprises/Perfil')} /* Usa la URL correspondiente a Perfil.jsx */
        >
        Editar perfil
        </button>
      </div>

      {/* 3. TARJETA BLANCA DEL PERFIL */}
      <section className="card pv-card overflow-hidden">
        {/* 3.1 Foto de portada (placeholder con rayas) */}
        <div className="pv-placeholder pv-portada">
          <span>foto de portada del local</span>
        </div>

        <div className="card-body p-3">
          {/* 3.2 Fila: logo cuadrado + información del local */}
          <div className="d-flex gap-3">
            {/* Logo / foto de perfil del local */}
            <div className="pv-placeholder pv-logo-local flex-shrink-0" />

            <div>
              {/* Nombre + chips de estado */}
              <div className="d-flex align-items-center flex-wrap gap-2">
                <h2 className="pv-nombre mb-0">{LOCAL.nombre}</h2>
                <span className="badge rounded-pill text-bg-success">Abierto</span>
                <span className="badge rounded-pill pv-chip-claro">
                  Publicado en el directorio
                </span>
              </div>

              {/* Ubicación y RUC */}
              <p className="pv-xs text-secondary mt-1 mb-2">{LOCAL.ubicacion}</p>

              {/* Descripción */}
              <p className="pv-descripcion mb-0">{LOCAL.descripcion}</p>
            </div>
          </div>

          {/* 3.3 Galería: 4 fotos en una fila (grilla de Bootstrap) */}
          <div className="row row-cols-4 g-2 my-3">
            <div className="col"><div className="pv-placeholder pv-foto" /></div>
            <div className="col"><div className="pv-placeholder pv-foto" /></div>
            <div className="col"><div className="pv-placeholder pv-foto" /></div>
            <div className="col">
              <div className="pv-placeholder pv-foto">
                <span>galería del local</span>
              </div>
            </div>
          </div>

          {/* 3.4 Datos de contacto y métricas (4 columnas, con línea superior) */}
          <dl className="row border-top pt-3 mb-0 pv-datos">
            <div className="col-12 col-md-4">
              <dt>CORREO</dt>
              <dd>{LOCAL.correo}</dd>
            </div>
            <div className="col-6 col-md-2">
              <dt>TELÉFONO</dt>
              <dd>{LOCAL.telefono}</dd>
            </div>
            <div className="col-6 col-md-3">
              <dt>PREPARACIÓN PROMEDIO</dt>
              <dd>{LOCAL.preparacion}</dd>
            </div>
            <div className="col-12 col-md-3">
              <dt>CALIFICACIÓN</dt>
              <dd>{LOCAL.calificacion}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}