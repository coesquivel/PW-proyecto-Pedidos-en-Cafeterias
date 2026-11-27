import { useEffect, useMemo, useState } from 'react';
import './Agotados.css';
import { obtenerProductos, actualizarProducto, mensajeDeError } from '../../../api/carta';
import { obtenerMiLocal, cambiarEstadoLocal } from '../../../api/locales';
import { obtenerPedidosLocal, ESTADOS_EN_CURSO } from '../../../api/pedidos';

const ESTADOS_LOCAL = [
    { id: 'abierto',    titulo: 'Abierto',              desc: 'Recibiendo pedidos con normalidad.' },
    { id: 'suspendido', titulo: 'Recepción suspendida', desc: 'Sigues visible en el directorio, pero no aceptas nuevos pedidos.' },
    { id: 'cerrado',    titulo: 'Cerrado',              desc: 'Apareces como cerrado hasta que vuelvas a abrir.' },
];

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

export default function Agotados() {
    const [estadoLocal, setEstadoLocal] = useState('abierto');
    const [productos, setProductos] = useState([]);
    const [pedidosEnCurso, setPedidosEnCurso] = useState(0);
    const [aviso, setAviso] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        Promise.all([obtenerMiLocal(), obtenerProductos(), obtenerPedidosLocal()])
            .then(([local, lista, pedidos]) => {
                setEstadoLocal(local.reception_status);
                setProductos(lista);
                setPedidosEnCurso(pedidos.filter((p) => ESTADOS_EN_CURSO.includes(p.status)).length);
            })
            .catch((e) => setError(mensajeDeError(e, 'No se pudo cargar la información del local.')))
            .finally(() => setCargando(false));

        // Si el estado se cambia desde el encabezado, esta pantalla se actualiza
        const alCambiar = (e) => setEstadoLocal(e.detail);
        window.addEventListener('estado-local', alCambiar);
        return () => window.removeEventListener('estado-local', alCambiar);
    }, []);

    const totalAgotados = useMemo(() => productos.filter((p) => !p.available).length, [productos]);

    const cambiarEstado = async (id) => {
        const anterior = estadoLocal;
        setEstadoLocal(id);
        setError('');
        try {
            await cambiarEstadoLocal(id);
            const e = ESTADOS_LOCAL.find((x) => x.id === id);
            setAviso(`Estado del local: ${e.titulo}. Se aplicó de inmediato.`);
        } catch (err) {
            setEstadoLocal(anterior);
            setError(mensajeDeError(err, 'No se pudo cambiar el estado del local.'));
        }
    };

    // Marca o desmarca un producto como agotado (campo available de la base)
    const ponerDisponible = async (producto, available) => {
        await actualizarProducto(producto.id, { available });
        setProductos((prev) => prev.map((x) => (x.id === producto.id ? { ...x, available } : x)));
    };

    const alternar = async (id) => {
        const p = productos.find((x) => x.id === id);
        const agotar = p.available;
        setError('');
        try {
            await ponerDisponible(p, !agotar);
            setAviso(
                agotar
                    ? `«${p.name}» quedó marcada como agotada. Se muestra atenuada en la carta del comensal.`
                    : `«${p.name}» vuelve a estar disponible en la carta del comensal.`
            );
        } catch (err) {
            setError(mensajeDeError(err, 'No se pudo actualizar el producto.'));
        }
    };

    const restablecer = async () => {
        if (totalAgotados === 0) return;
        setError('');
        try {
            for (const p of productos.filter((x) => !x.available)) await ponerDisponible(p, true);
            setAviso('Se restablecieron todos los productos. Todos están disponibles.');
        } catch (err) {
            setError(mensajeDeError(err, 'No se pudieron restablecer todos los productos.'));
        }
    };

    return (
        <main className="app-content">
            <div className="agotados-container">

                <span className="text-muted-custom small">Carta &gt; Agotados del día</span>
                <h1 className="agotados-title">Disponibilidad y estado del local</h1>

                <div className="agotados-layout">

                    {/* ===== Estado del local ===== */}
                    <section className="panel estado-panel">
                        <h2 className="panel-title">Estado del local</h2>
                        <p className="panel-sub">Se aplica de inmediato a lo que ve el comensal.</p>

                        <div className="estado-opciones" role="radiogroup" aria-label="Estado del local">
                            {ESTADOS_LOCAL.map((e) => (
                                <label
                                    key={e.id}
                                    className={`estado-op op-${e.id} ${estadoLocal === e.id ? 'activo' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="estado-local"
                                        checked={estadoLocal === e.id}
                                        onChange={() => cambiarEstado(e.id)}
                                    />
                                    <span className="estado-aro" aria-hidden="true" />
                                    <span className="estado-texto">
                                        <strong>{e.titulo}</strong>
                                        <small>{e.desc}</small>
                                    </span>
                                </label>
                            ))}
                        </div>

                        <p className="estado-nota">
                            Tienes {pedidosEnCurso} {pedidosEnCurso === 1 ? 'pedido' : 'pedidos'} en curso. Suspender la recepción no cancela los
                            pedidos ya aceptados.
                        </p>
                    </section>

                    {/* ===== Agotados ===== */}
                    <section className="agotados-col">
                        <div className="panel agotados-panel">
                            <header className="agotados-head">
                                <div>
                                    <h2 className="panel-title">Agotados del día</h2>
                                    <p className="panel-sub">
                                        {cargando ? 'Cargando…' : `${totalAgotados} de ${productos.length} productos marcados como agotados`}
                                    </p>
                                </div>
                                <button
                                    className="btn-restablecer"
                                    onClick={restablecer}
                                    disabled={totalAgotados === 0}
                                >
                                    Restablecer todos
                                </button>
                            </header>

                            <div className="agotados-tabla-wrap">
                                <table className="agotados-tabla">
                                    <thead>
                                        <tr>
                                            <th>PRODUCTO</th>
                                            <th className="col-cat">CATEGORÍA</th>
                                            <th>PRECIO</th>
                                            <th>AGOTADO HOY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map((p) => (
                                            <tr key={p.id} className={!p.available ? 'fila-agotada' : ''}>
                                                <td>{p.name}</td>
                                                <td className="col-cat muted">{p.category?.name || 'Sin categoría'}</td>
                                                <td className="precio">{soles(p.price)}</td>
                                                <td>
                                                    <label className="toggle">
                                                        <input
                                                            type="checkbox"
                                                            className="switch"
                                                            checked={!p.available}
                                                            onChange={() => alternar(p.id)}
                                                            aria-label={`Marcar ${p.name} como agotado`}
                                                        />
                                                        <span className={!p.available ? 'toggle-si' : 'toggle-no'}>
                                                            {!p.available ? 'Sí' : 'No'}
                                                        </span>
                                                    </label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {error && <p className="agotados-aviso text-danger" role="alert">{error}</p>}

                        {aviso && (
                            <p className="agotados-aviso" role="status">
                                <span aria-hidden="true">✓</span> {aviso}
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
