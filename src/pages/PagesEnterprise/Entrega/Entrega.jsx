import { useState } from 'react';
import {
    buscarPedidoPorCodigo,
    cambiarEstadoPedido,
    fechaCorta,
} from '../../../api/pedidos';
import { mensajeDeError } from '../../../api/carta';
import './Entrega.css';

const ESTADOS = {
    recibido:    { label: 'Recibido',       clase: 'est-recibido' },
    preparacion: { label: 'En preparación', clase: 'est-preparacion' },
    listo:       { label: 'Listo',          clase: 'est-listo' },
    entregado:   { label: 'Entregado',      clase: 'est-entregado' },
    rechazado:   { label: 'Rechazado',      clase: 'est-entregado' },
};

const soles = (n) => `S/ ${n.toFixed(2)}`;

const MENSAJES = {
    recibido:    'Este pedido aún no se está preparando.',
    preparacion: 'Este pedido sigue en preparación. Aún no se puede entregar.',
    entregado:   'Este pedido ya fue entregado.',
    rechazado:   'Este pedido fue rechazado.',
};

export default function Entrega() {
    const [codigo, setCodigo] = useState('');
    const [pedido, setPedido] = useState(null); // pedido encontrado (respuesta de la API)
    const [error, setError] = useState('');
    const [confirmado, setConfirmado] = useState('');
    const [ocupado, setOcupado] = useState(false);

    const buscar = async (e) => {
        e.preventDefault();
        setConfirmado('');
        const texto = codigo.trim().toUpperCase();
        if (!texto) {
            setError('Escribe el código del pedido.');
            setPedido(null);
            return;
        }

        setOcupado(true);
        try {
            // Acepta "PED-0012" completo o solo los dígitos "12"
            setPedido(await buscarPedidoPorCodigo(texto));
            setError('');
        } catch (err) {
            setPedido(null);
            setError(mensajeDeError(err, `No hay ningún pedido con el código ${texto}.`));
        } finally {
            setOcupado(false);
        }
    };

    const entregar = async () => {
        setOcupado(true);
        try {
            const entregado = await cambiarEstadoPedido(pedido.id, 'entregado');
            setConfirmado(`${entregado.code} entregado a ${entregado.diner.name}.`);
            setCodigo('');
            setPedido(null);
            setError('');
        } catch (err) {
            setError(mensajeDeError(err, 'No se pudo marcar el pedido como entregado.'));
        } finally {
            setOcupado(false);
        }
    };

    return (
        <main className="app-content">
            <div className="entrega-container">

                <span className="text-muted-custom small">Atención &gt; Entrega contra código</span>
                <h1 className="entrega-title">Entrega contra código</h1>
                <p className="text-muted-custom small entrega-sub">
                    Pide al comensal su código de pedido y confirma la entrega.
                </p>

                <form className="entrega-form" onSubmit={buscar}>
                    <label htmlFor="codigo" className="entrega-label">CÓDIGO DE PEDIDO</label>
                    <div className="entrega-busqueda">
                        <input
                            id="codigo"
                            className={`entrega-input ${error ? 'con-error' : ''} ${pedido ? 'con-resultado' : ''}`}
                            type="text"
                            placeholder="PED-0001"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            autoComplete="off"
                            autoFocus
                        />
                        <button type="submit" className="btn btn-danger-custom entrega-buscar" disabled={ocupado}>Buscar</button>
                    </div>
                    {error && <p className="entrega-error" role="alert">{error}</p>}
                </form>

                {confirmado && <p className="entrega-ok" role="status">{confirmado}</p>}

                {pedido && (
                    <section className={`entrega-card ${ESTADOS[pedido.status].clase}`}>
                        <header className="entrega-card-head">
                            <h2>{pedido.code} · {pedido.diner.name}</h2>
                            <span className="entrega-pill">{ESTADOS[pedido.status].label}</span>
                        </header>

                        <ul className="entrega-items">
                            {pedido.items.map((i) => (
                                <li key={i.id}>
                                    <span>
                                        {i.quantity} × {i.name}
                                        {i.options && i.options.length > 0 && ` · ${i.options.map((o) => o.name).join(', ')}`}
                                        {i.notes && ` · ${i.notes}`}
                                    </span>
                                    <strong>{soles(i.subtotal)}</strong>
                                </li>
                            ))}
                        </ul>

                        <div className="entrega-total">
                            <span>Cobrar en el mostrador · recojo {pedido.pickup_time} del {fechaCorta(pedido.pickup_date)}</span>
                            <strong>{soles(pedido.total)}</strong>
                        </div>

                        {pedido.status === 'listo' ? (
                            <button className="btn btn-success-custom entrega-confirmar" disabled={ocupado} onClick={entregar}>
                                Marcar como entregado
                            </button>
                        ) : (
                            <p className="entrega-aviso">{MENSAJES[pedido.status]}</p>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
