import { useMemo, useState } from 'react';
import './Agotados.css';

const PEDIDOS_EN_CURSO = 4;

const ESTADOS_LOCAL = [
    { id: 'abierto',    titulo: 'Abierto',              desc: 'Recibiendo pedidos con normalidad.' },
    { id: 'suspendido', titulo: 'Recepción suspendida', desc: 'Sigues visible en el directorio, pero no aceptas nuevos pedidos.' },
    { id: 'cerrado',    titulo: 'Cerrado',              desc: 'Apareces como cerrado hasta tu próximo horario de atención.' },
];

// Datos de ejemplo (luego los reemplazas por tu API)
const PRODUCTOS_INICIALES = [
    { id: 1,  nombre: 'Sándwich de pollo deshilachado', categoria: 'Sándwiches',   precio: 9.5,  agotado: false },
    { id: 2,  nombre: 'Empanada de carne',              categoria: 'Snacks',       precio: 5.0,  agotado: true },
    { id: 3,  nombre: 'Menú ejecutivo',                 categoria: 'Menú del día', precio: 14.0, agotado: false },
    { id: 4,  nombre: 'Chicha morada',                  categoria: 'Jugos y bebidas', precio: 4.5, agotado: true },
    { id: 5,  nombre: 'Café pasado',                    categoria: 'Café',         precio: 3.5,  agotado: false },
    { id: 6,  nombre: 'Ensalada de frutas',             categoria: 'Desayunos',    precio: 7.0,  agotado: true },
    { id: 7,  nombre: 'Jugo surtido',                   categoria: 'Jugos y bebidas', precio: 6.5, agotado: false },
    { id: 8,  nombre: 'Alfajor de maicena',             categoria: 'Snacks',       precio: 3.5,  agotado: false },
    { id: 9,  nombre: 'Sándwich de jamón y queso',      categoria: 'Sándwiches',   precio: 8.0,  agotado: false },
    { id: 10, nombre: 'Tostadas con palta',             categoria: 'Desayunos',    precio: 8.5,  agotado: false },
    { id: 11, nombre: 'Café con leche',                 categoria: 'Café',         precio: 4.5,  agotado: false },
    { id: 12, nombre: 'Capuchino',                      categoria: 'Café',         precio: 6.0,  agotado: false },
    { id: 13, nombre: 'Limonada frozen',                categoria: 'Jugos y bebidas', precio: 6.0, agotado: false },
    { id: 14, nombre: 'Menú light',                     categoria: 'Menú del día', precio: 13.0, agotado: false },
    { id: 15, nombre: 'Ensalada César',                 categoria: 'Menú del día', precio: 11.0, agotado: false },
    { id: 16, nombre: 'Empanada de pollo',              categoria: 'Snacks',       precio: 5.0,  agotado: false },
    { id: 17, nombre: 'Keke de zanahoria',              categoria: 'Snacks',       precio: 4.0,  agotado: false },
    { id: 18, nombre: 'Yogur con granola',              categoria: 'Desayunos',    precio: 6.5,  agotado: false },
];

const soles = (n) => `S/ ${n.toFixed(2)}`;

export default function Agotados() {
    const [estadoLocal, setEstadoLocal] = useState('abierto');
    const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
    const [aviso, setAviso] = useState('');

    const totalAgotados = useMemo(() => productos.filter((p) => p.agotado).length, [productos]);

    const cambiarEstado = (id) => {
        setEstadoLocal(id);
        const e = ESTADOS_LOCAL.find((x) => x.id === id);
        setAviso(`Estado del local: ${e.titulo}. Se aplicó de inmediato.`);
    };

    const alternar = (id) => {
        const p = productos.find((x) => x.id === id);
        const nuevo = !p.agotado;
        setProductos((prev) => prev.map((x) => (x.id === id ? { ...x, agotado: nuevo } : x)));
        setAviso(
            nuevo
                ? `«${p.nombre}» quedó marcada como agotada. Se muestra atenuada en la carta del comensal.`
                : `«${p.nombre}» vuelve a estar disponible en la carta del comensal.`
        );
    };

    const restablecer = () => {
        if (totalAgotados === 0) return;
        setProductos((prev) => prev.map((x) => ({ ...x, agotado: false })));
        setAviso('Se restablecieron todos los productos. Todos están disponibles.');
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
                            Tienes {PEDIDOS_EN_CURSO} pedidos en curso. Suspender la recepción no cancela los
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
                                        {totalAgotados} de {productos.length} productos marcados como agotados
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
                                            <tr key={p.id} className={p.agotado ? 'fila-agotada' : ''}>
                                                <td>{p.nombre}</td>
                                                <td className="col-cat muted">{p.categoria}</td>
                                                <td className="precio">{soles(p.precio)}</td>
                                                <td>
                                                    <label className="toggle">
                                                        <input
                                                            type="checkbox"
                                                            className="switch"
                                                            checked={p.agotado}
                                                            onChange={() => alternar(p.id)}
                                                            aria-label={`Marcar ${p.nombre} como agotado`}
                                                        />
                                                        <span className={p.agotado ? 'toggle-si' : 'toggle-no'}>
                                                            {p.agotado ? 'Sí' : 'No'}
                                                        </span>
                                                    </label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

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
