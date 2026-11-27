import { useEffect, useMemo, useState } from 'react';
import './ResumenDia.css';
import { obtenerPedidosDelDia, ahoraEnLima, fechaCorta } from '../../../api/pedidos';
import { obtenerMiLocal } from '../../../api/locales';
import { mensajeDeError } from '../../../api/carta';

const POR_PAGINA = 7;

const ESTADOS = {
    recibido:    { label: 'Recibido',       clase: 'estado-preparacion' },
    preparacion: { label: 'En preparación', clase: 'estado-preparacion' },
    listo:       { label: 'Listo',          clase: 'estado-listo' },
    entregado:   { label: 'Entregado',      clase: 'estado-entregado' },
    rechazado:   { label: 'Rechazado',      clase: 'estado-rechazado' },
};

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

export default function ResumenDia() {
    const [fecha, setFecha] = useState(ahoraEnLima().fecha);
    const [filtro, setFiltro] = useState('todos');
    const [pagina, setPagina] = useState(1);
    const [pedidos, setPedidos] = useState([]);
    const [nombreLocal, setNombreLocal] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        obtenerMiLocal().then((l) => setNombreLocal(l.commercial_name)).catch(() => {});
    }, []);

    // Cada vez que cambia la fecha se vuelven a pedir los pedidos de esa jornada
    useEffect(() => {
        if (!fecha) return;
        setCargando(true);
        setError('');
        obtenerPedidosDelDia(fecha)
            .then((dia) => setPedidos(dia.orders))
            .catch((e) => { setPedidos([]); setError(mensajeDeError(e, 'No se pudieron cargar los pedidos.')); })
            .finally(() => setCargando(false));
    }, [fecha]);

    const resumen = useMemo(() => {
        const entregados = pedidos.filter((p) => p.status === 'entregado');
        const rechazados = pedidos.filter((p) => p.status === 'rechazado');
        const total = entregados.reduce((s, p) => s + Number(p.total), 0);

        // Franja más activa: la hora de recojo con más pedidos no rechazados
        const porHora = {};
        pedidos.filter((p) => p.status !== 'rechazado').forEach((p) => {
            const hora = p.pickup_time.slice(0, 2);
            porHora[hora] = (porHora[hora] || 0) + 1;
        });
        const mejor = Object.entries(porHora).sort((a, b) => b[1] - a[1])[0];

        return {
            atendidos: entregados.length,
            cancelados: rechazados.length,
            recibidos: pedidos.length,
            total,
            ticket: entregados.length ? total / entregados.length : 0,
            franja: mejor ? `${mejor[0]}:00` : null,
        };
    }, [pedidos]);

    const filtrados = useMemo(
        () => (filtro === 'todos' ? pedidos : pedidos.filter((p) => p.status === filtro)),
        [filtro, pedidos]
    );

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);

    const irA = (n) => setPagina(Math.min(Math.max(1, n), totalPaginas));
    const cambiarFiltro = (e) => { setFiltro(e.target.value); setPagina(1); };

    const fechaTexto = fecha ? fechaCorta(fecha) : '';

    return (
        <main className="app-content">
            <div className="page-container resumen-container">

                <div className="resumen-topbar">
                    <div>
                        <span className="text-muted-custom small">Atención &gt; Resumen del día</span>
                        <h1 className="resumen-title">Resumen del día</h1>
                        <p className="text-muted-custom small">{nombreLocal} • {fechaTexto}</p>
                    </div>
                    <div className="resumen-filtros">
                        <label className="filtro">
                            <span>Fecha:</span>
                            <input type="date" value={fecha} onChange={(e) => { setFecha(e.target.value); setPagina(1); }} />
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
                        <span className="stat-label">PEDIDOS ENTREGADOS</span>
                        <strong className="stat-value">{resumen.atendidos}</strong>
                        <span className="stat-note">de {resumen.recibidos} recibidos</span>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">CANCELADOS O RECHAZADOS</span>
                        <strong className="stat-value stat-red">{resumen.cancelados}</strong>
                        <span className="stat-note">rechazados por el local</span>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">TOTAL VENDIDO</span>
                        <strong className="stat-value stat-green">{soles(resumen.total)}</strong>
                        <span className="stat-note">de los pedidos entregados</span>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">TICKET PROMEDIO</span>
                        <strong className="stat-value">{soles(resumen.ticket)}</strong>
                        <span className="stat-note">franja más activa: {resumen.franja || '—'}</span>
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
                            {error && (
                                <tr><td colSpan="5" className="tabla-vacia">{error}</td></tr>
                            )}
                            {!error && cargando && (
                                <tr><td colSpan="5" className="tabla-vacia">Cargando…</td></tr>
                            )}
                            {!error && !cargando && visibles.length === 0 && (
                                <tr><td colSpan="5" className="tabla-vacia">No hay pedidos con este filtro</td></tr>
                            )}
                            {visibles.map((p) => (
                                <tr key={p.id}>
                                    <td data-label="Código" className="cod">{p.code}</td>
                                    <td data-label="Comensal">{p.diner.name}</td>
                                    <td data-label="Recojo" className="muted">{p.pickup_time}</td>
                                    <td data-label="Total" className="num cod">{soles(p.total)}</td>
                                    <td data-label="Estado">
                                        <span className={`pill ${ESTADOS[p.status].clase}`}>
                                            {ESTADOS[p.status].label}
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
