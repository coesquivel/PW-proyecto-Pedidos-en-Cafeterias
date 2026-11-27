import { useEffect, useMemo, useRef, useState } from 'react';
import './Perfil.css';
import { useNavigate } from 'react-router-dom';
import {
    obtenerPerfilLocal, guardarPerfilLocal, agregarFotoLocal, quitarFotoLocal, cambiarLogoLocal,
} from '../../../api/perfil';
import { mensajeDeError } from '../../../api/carta';

const MAX_DESC = 240;
const MAX_FOTOS = 6;

const PERFIL_VACIO = { nombre: '', ubicacion: '', descripcion: '', correo: '', telefono: '' };
const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGEN = 3 * 1024 * 1024;

// Perfil de la API -> formulario de la pantalla
const perfilAFormulario = (p) => ({
    nombre: p.commercial_name,
    ubicacion: p.campus_location || '',
    descripcion: p.description || '',
    correo: p.email,
    telefono: p.phone || '',
});

const validar = (perfil) => {
    const e = {};
    if (!perfil.nombre.trim()) e.nombre = 'Ingresa el nombre comercial.';
    if (!perfil.ubicacion.trim()) e.ubicacion = 'Indica dónde está el local en el campus.';
    const digitos = perfil.telefono.replace(/\D/g, '').length;
    if (digitos < 7 || digitos > 14) e.telefono = 'Escribe un teléfono válido (entre 7 y 14 dígitos).';
    return e;
};

const unir = (items) =>
    items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

export default function Perfil() {
    const navigate = useNavigate();
    const [guardado, setGuardado] = useState({ perfil: PERFIL_VACIO, logo: null, fotos: [] });
    const [perfil, setPerfil] = useState(PERFIL_VACIO);
    const [logo, setLogo] = useState(null);                 // lo que se muestra: url guardada o vista previa
    const [archivoLogo, setArchivoLogo] = useState(null);   // logotipo nuevo pendiente de subir
    const [fotos, setFotos] = useState([]);                 // { id, src, archivo? } (archivo = pendiente de subir)
    const [errores, setErrores] = useState({});
    const [aviso, setAviso] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const inputLogo = useRef(null);
    const inputFotos = useRef(null);
    const siguienteId = useRef(-1); // ids negativos = fotos nuevas aún no guardadas

    useEffect(() => {
        obtenerPerfilLocal()
            .then((p) => {
                const formulario = perfilAFormulario(p);
                const galeria = p.photos.map((f) => ({ id: f.id, src: f.url }));
                setGuardado({ perfil: formulario, logo: p.logo_url, fotos: galeria });
                setPerfil(formulario);
                setLogo(p.logo_url);
                setFotos(galeria);
            })
            .catch((e) => setAviso(mensajeDeError(e, 'No se pudo cargar el perfil.')))
            .finally(() => setCargando(false));
    }, []);

    const cambios = useMemo(() => {
        const lista = [];
        if (perfil.nombre !== guardado.perfil.nombre) lista.push('en el nombre comercial');
        if (perfil.ubicacion !== guardado.perfil.ubicacion) lista.push('en la ubicación');
        if (perfil.descripcion !== guardado.perfil.descripcion) lista.push('en la descripción');
        if (perfil.telefono !== guardado.perfil.telefono) lista.push('en el teléfono');
        if (archivoLogo) lista.push('en el logotipo');
        const mismasFotos =
            fotos.length === guardado.fotos.length && fotos.every((f, i) => f.id === guardado.fotos[i].id);
        if (!mismasFotos) lista.push('en la galería');
        return lista;
    }, [perfil, archivoLogo, fotos, guardado]);

    const hayCambios = cambios.length > 0;

    const editar = (campo) => (ev) => {
        setPerfil((prev) => ({ ...prev, [campo]: ev.target.value }));
        setErrores((prev) => ({ ...prev, [campo]: undefined }));
        setAviso('');
    };

    const imagenValida = (archivo) => {
        if (!TIPOS_IMAGEN.includes(archivo.type) || archivo.size > MAX_IMAGEN) {
            setAviso('Las imágenes deben ser PNG, JPG o WEBP y pesar menos de 3 MB.');
            return false;
        }
        return true;
    };

    const elegirLogo = (ev) => {
        const archivo = ev.target.files?.[0];
        ev.target.value = '';
        if (!archivo || !imagenValida(archivo)) return;

        setArchivoLogo(archivo);
        setLogo(URL.createObjectURL(archivo));
        setAviso('');
    };

    const agregarFotos = (ev) => {
        const archivos = Array.from(ev.target.files || []).filter(imagenValida);
        ev.target.value = '';
        const libres = MAX_FOTOS - fotos.length;
        const nuevas = archivos.slice(0, libres).map((archivo) => ({
            id: siguienteId.current--,
            src: URL.createObjectURL(archivo),
            archivo,
        }));
        if (nuevas.length) {
            setFotos((prev) => [...prev, ...nuevas]);
            setAviso('');
        }
    };

    const quitarFoto = (id) => {
        setFotos((prev) => prev.filter((f) => f.id !== id));
        setAviso('');
    };

    // Regresa a la vista previa del perfil (pide confirmar si hay cambios sin guardar)
    const volver = () => {
        if (hayCambios && !window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) return;
        navigate('/enterprises/PerfilVistaPrevia');
    };

    const cancelar = () => {
        setPerfil(guardado.perfil);
        setLogo(guardado.logo);
        setArchivoLogo(null);
        setFotos(guardado.fotos);
        setErrores({});
        setAviso('');
    };

    // Guarda los datos, borra las fotos quitadas, sube las nuevas y el logotipo; luego muestra la vista previa
    const guardar = async () => {
        const e = validar(perfil);
        setErrores(e);
        if (Object.keys(e).length) return;

        setGuardando(true);
        setAviso('');
        try {
            await guardarPerfilLocal({
                commercial_name: perfil.nombre,
                campus_location: perfil.ubicacion,
                description: perfil.descripcion,
                phone: perfil.telefono,
            });

            const idsActuales = new Set(fotos.map((f) => f.id));
            for (const foto of guardado.fotos) {
                if (!idsActuales.has(foto.id)) await quitarFotoLocal(foto.id);
            }
            for (const foto of fotos) {
                if (foto.archivo) await agregarFotoLocal(foto.archivo);
            }
            if (archivoLogo) await cambiarLogoLocal(archivoLogo);

            navigate('/enterprises/PerfilVistaPrevia');
        } catch (err) {
            setAviso(mensajeDeError(err, err.message || 'No se pudo guardar el perfil.'));
            setGuardando(false);
        }
    };

    return (
        <main className="app-content">
            <div className="perfil-container">
                <span className="text-muted-custom small">Local &gt; Perfil del local &gt; Editar</span>
                <div className="perfil-cabecera">
                    <h1 className="perfil-title">Editar perfil del local</h1>
                    <button type="button" className="btn-volver" onClick={volver}>
                        ← Volver al perfil
                    </button>
                </div>

                <section className="perfil-panel">
                    <div className="perfil-grid">
                        {/* ===== Columna de datos ===== */}
                        <div className="perfil-datos">
                            <div className="perfil-fila-2">
                                <div>
                                    <label className="perfil-label" htmlFor="pf-nombre">Nombre comercial</label>
                                    <input
                                        id="pf-nombre"
                                        type="text"
                                        className={`form-control perfil-input ${errores.nombre ? 'is-invalid' : ''}`}
                                        value={perfil.nombre}
                                        onChange={editar('nombre')}
                                    />
                                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                                </div>
                                <div>
                                    <label className="perfil-label" htmlFor="pf-ubicacion">Ubicación en el campus</label>
                                    <input
                                        id="pf-ubicacion"
                                        type="text"
                                        className={`form-control perfil-input ${errores.ubicacion ? 'is-invalid' : ''}`}
                                        value={perfil.ubicacion}
                                        onChange={editar('ubicacion')}
                                    />
                                    {errores.ubicacion && <div className="invalid-feedback">{errores.ubicacion}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="perfil-label" htmlFor="pf-desc">Descripción</label>
                                <textarea
                                    id="pf-desc"
                                    rows={4}
                                    maxLength={MAX_DESC}
                                    className="form-control perfil-input perfil-textarea"
                                    value={perfil.descripcion}
                                    onChange={editar('descripcion')}
                                />
                                <p className="perfil-contador">
                                    Máximo {MAX_DESC} caracteres. Van {perfil.descripcion.length}.
                                </p>
                            </div>

                            <div className="perfil-fila-2">
                                <div>
                                    <label className="perfil-label" htmlFor="pf-correo">Correo de contacto</label>
                                    <input
                                        id="pf-correo"
                                        type="email"
                                        className="form-control perfil-input"
                                        value={perfil.correo}
                                        readOnly
                                        title="Es el correo con el que inicias sesión"
                                    />
                                    {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                                </div>
                                <div>
                                    <label className="perfil-label" htmlFor="pf-tel">Teléfono</label>
                                    <input
                                        id="pf-tel"
                                        type="tel"
                                        className={`form-control perfil-input ${errores.telefono ? 'is-invalid' : ''}`}
                                        value={perfil.telefono}
                                        onChange={editar('telefono')}
                                    />
                                    {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                                </div>
                            </div>

                            <div>
                                <span className="perfil-label">Fotografías del local</span>
                                <div className="perfil-galeria">
                                    {fotos.map((f, i) => (
                                        <div key={f.id} className="foto-item">
                                            {f.src ? (
                                                <img src={f.src} alt={`Fotografía ${i + 1} del local`} />
                                            ) : (
                                                <span className="placeholder-rayado" aria-hidden="true" />
                                            )}
                                            <button
                                                type="button"
                                                className="foto-quitar"
                                                onClick={() => quitarFoto(f.id)}
                                                aria-label={`Quitar fotografía ${i + 1}`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {fotos.length < MAX_FOTOS && (
                                        <button
                                            type="button"
                                            className="foto-agregar"
                                            onClick={() => inputFotos.current?.click()}
                                            aria-label="Agregar fotografías"
                                        >
                                            +
                                        </button>
                                    )}
                                    <input
                                        ref={inputFotos}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        multiple
                                        hidden
                                        onChange={agregarFotos}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ===== Columna del logotipo ===== */}
                        <aside className="perfil-logo-col">
                            <span className="perfil-label">Logotipo</span>
                            <div className="logo-caja">
                                {logo ? (
                                    <img src={logo} alt="Logotipo del local" />
                                ) : (
                                    <>
                                        <span className="placeholder-rayado" aria-hidden="true" />
                                        <span className="logo-texto">logotipo 1:1</span>
                                    </>
                                )}
                            </div>
                            <button
                                type="button"
                                className="btn-logo"
                                onClick={() => inputLogo.current?.click()}
                            >
                                Cambiar logotipo
                            </button>
                            <input ref={inputLogo} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={elegirLogo} />

                            {hayCambios && (
                                <p className="perfil-sin-guardar" role="status">
                                    Tienes cambios sin guardar {unir(cambios)}.
                                </p>
                            )}
                        </aside>
                    </div>

                    <div className="perfil-acciones">
                        <button type="button" className="btn-cancelar" onClick={cancelar} disabled={!hayCambios || guardando}>
                            Cancelar
                        </button>
                        <button type="button" className="btn-guardar" onClick={guardar} disabled={!hayCambios || guardando || cargando}>
                            {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </section>

                {aviso && (
                    <p className="perfil-aviso" role="status">
                        <span aria-hidden="true">✓</span> {aviso}
                    </p>
                )}
            </div>
        </main>
    );
}