import { useState } from 'react';
import './Entrega.css';

const ESTADOS = {
    recibido:    { label: 'Recibido',       clase: 'est-recibido' },
    preparacion: { label: 'En preparación', clase: 'est-preparacion' },
    listo:       { label: 'Listo',          clase: 'est-listo' },
    entregado:   { label: 'Entregado',      clase: 'est-entregado' },
};

// Datos de ejemplo (luego los reemplazas por tu API)
const PEDIDOS_INICIALES = [
    {
        id: 'PED-4835', cliente: 'Andrea Núñez', recojo: '16:00', fecha: '15/09/2026', estado: 'listo',
        items: [
            { cant: 1, nombre: 'Café pasado', detalle: 'empaque para llevar', precio: 4.0 },
            { cant: 1, nombre: 'Alfajor de maicena', precio: 3.5 },
        ],
    },
    {
        id: 'PED-4821', cliente: 'Mateo Rojas', recojo: '11:30', fecha: '15/09/2026', estado: 'preparacion',
        items: [
            { cant: 2, nombre: 'Menú del día', precio: 12.0 },
            { cant: 1, nombre: 'Chicha morada', precio: 12.0 },
        ],
    },
    {
        id: 'PED-4842', cliente: 'Lucía Farfán', recojo: '11:30', fecha: '15/09/2026', estado: 'recibido',
        items: [{ cant: 1, nombre: 'Sándwich de pollo', precio: 3.5 }],
    },
    {
        id: 'PED-4805', cliente: 'Renzo Vílchez', recojo: '10:30', fecha: '15/09/2026', estado: 'entregado',
        items: [{ cant: 2, nombre: 'Empanada', precio: 6.25 }],
    },
];

const soles = (n) => `S/ ${n.toFixed(2)}`;
const totalDe = (p) => p.items.reduce((s, i) => s + i.precio, 0);

const MENSAJES = {
    recibido:    'Este pedido aún no se está preparando.',
    preparacion: 'Este pedido sigue en preparación. Aún no se puede entregar.',
    entregado:   'Este pedido ya fue entregado.',
};

export default function Entrega() {
    const [pedidos, setPedidos] = useState(PEDIDOS_INICIALES);
    const [codigo, setCodigo] = useState('');
    const [encontrado, setEncontrado] = useState(null); // id del pedido
    const [error, setError] = useState('');
    const [confirmado, setConfirmado] = useState('');

    const pedido = pedidos.find((p) => p.id === encontrado);

    const buscar = (e) => {
        e.preventDefault();
        setConfirmado('');
        const texto = codigo.trim().toUpperCase();
        if (!texto) {
            setError('Escribe el código del pedido.');
            setEncontrado(null);
            return;
        }
        // Acepta "PED-4835" completo o solo los 4 dígitos "4835"
        const digitos = texto.replace(/\D/g, '');
        const hallado = pedidos.find(
            (p) => p.id === texto || (digitos.length === 4 && p.id.endsWith(digitos))
        );
        if (hallado) {
            setEncontrado(hallado.id);
            setError('');
        } else {
            setEncontrado(null);
            setError(`No hay ningún pedido con el código ${texto}.`);
        }
    };

    const entregar = () => {
        setPedidos((prev) =>
            prev.map((p) => (p.id === pedido.id ? { ...p, estado: 'entregado' } : p))
        );
        setConfirmado(`${pedido.id} entregado a ${pedido.cliente}.`);
        setCodigo('');
        setEncontrado(null);
    };

    return (
        <main className="app-content">
            <div className="entrega-container">

                <span className="text-muted-custom small">Atención &gt; Entrega contra código</span>
                <h1 className="entrega-title">Entrega contra código</h1>
                <p className="text-muted-custom small entrega-sub">
                    Pide al comensal los cuatro dígitos de su código y confirma la entrega.
                </p>

                <form className="entrega-form" onSubmit={buscar}>
                    <label htmlFor="codigo" className="entrega-label">CÓDIGO DE PEDIDO</label>
                    <div className="entrega-busqueda">
                        <input
                            id="codigo"
                            className={`entrega-input ${error ? 'con-error' : ''} ${pedido ? 'con-resultado' : ''}`}
                            type="text"
                            placeholder="PED-4835"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            autoComplete="off"
                            autoFocus
                        />
                        <button type="submit" className="btn btn-danger-custom entrega-buscar">Buscar</button>
                    </div>
                    {error && <p className="entrega-error" role="alert">{error}</p>}
                </form>

                {confirmado && <p className="entrega-ok" role="status">{confirmado}</p>}

                {pedido && (
                    <section className={`entrega-card ${ESTADOS[pedido.estado].clase}`}>
                        <header className="entrega-card-head">
                            <h2>{pedido.id} · {pedido.cliente}</h2>
                            <span className="entrega-pill">{ESTADOS[pedido.estado].label}</span>
                        </header>

                        <ul className="entrega-items">
                            {pedido.items.map((i, idx) => (
                                <li key={idx}>
                                    <span>
                                        {i.cant} × {i.nombre}
                                        {i.detalle && ` · ${i.detalle}`}
                                    </span>
                                    <strong>{soles(i.precio)}</strong>
                                </li>
                            ))}
                        </ul>

                        <div className="entrega-total">
                            <span>Cobrar en el mostrador · recojo {pedido.recojo} del {pedido.fecha}</span>
                            <strong>{soles(totalDe(pedido))}</strong>
                        </div>

                        {pedido.estado === 'listo' ? (
                            <button className="btn btn-success-custom entrega-confirmar" onClick={entregar}>
                                Marcar como entregado
                            </button>
                        ) : (
                            <p className="entrega-aviso">{MENSAJES[pedido.estado]}</p>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
