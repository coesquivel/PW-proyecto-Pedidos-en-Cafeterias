import { useState } from 'react';
import './Bandeja.css';

const AHORA = '11:24'; // hora de referencia (luego puedes usar la real)

const aMinutos = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const horaActualReal = () =>
    new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });

const COLUMNAS = [
    { estado: 'recibido',    titulo: 'RECIBIDOS' },
    { estado: 'preparacion', titulo: 'EN PREPARACIÓN' },
    { estado: 'listo',       titulo: 'LISTOS' },
    { estado: 'entregado',   titulo: 'ENTREGADOS' },
];

const PEDIDOS_INICIALES = [
    { id: 'PED-4842', items: 3, total: 36.0, cliente: 'Mateo Rojas',   hora: '11:30', estado: 'recibido' },
    { id: 'PED-4843', items: 1, total: 3.5,  cliente: 'Lucía Farfán',  hora: '11:30', estado: 'recibido' },
    { id: 'PED-4821', items: 3, total: 21.0, cliente: 'Mateo Rojas',   hora: '11:30', estado: 'preparacion', notas: 1 },
    { id: 'PED-4835', items: 1, total: 7.5,  cliente: 'Andrea Núñez',  hora: '11:00', estado: 'listo' },
    { id: 'PED-4805', items: 2, total: 12.5, cliente: 'Renzo Vílchez', hora: '10:30', estado: 'entregado', entregadoA: '10:34' },
];

export default function Bandeja() {
    const [pedidos, setPedidos] = useState(PEDIDOS_INICIALES);

    const cambiarEstado = (id, nuevoEstado, extra = {}) =>
        setPedidos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado, ...extra } : p))
        );

    const preparar   = (id) => cambiarEstado(id, 'preparacion');
    const marcarListo = (id) => cambiarEstado(id, 'listo');
    const entregar   = (id) => cambiarEstado(id, 'entregado', { entregadoA: horaActualReal() });
    const rechazar   = (id) => {
        if (window.confirm(`¿Rechazar el pedido ${id}?`)) {
            setPedidos((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const enCola = pedidos.filter((p) => p.estado !== 'entregado').length;

    const renderAcciones = (p) => {
        switch (p.estado) {
            case 'recibido':
                return (
                    <div className="pedido-actions">
                        <button className="btn btn-danger-custom w-100" onClick={() => preparar(p.id)}>Preparar</button>
                        <button className="btn btn-outline-danger w-50" onClick={() => rechazar(p.id)}>Rechazar</button>
                    </div>
                );
            case 'preparacion':
                return <button className="btn btn-success-custom w-100 mt-2" onClick={() => marcarListo(p.id)}>Marcar listo</button>;
            case 'listo':
                return <button className="btn btn-dark-custom w-100 mt-2" onClick={() => entregar(p.id)}>Entregar</button>;
            default:
                return null;
        }
    };

    const renderDetalle = (p) => {
        const precio = `S/ ${p.total.toFixed(2)}`;
        const items = `${p.items} ${p.items === 1 ? 'item' : 'items'}`;

        if (p.estado === 'preparacion') {
            return (
                <>
                    {items} • recojo {p.hora}<br />
                    {p.cliente}{p.notas ? ` • ${p.notas} nota${p.notas > 1 ? 's' : ''}` : ''}
                </>
            );
        }
        if (p.estado === 'entregado') {
            return <>{items} • {precio}<br />{p.cliente} • entregado {p.entregadoA}</>;
        }
        return <>{items} • {precio}<br />{p.cliente}</>;
    };

    const renderTiempo = (p) => {
        if (p.estado === 'preparacion') {
            const min = aMinutos(p.hora) - aMinutos(AHORA);
            return (
                <span className={`pedido-time fw-bold ${min <= 5 ? 'urgente' : ''}`}>
                    {min > 0 ? `en ${min} min` : 'ya toca'}
                </span>
            );
        }
        return <span className="pedido-time">{p.hora}</span>;
    };

    return (
        <main className="app-content">
            <div className="page-container bandeja-container">

                <div className="bandeja-topbar">
                    <div>
                        <span className="text-muted-custom small">Atención &gt; Bandeja del día</span>
                        <h1 className="mb-1">Bandeja del día</h1>
                        <p className="text-muted-custom small">
                            15/09/2026 - {pedidos.length} pedidos de la jornada - {enCola} en cola - hora actual {AHORA}
                        </p>
                    </div>
                    <div className="bandeja-actions">
                        <button className="btn btn-outline-custom">Agrupar por: estado ▼</button>
                        <button className="btn btn-danger-custom">Entregar contra código</button>
                    </div>
                </div>

                <div className="kanban-board">
                    {COLUMNAS.map(({ estado, titulo }) => {
                        const lista = pedidos.filter((p) => p.estado === estado);
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
                                                <h4 className="pedido-id">{p.id}</h4>
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