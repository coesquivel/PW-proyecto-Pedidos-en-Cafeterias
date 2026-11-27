import "./PerfilVistaPrevia.css";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPerfilLocal } from '../../../api/perfil';
import { obtenerMisResenas } from '../../../api/resenas';
import { obtenerProductos } from '../../../api/carta';

// Fondo de un recuadro con foto real (o el placeholder rayado de la hoja de estilos si no hay)
const conFoto = (url) => (url ? { background: `center / cover no-repeat url(${url})` } : undefined);

export default function PerfilVistaPrevia() {
    const navigate = useNavigate();
  const [local, setLocal] = useState(null);
  const [calificacion, setCalificacion] = useState('Sin calificaciones todavía');
  const [preparacion, setPreparacion] = useState('—');

  useEffect(() => {
    obtenerPerfilLocal().then(setLocal).catch(() => setLocal(null));

    obtenerMisResenas()
      .then(({ summary }) => {
        if (summary.total > 0) {
          setCalificacion(`${summary.average.toFixed(1)} · ${summary.total} ${summary.total === 1 ? 'calificación' : 'calificaciones'}`);
        }
      })
      .catch(() => {});

    // Preparación promedio = promedio del tiempo de preparación de los productos que lo tienen
    obtenerProductos()
      .then((productos) => {
        const tiempos = productos.map((p) => p.preparation_time).filter((t) => t !== null && t !== undefined);
        if (tiempos.length) setPreparacion(`${Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)} minutos`);
      })
      .catch(() => {});
  }, []);

  if (!local) {
    return <div className="pv-app p-4"><p className="text-secondary">Cargando perfil…</p></div>;
  }

  const LOCAL = {
    nombre: local.commercial_name,
    ubicacion: [local.campus_location, `Sede ${local.campus}`, local.ruc ? `RUC ${local.ruc}` : null].filter(Boolean).join(' · '),
    descripcion: local.description || 'Aún no agregaste una descripción.',
    correo: local.email,
    telefono: local.phone || '—',
    preparacion,
    calificacion,
  };

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
        <div className="pv-placeholder pv-portada" style={conFoto(local.photos[0]?.url)}>
          {!local.photos[0] && <span>foto de portada del local</span>}
        </div>

        <div className="card-body p-3">
          {/* 3.2 Fila: logo cuadrado + información del local */}
          <div className="d-flex gap-3">
            {/* Logo / foto de perfil del local */}
            <div className="pv-placeholder pv-logo-local flex-shrink-0" style={conFoto(local.logo_url)} />

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

          {/* 3.3 Galería: hasta 4 fotos en una fila (grilla de Bootstrap) */}
          <div className="row row-cols-4 g-2 my-3">
            {[0, 1, 2, 3].map((i) => (
              <div className="col" key={i}>
                <div className="pv-placeholder pv-foto" style={conFoto(local.photos[i]?.url)}>
                  {i === 3 && !local.photos[3] && <span>galería del local</span>}
                </div>
              </div>
            ))}
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