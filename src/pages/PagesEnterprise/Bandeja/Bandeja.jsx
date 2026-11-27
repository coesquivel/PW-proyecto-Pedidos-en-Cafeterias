import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    obtenerPedidosLocal,
    cambiarEstadoPedido,
    ahoraEnLima,
    sumarDias,
    fechaCorta,
    horaAMinutos,
} from '../../../api/pedidos';
import { mensajeDeError } from '../../../api/carta';
import './Bandeja.css';

const COLUMNAS = [
    { estado: 'recibido',    titulo: 'RECIBIDOS' },
    { estado: 'preparacion', titulo: 'EN PREPARACIÓN' },
    { estado: 'listo',       titulo: 'LISTOS' },
    { estado: 'entregado',   titulo: 'ENTREGADOS' },
];

// Cada cuánto se vuelve a pedir la lista para ver pedidos nuevos (ms)
const REFRESCO_MS = 15000;

const horaActual = (minutos) =>
    `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

export default function Bandeja() {
    // pedidos = los pedidos reales del local (API); se actualizan al cambiar de estado y cada 15 s
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [ocupado, setOcupado] = useState(false);
    const [ahora, setAhora] = useState(ahoraEnLima());

    useEffect(() => {
        let activo = true;

        const cargar = () =>
            obtenerPedidosLocal()
                .then((lista) => {
                    if (!activo) return;
                    setPedidos(lista);
                    setAhora(ahoraEnLima());
                    setError('');
                })
                .catch((e) => activo && setError(mensajeDeError(e, 'No se pudieron cargar los pedidos.')))
                .finally(() => activo && setCargando(false));

        cargar();
        const temporizador = setInterval(cargar, REFRESCO_MS);

        return () => {
            activo = false;
            clearInterval(temporizador);
        };
    }, []);

    // Cambia el estado en el servidor y reemplaza el pedido con la respuesta
    const cambiarEstado = async (id, nuevoEstado) => {
        setOcupado(true);
        setError('');
        try {
            const actualizado = await cambiarEstadoPedido(id, nuevoEstado);
            setPedidos((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
        } catch (e) {
            setError(mensajeDeError(e, 'No se pudo cambiar el estado del pedido.'));
        } finally {
            setOcupado(false);
        }
    };

    const preparar    = (p) => cambiarEstado(p.id, 'preparacion');
    const marcarListo = (p) => cambiarEstado(p.id, 'listo');
    const entregar    = (p) => cambiarEstado(p.id, 'entregado');

    // primero se muestra la pregunta; si confirma, el pedido pasa a "rechazado" y sale del tablero
    const rechazar = (p) => {
        if (window.confirm(`¿Rechazar el pedido ${p.code}?`)) {
            cambiarEstado(p.id, 'rechazado');
        }
    };

    // El tablero muestra los 4 estados; los rechazados no aparecen
    const visibles = pedidos.filter((p) => p.status !== 'rechazado');
    const enCola = visibles.filter((p) => p.status !== 'entregado').length;
    const fechaManana = sumarDias(ahora.fecha, 1);

    const renderAcciones = (p) => {
        switch (p.status) {
            case 'recibido':
                return (
                    <div className="pedido-actions">
                        <button className="btn btn-danger-custom w-100" disabled={ocupado} onClick={() => preparar(p)}>Preparar</button>
                        <button className="btn btn-outline-danger w-50" disabled={ocupado} onClick={() => rechazar(p)}>Rechazar</button>
                    </div>
                );
            case 'preparacion':
                return <button className="btn btn-success-custom w-100 mt-2" disabled={ocupado} onClick={() => marcarListo(p)}>Marcar listo</button>;
            case 'listo':
                return <button className="btn btn-dark-custom w-100 mt-2" disabled={ocupado} onClick={() => entregar(p)}>Entregar</button>;
            default:
                return null;
        }
    };

    // "mañana" / dd/mm cuando el pedido no es para hoy
    const etiquetaDia = (p) => {
        if (p.pickup_date === ahora.fecha) return '';
        return p.pickup_date === fechaManana ? ' (mañana)' : ` (${fechaCorta(p.pickup_date)})`;
    };

    const notasDe = (p) => p.items.filter((i) => i.notes).length;

    const renderDetalle = (p) => {
        const precio = `S/ ${p.total.toFixed(2)}`;
        const items = `${p.items_count} ${p.items_count === 1 ? 'item' : 'items'}`;
        const notas = notasDe(p);

        if (p.status === 'preparacion') {
            return (
                <>
                    {items} • recojo {p.pickup_time}{etiquetaDia(p)}<br />
                    {p.diner.name}{notas ? ` • ${notas} nota${notas > 1 ? 's' : ''}` : ''}
                </>
            );
        }
        if (p.status === 'entregado') {
            return <>{items} • {precio}<br />{p.diner.name} • entregado</>;
        }
        return <>{items} • {precio}<br />{p.diner.name}{notas ? ` • ${notas} nota${notas > 1 ? 's' : ''}` : ''}</>;
    };

    const renderTiempo = (p) => {
        if (p.status === 'preparacion' && p.pickup_date === ahora.fecha) {
            const min = horaAMinutos(p.pickup_time) - ahora.minutos;
            return (
                <span className={`pedido-time fw-bold ${min <= 5 ? 'urgente' : ''}`}>
                    {min > 0 ? `en ${min} min` : 'ya toca'}
                </span>
            );
        }
        return <span className="pedido-time">{p.pickup_time}{etiquetaDia(p)}</span>;
    };

    return (
        <main className="app-content">
            <div className="page-container bandeja-container">

                <div className="bandeja-topbar">
                    <div>
                        <span className="text-muted-custom small">Atención &gt; Bandeja del día</span>
                        <h1 className="mb-1">Bandeja del día</h1>
                        <p className="text-muted-custom small">
                            {fechaCorta(ahora.fecha)} - {visibles.length} {visibles.length === 1 ? 'pedido' : 'pedidos'} en la bandeja - {enCola} en cola - hora actual {horaActual(ahora.minutos)}
                        </p>
                    </div>
                    <div className="bandeja-actions">
                        <button className="btn btn-outline-custom">Agrupar por: estado ▼</button>
                        <Link to="/enterprises/entrega" className="btn btn-danger-custom">Entregar contra código</Link>
                    </div>
                </div>

                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {cargando && <p className="text-muted-custom small">Cargando pedidos...</p>}

                <div className="kanban-board">
                    {COLUMNAS.map(({ estado, titulo }) => {
                        const lista = visibles.filter((p) => p.status === estado);
                        return (
                            <div key={estado} className={`kanban-column column-${estado}`}>
                                <div className={`column-header header-${estado}`}>
                                    <span>{titulo}</span>
                                    <span className="badge">{lista.length}</span>
                                </div>

                                {lista.length === 0 && <p className="empty-column">Sin pedidos</p>}

                                {lista.map((p) => (
                                    <div key={p.id} className={`pedido-card card-${estado}`}>
                                        <div className="pedido-info">
                                            <div>
                                                <h4 className="pedido-id">{p.code}</h4>
                                                <p className="pedido-details">{renderDetalle(p)}</p>
                                            </div>
                                            {renderTiempo(p)}
                                        </div>
                                        {renderAcciones(p)}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
