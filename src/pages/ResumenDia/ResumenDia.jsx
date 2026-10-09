import { useMemo, useState } from 'react';
import './ResumenDia.css';

const FECHA_HOY = '2026-09-15';
const POR_PAGINA = 7;

const ESTADOS = {
    entregado:   { label: 'Entregado',      clase: 'estado-entregado' },
    preparacion: { label: 'En preparación', clase: 'estado-preparacion' },
    listo:       { label: 'Listo',          clase: 'estado-listo' },
    rechazado:   { label: 'Rechazado',      clase: 'estado-rechazado' },
    norecogido:  { label: 'No recogido',    clase: 'estado-norecogido' },
};

// Datos de ejemplo (luego los reemplazas por tu API)
const PEDIDOS = [
    { id: 'PED-4805', cliente: 'Renzo Vílchez Paredes',  recojo: '10:30', total: 12.5, estado: 'entregado' },
    { id: 'PED-4808', cliente: 'Paula Zegarra Ruiz',     recojo: '10:30', total: 4.5,  estado: 'entregado' },
    { id: 'PED-4812', cliente: 'Sofía Cárdenas Loayza',  recojo: '11:00', total: 21.0, estado: 'entregado' },
    { id: 'PED-4821', cliente: 'Mateo Rojas Ibáñez',     recojo: '11:30', total: 36.0, estado: 'preparacion' },
    { id: 'PED-4835', cliente: 'Andrea Núñez Lozano',    recojo: '16:00', total: 7.5,  estado: 'listo' },
    { id: 'PED-4845', cliente: 'Diego Salazar Trigoso',  recojo: '12:00', total: 18.0, estado: 'rechazado' },
    { id: 'PED-4790', cliente: 'Lucía Farfán Delgado',   recojo: '10:30', total: 12.0, estado: 'norecogido' },
    { id: 'PED-4850', cliente: 'Carlos Medina Quispe',   recojo: '12:30', total: 9.0,  estado: 'entregado' },
    { id: 'PED-4852', cliente: 'Valeria Soto Prado',     recojo: '12:30', total: 15.5, estado: 'entregado' },
    { id: 'PED-4855', cliente: 'Jorge Ramos Cueva',      recojo: '13:00', total: 22.0, estado: 'entregado' },
    { id: 'PED-4858', cliente: 'Camila Torres Vega',     recojo: '13:00', total: 6.0,  estado: 'rechazado' },
    { id: 'PED-4860', cliente: 'Luis Herrera Campos',    recojo: '13:15', total: 11.0, estado: 'entregado' },
    { id: 'PED-4862', cliente: 'Ana Palacios Rivas',     recojo: '13:30', total: 14.5, estado: 'listo' },
    { id: 'PED-4865', cliente: 'Pedro Gil Montalvo',     recojo: '14:00', total: 8.0,  estado: 'norecogido' },
];

const soles = (n) => `S/ ${n.toFixed(2)}`;

export default function ResumenDia() {
    const [fecha, setFecha] = useState(FECHA_HOY);
    const [filtro, setFiltro] = useState('todos');
    const [pagina, setPagina] = useState(1);

    const resumen = useMemo(() => {
        const atendidos  = PEDIDOS.filter((p) => ['entregado', 'listo', 'preparacion'].includes(p.estado));
        const cancelados = PEDIDOS.filter((p) => ['rechazado', 'norecogido'].includes(p.estado));
        const cobrados   = PEDIDOS.filter((p) => p.estado === 'entregado');
        const total      = cobrados.reduce((s, p) => s + p.total, 0);
        return {
            atendidos: atendidos.length,
            cancelados: cancelados.length,
            recibidos: PEDIDOS.length,
            total,
            ticket: cobrados.length ? total / cobrados.length : 0,
        };
    }, []);

    const filtrados = useMemo(
        () => (filtro === 'todos' ? PEDIDOS : PEDIDOS.filter((p) => p.estado === filtro)),
        [filtro]
    );

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);

    const irA = (n) => setPagina(Math.min(Math.max(1, n), totalPaginas));
    const cambiarFiltro = (e) => { setFiltro(e.target.value); setPagina(1); };

    const fechaTexto = fecha.split('-').reverse().join('/');

    return (
        <main className="app-content">
            <div className="page-container resumen-container">

                <div className="resumen-topbar">
                    <div>
                        <span className="text-muted-custom small">Atención &gt; Resumen del día</span>
                        <h1 className="resumen-title">Resumen del día</h1>
                        <p className="text-muted-custom small">Cafetería Central • {fechaTexto}</p>
                    </div>
                    <div className="resumen-filtros">
                        <label className="filtro">
                            <span>Fecha:</span>
                            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                        </label>
                        <label className="filtro">
                            <span>Estado:</span>
                            <select value={filtro} onChange={cambiarFiltro}>
                                <option value="todos">Todos</option>
                                {Object.entries(ESTADOS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <section className="resumen-stats">
                    <article className="stat-card">
                        <span className="stat-label">PEDIDOS ATENDIDOS</span>
                        <strong className="stat-value">{resumen.atendidos}</strong>
                        <span className="stat-note">de {resumen.recibidos} recibidos</span>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">CANCELADOS O RECHAZADOS</span>
                        <strong className="stat-value stat-red">{resumen.cancelados}</strong>
                        <span className="stat-note">por agotado o por el comensal</span>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">TOTAL VENDIDO</span>
                        <strong className="stat-value stat-green">{soles(resumen.total)}</strong>
                        <span className="stat-note">cobrado en el mostrador</span>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">TICKET PROMEDIO</span>
                        <strong className="stat-value">{soles(resumen.ticket)}</strong>
                        <span className="stat-note">franja más activa: 13:00</span>
                    </article>
                </section>

                <div className="tabla-wrap">
                    <table className="tabla-pedidos">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>COMENSAL</th>
                                <th>RECOJO</th>
                                <th className="num">TOTAL</th>
                                <th>ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.length === 0 && (
                                <tr><td colSpan="5" className="tabla-vacia">No hay pedidos con este filtro</td></tr>
                            )}
                            {visibles.map((p) => (
                                <tr key={p.id}>
                                    <td data-label="Código" className="cod">{p.id}</td>
                                    <td data-label="Comensal">{p.cliente}</td>
                                    <td data-label="Recojo" className="muted">{p.recojo}</td>
                                    <td data-label="Total" className="num cod">{soles(p.total)}</td>
                                    <td data-label="Estado">
                                        <span className={`pill ${ESTADOS[p.estado].clase}`}>
                                            {ESTADOS[p.estado].label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="paginacion">
                    <span className="paginacion-info">
                        {filtrados.length === 0
                            ? 'Sin resultados'
                            : `Mostrando ${inicio + 1} a ${inicio + visibles.length} de ${filtrados.length} pedidos de la jornada`}
                    </span>
                    <nav className="paginacion-botones" aria-label="Paginación">
                        <button onClick={() => irA(paginaActual - 1)} disabled={paginaActual === 1}>‹</button>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                className={n === paginaActual ? 'activo' : ''}
                                onClick={() => irA(n)}
                            >
                                {n}
                            </button>
                        ))}
                        <button onClick={() => irA(paginaActual + 1)} disabled={paginaActual === totalPaginas}>›</button>
                    </nav>
                </div>
            </div>
        </main>
    );
}
