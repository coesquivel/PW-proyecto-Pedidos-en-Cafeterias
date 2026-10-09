import { useMemo, useRef, useState } from 'react';
import './Perfil.css';

const MAX_DESC = 240;
const MAX_FOTOS = 6;

// Datos de ejemplo (luego los reemplazas por tu API)
const PERFIL_INICIAL = {
    nombre: 'Cafetería Central',
    ubicacion: 'Pabellón A, primer piso',
    descripcion:
        'Desayunos, menú del día y café pasado. Atendemos pedidos anticipados desde las 07:00 con recojo en el mostrador principal del pabellón A.',
    correo: 'cafeteriacentral@ulima.edu.pe',
    telefono: '945 112 330',
};
const LOGO_INICIAL = null; // url de la imagen o null
const FOTOS_INICIALES = [
    { id: 1, src: null },
    { id: 2, src: null },
];

const validar = (perfil) => {
    const e = {};
    if (!perfil.nombre.trim()) e.nombre = 'Ingresa el nombre comercial.';
    if (!perfil.ubicacion.trim()) e.ubicacion = 'Indica dónde está el local en el campus.';
    if (!/^\S+@\S+\.\S+$/.test(perfil.correo)) e.correo = 'Ingresa un correo válido.';
    if (perfil.telefono.replace(/\D/g, '').length !== 9) e.telefono = 'El teléfono debe tener 9 dígitos.';
    return e;
};

const unir = (items) =>
    items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

export default function Perfil() {
    const [guardado, setGuardado] = useState({ perfil: PERFIL_INICIAL, logo: LOGO_INICIAL, fotos: FOTOS_INICIALES });
    const [perfil, setPerfil] = useState(PERFIL_INICIAL);
    const [logo, setLogo] = useState(LOGO_INICIAL);
    const [fotos, setFotos] = useState(FOTOS_INICIALES);
    const [errores, setErrores] = useState({});
    const [aviso, setAviso] = useState('');

    const inputLogo = useRef(null);
    const inputFotos = useRef(null);
    const siguienteId = useRef(100);

    const cambios = useMemo(() => {
        const lista = [];
        if (perfil.nombre !== guardado.perfil.nombre) lista.push('en el nombre comercial');
        if (perfil.ubicacion !== guardado.perfil.ubicacion) lista.push('en la ubicación');
        if (perfil.descripcion !== guardado.perfil.descripcion) lista.push('en la descripción');
        if (perfil.correo !== guardado.perfil.correo) lista.push('en el correo');
        if (perfil.telefono !== guardado.perfil.telefono) lista.push('en el teléfono');
        if (logo !== guardado.logo) lista.push('en el logotipo');
        const mismasFotos =
            fotos.length === guardado.fotos.length && fotos.every((f, i) => f.id === guardado.fotos[i].id);
        if (!mismasFotos) lista.push('en la galería');
        return lista;
    }, [perfil, logo, fotos, guardado]);

    const hayCambios = cambios.length > 0;

    const editar = (campo) => (ev) => {
        setPerfil((prev) => ({ ...prev, [campo]: ev.target.value }));
        setErrores((prev) => ({ ...prev, [campo]: undefined }));
        setAviso('');
    };

    const elegirLogo = (ev) => {
        const archivo = ev.target.files?.[0];
        if (archivo) {
            setLogo(URL.createObjectURL(archivo));
            setAviso('');
        }
        ev.target.value = '';
    };

    const agregarFotos = (ev) => {
        const archivos = Array.from(ev.target.files || []);
        const libres = MAX_FOTOS - fotos.length;
        const nuevas = archivos.slice(0, libres).map((a) => ({
            id: siguienteId.current++,
            src: URL.createObjectURL(a),
        }));
        if (nuevas.length) {
            setFotos((prev) => [...prev, ...nuevas]);
            setAviso('');
        }
        ev.target.value = '';
    };

    const quitarFoto = (id) => {
        setFotos((prev) => prev.filter((f) => f.id !== id));
        setAviso('');
    };

    const cancelar = () => {
        setPerfil(guardado.perfil);
        setLogo(guardado.logo);
        setFotos(guardado.fotos);
        setErrores({});
        setAviso('');
    };

    const guardar = () => {
        const e = validar(perfil);
        setErrores(e);
        if (Object.keys(e).length) return;
        // Aquí va tu llamada a la API
        setGuardado({ perfil, logo, fotos });
        setAviso('Cambios guardados. El comensal ya ve el perfil actualizado.');
    };

    return (
        <main className="app-content">
            <div className="perfil-container">
                <span className="text-muted-custom small">Local &gt; Perfil del local &gt; Editar</span>
                <h1 className="perfil-title">Editar perfil del local</h1>

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
                                        className={`form-control perfil-input ${errores.correo ? 'is-invalid' : ''}`}
                                        value={perfil.correo}
                                        onChange={editar('correo')}
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
                                        accept="image/*"
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
                            <input ref={inputLogo} type="file" accept="image/*" hidden onChange={elegirLogo} />

                            {hayCambios && (
                                <p className="perfil-sin-guardar" role="status">
                                    Tienes cambios sin guardar {unir(cambios)}.
                                </p>
                            )}
                        </aside>
                    </div>

                    <div className="perfil-acciones">
                        <button type="button" className="btn-cancelar" onClick={cancelar} disabled={!hayCambios}>
                            Cancelar
                        </button>
                        <button type="button" className="btn-guardar" onClick={guardar} disabled={!hayCambios}>
                            Guardar cambios
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