import { useEffect, useMemo, useState } from 'react';
import {
    obtenerHorario,
    guardarHorarioApi,
    horarioAFormulario,
    formularioAHorario,
} from '../../../api/horario';
import { mensajeDeError } from '../../../api/carta';
import './Horario.css';

const PASO = 30; // minutos entre franjas

const DIAS = [
    { id: 'lun', nombre: 'Lunes' },
    { id: 'mar', nombre: 'Martes' },
    { id: 'mie', nombre: 'Miércoles' },
    { id: 'jue', nombre: 'Jueves' },
    { id: 'vie', nombre: 'Viernes' },
    { id: 'sab', nombre: 'Sábado' },
    { id: 'dom', nombre: 'Domingo' },
];

// Opciones de hora cada 30 minutos: 00:00, 00:30 ... 23:30
const OPCIONES_HORA = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    return `${h}:${i % 2 ? '30' : '00'}`;
});

// Mientras llega el horario real de la API, todos los días se ven cerrados
const HORARIO_VACIO = {
    lun: { abierto: false, apertura: '', cierre: '' },
    mar: { abierto: false, apertura: '', cierre: '' },
    mie: { abierto: false, apertura: '', cierre: '' },
    jue: { abierto: false, apertura: '', cierre: '' },
    vie: { abierto: false, apertura: '', cierre: '' },
    sab: { abierto: false, apertura: '', cierre: '' },
    dom: { abierto: false, apertura: '', cierre: '' },
};

const aMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
};

const aHora = (min) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const generarFranjas = (apertura, cierre) => {
    if (!apertura || !cierre) return [];
    const franjas = [];
    for (let t = aMinutos(apertura); t + PASO <= aMinutos(cierre); t += PASO) {
        franjas.push(aHora(t));
    }
    return franjas;
};

const diaCambio = (a, b) =>
    a.abierto !== b.abierto || a.apertura !== b.apertura || a.cierre !== b.cierre;

const describirCambios = (nombreDia, actual, base) => {
    const dia = nombreDia.toLowerCase();
    const frases = [];
    let recortaCierre = false;

    if (actual.abierto !== base.abierto) {
        frases.push(actual.abierto ? `Abriste el ${dia}.` : `Cerraste el ${dia}.`);
        if (!actual.abierto) frases.push('Los pedidos ya aceptados para ese día se mantienen.');
    } else if (actual.abierto) {
        if (actual.apertura !== base.apertura) {
            frases.push(`Cambiaste la apertura del ${dia} de ${base.apertura} a ${actual.apertura}.`);
        }
        if (actual.cierre !== base.cierre) {
            frases.push(`Cambiaste el cierre del ${dia} de ${base.cierre} a ${actual.cierre}.`);
            recortaCierre = actual.cierre < base.cierre;
        }
        if (recortaCierre) frases.push('Los pedidos ya aceptados para franjas posteriores se mantienen.');
    }
    return frases.join(' ');
};

const validar = (horario) => {
    const e = {};
    DIAS.forEach((d) => {
        const h = horario[d.id];
        if (h.abierto && aMinutos(h.cierre) - aMinutos(h.apertura) < PASO) {
            e[d.id] = `${d.nombre}: el cierre debe ser al menos 30 minutos después de la apertura.`;
        }
    });
    return e;
};

function SelectHora({ etiqueta, valor, base, deshabilitado, invalido, onChange }) {
    const cambiado = !deshabilitado && valor !== base;
    return (
        <select
            aria-label={etiqueta}
            className={`form-select horario-select ${cambiado ? 'cambiado' : ''} ${invalido ? 'is-invalid' : ''}`}
            value={valor}
            disabled={deshabilitado}
            onChange={onChange}
        >
            <option value="" disabled hidden />
            {OPCIONES_HORA.map((h) => (
                <option key={h} value={h}>{h}</option>
            ))}
        </select>
    );
}

export default function Horario() {
    const [guardado, setGuardado] = useState(HORARIO_VACIO);
    const [horario, setHorario] = useState(HORARIO_VACIO);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errorApi, setErrorApi] = useState('');
    const [diaPrevia, setDiaPrevia] = useState('lun');
    const [errores, setErrores] = useState({});
    const [aviso, setAviso] = useState('');

    // Horario real del local (API)
    useEffect(() => {
        obtenerHorario()
            .then((dias) => {
                const formulario = horarioAFormulario(dias);
                setGuardado(formulario);
                setHorario(formulario);
            })
            .catch((e) => setErrorApi(mensajeDeError(e, 'No se pudo cargar el horario.')))
            .finally(() => setCargando(false));
    }, []);

    const hayCambios = DIAS.some((d) => diaCambio(horario[d.id], guardado[d.id]));

    const editar = (id, campo, valor) => {
        setHorario((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
        setDiaPrevia(id);
        setErrores({});
        setAviso('');
    };

    const alternar = (id) => {
        setHorario((prev) => {
            const d = prev[id];
            const abierto = !d.abierto;
            return {
                ...prev,
                [id]: {
                    abierto,
                    apertura: d.apertura || (abierto ? '07:00' : ''),
                    cierre: d.cierre || (abierto ? '19:00' : ''),
                },
            };
        });
        setDiaPrevia(id);
        setErrores({});
        setAviso('');
    };

    const descartar = () => {
        setHorario(guardado);
        setErrores({});
        setAviso('');
    };

    const guardar = async () => {
        const e = validar(horario);
        setErrores(e);
        if (Object.keys(e).length) return;

        setGuardando(true);
        setErrorApi('');
        try {
            const dias = await guardarHorarioApi(formularioAHorario(horario));
            const formulario = horarioAFormulario(dias);
            setGuardado(formulario);
            setHorario(formulario);
            setAviso('Horario guardado. Las franjas de recojo ya se actualizaron.');
        } catch (err) {
            setErrorApi(mensajeDeError(err, 'No se pudo guardar el horario.'));
        } finally {
            setGuardando(false);
        }
    };

    // ===== Vista previa del día seleccionado =====
    const dia = DIAS.find((d) => d.id === diaPrevia);
    const h = horario[diaPrevia];
    const franjas = useMemo(
        () => (h.abierto ? generarFranjas(h.apertura, h.cierre) : []),
        [h.abierto, h.apertura, h.cierre]
    );

    const celdas = useMemo(() => {
        if (franjas.length === 0) return [];
        const lista =
            franjas.length <= 11
                ? franjas.map((f) => ({ tipo: 'franja', texto: f }))
                : [
                      ...franjas.slice(0, 8).map((f) => ({ tipo: 'franja', texto: f })),
                      { tipo: 'puntos', texto: '...' },
                      ...franjas.slice(-2).map((f) => ({ tipo: 'franja', texto: f })),
                  ];
        lista.push({ tipo: 'cierre', texto: h.cierre });
        return lista;
    }, [franjas, h.cierre]);

    const notaPrevia = diaCambio(h, guardado[diaPrevia])
        ? describirCambios(dia.nombre, h, guardado[diaPrevia])
        : '';

    return (
        <main className="app-content">
            <div className="horario-container">
                <header className="horario-head">
                    <div>
                        <span className="text-muted-custom small">Local &gt; Horario de atención</span>
                        <h1 className="horario-title">Horario de atención</h1>
                        <p className="horario-sub">
                            Las franjas de recojo se generan cada {PASO} minutos dentro de tu horario.
                        </p>
                    </div>
                    <div className="horario-acciones">
                        <button type="button" className="btn-descartar" onClick={descartar} disabled={!hayCambios}>
                            Descartar
                        </button>
                        <button type="button" className="btn-guardar-horario" onClick={guardar} disabled={!hayCambios || guardando || cargando}>
                            {guardando ? 'Guardando...' : 'Guardar horario'}
                        </button>
                    </div>
                </header>

                {errorApi && <p className="horario-errores" role="alert">{errorApi}</p>}
                {cargando && <p className="horario-sub">Cargando horario...</p>}

                <div className="horario-layout">
                    {/* ===== Tabla de días ===== */}
                    <section className="horario-panel">
                        <div className="horario-tabla-wrap">
                            <table className="horario-tabla">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Apertura</th>
                                        <th>Cierre</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DIAS.map((d) => {
                                        const fila = horario[d.id];
                                        const base = guardado[d.id];
                                        return (
                                            <tr key={d.id} className={fila.abierto ? '' : 'fila-cerrada'}>
                                                <th scope="row">
                                                    <button
                                                        type="button"
                                                        className={`dia-btn ${d.id === diaPrevia ? 'activo' : ''}`}
                                                        onClick={() => setDiaPrevia(d.id)}
                                                        aria-pressed={d.id === diaPrevia}
                                                    >
                                                        {d.nombre}
                                                    </button>
                                                </th>
                                                <td>
                                                    <SelectHora
                                                        etiqueta={`Apertura del ${d.nombre.toLowerCase()}`}
                                                        valor={fila.apertura}
                                                        base={base.apertura}
                                                        deshabilitado={!fila.abierto}
                                                        invalido={Boolean(errores[d.id])}
                                                        onChange={(ev) => editar(d.id, 'apertura', ev.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <SelectHora
                                                        etiqueta={`Cierre del ${d.nombre.toLowerCase()}`}
                                                        valor={fila.cierre}
                                                        base={base.cierre}
                                                        deshabilitado={!fila.abierto}
                                                        invalido={Boolean(errores[d.id])}
                                                        onChange={(ev) => editar(d.id, 'cierre', ev.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="form-check form-switch horario-switch">
                                                        <input
                                                            id={`sw-${d.id}`}
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            checked={fila.abierto}
                                                            onChange={() => alternar(d.id)}
                                                        />
                                                        <label
                                                            htmlFor={`sw-${d.id}`}
                                                            className={`form-check-label ${fila.abierto ? 'abierto' : 'cerrado'}`}
                                                        >
                                                            {fila.abierto ? 'Abierto' : 'Cerrado'}
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {Object.values(errores).length > 0 && (
                            <ul className="horario-errores" role="alert">
                                {Object.values(errores).map((msg) => (
                                    <li key={msg}>{msg}</li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* ===== Vista previa ===== */}
                    <aside className="horario-previa">
                        <h2 className="previa-titulo">
                            Vista previa · franjas del {dia.nombre.toLowerCase()}
                        </h2>

                        {!h.abierto && (
                            <p className="previa-texto">
                                El {dia.nombre.toLowerCase()} está cerrado. No se generan franjas de recojo.
                            </p>
                        )}

                        {h.abierto && franjas.length === 0 && (
                            <p className="previa-texto">
                                Revisa el horario: el cierre debe ser al menos {PASO} minutos después de la apertura.
                            </p>
                        )}

                        {celdas.length > 0 && (
                            <>
                                <ul className="previa-grilla">
                                    {celdas.map((c, i) => (
                                        <li
                                            key={`${c.tipo}-${i}`}
                                            className={`franja ${c.tipo === 'puntos' ? 'franja-puntos' : ''} ${
                                                c.tipo === 'cierre' ? 'franja-cierre' : ''
                                            }`}
                                            title={c.tipo === 'cierre' ? 'Hora de cierre: ya no se toman pedidos' : undefined}
                                        >
                                            {c.texto}
                                        </li>
                                    ))}
                                </ul>
                                <p className="previa-texto">
                                    {franjas.length === 1
                                        ? `Se genera 1 franja de ${PASO} minutos a las ${franjas[0]}.`
                                        : `Se generan ${franjas.length} franjas de ${PASO} minutos entre ${franjas[0]} y ${
                                              franjas[franjas.length - 1]
                                          }.`}{' '}
                                    La última franja cierra {PASO} minutos antes del cierre.
                                </p>
                            </>
                        )}

                        {notaPrevia && <p className="previa-aviso" role="status">{notaPrevia}</p>}
                    </aside>
                </div>

                {aviso && (
                    <p className="horario-aviso" role="status">
                        <span aria-hidden="true">✓</span> {aviso}
                    </p>
                )}
            </div>
        </main>
    );
}