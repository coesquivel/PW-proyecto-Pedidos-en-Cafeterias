// src/pages/PagesOwner/Ranking/Ranking.jsx
import { useEffect, useMemo, useState } from 'react';
import './Ranking.css';
import { obtenerRanking } from '../../../api/owner';
import { mensajeDeError } from '../../../api/carta';

const MINIMO_CALIFICACIONES = 10;
const TOP = 5;
const DIAS = 30;

const fechaCorta = (f) => f.split('-').reverse().join('/');

const ordenarPorNota = (a, b) => b.nota - a.nota || b.calificaciones - a.calificaciones;

const fondoLogo = (url) => (url ? { background: `center / cover no-repeat url(${url})` } : undefined);

function TarjetaRanking({ titulo, items, detalle }) {
    return (
        <section className="ranking-card">
            <h2 className="ranking-card-title">{titulo}</h2>

            {items.length === 0 ? (
                <p className="ranking-vacio">No hay datos con estos filtros.</p>
            ) : (
                <ol className="ranking-list">
                    {items.map((item, index) => (
                        <li key={item.id} className="ranking-item">
                            <span className={`ranking-pos ${index < 3 ? 'ranking-pos--top' : ''}`}>
                                {index + 1}
                            </span>
                            <div className="ranking-thumb" style={fondoLogo(item.imagen)}></div>
                            <div className="ranking-info">
                                <span className="ranking-nombre">{item.nombre}</span>
                                <span className="ranking-detalle">{detalle(item)}</span>
                            </div>
                            <span className="ranking-nota">{item.nota.toFixed(1)}</span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

export default function Ranking() {
    const [categoria, setCategoria] = useState('todas');
    const [sede, setSede] = useState('');
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        obtenerRanking(DIAS)
            .then((r) => setDatos({
                periodo: { from: r.from, to: r.to },
                productos: r.products.map((p) => ({
                    id: p.id, nombre: p.name, local: p.store_name, categoria: p.category || 'Sin categoría',
                    sede: p.campus, nota: p.rating, calificaciones: p.count, imagen: p.picture_url,
                })),
                locales: r.stores.map((l) => ({
                    id: l.id, nombre: l.name, sede: l.campus, nota: l.rating, calificaciones: l.count,
                    espera: l.wait, imagen: l.logo_url,
                })),
            }))
            .catch((e) => setError(mensajeDeError(e, 'No se pudo cargar el ranking.')));
    }, []);

    const productos = datos?.productos ?? [];
    const locales = datos?.locales ?? [];

    // Sedes y categorías que realmente existen en los datos
    const sedes = useMemo(() => [...new Set([...productos, ...locales].map((x) => x.sede))].sort(), [productos, locales]);
    const categorias = useMemo(() => [...new Set(productos.map((p) => p.categoria))].sort(), [productos]);
    const sedeActual = sede || sedes[0] || '';

    const productosTop = productos
        .filter((p) => p.calificaciones >= MINIMO_CALIFICACIONES)
        .filter((p) => p.sede === sedeActual)
        .filter((p) => categoria === 'todas' || p.categoria === categoria)
        .sort(ordenarPorNota)
        .slice(0, TOP);

    const localesTop = locales
        .filter((l) => l.calificaciones >= MINIMO_CALIFICACIONES)
        .filter((l) => l.sede === sedeActual)
        .sort(ordenarPorNota)
        .slice(0, TOP);

    return (
        <div className="ranking-page">

            <div className="ranking-topbar">
                <div>
                    <span className="ranking-breadcrumb">Contenido › Ranking de productos y locales</span>
                    <h1 className="ranking-title">Ranking de productos y locales</h1>
                    <p className="ranking-subtitle">
                        {datos ? `Periodo ${fechaCorta(datos.periodo.from)} al ${fechaCorta(datos.periodo.to)}` : 'Cargando…'} · mínimo {MINIMO_CALIFICACIONES} calificaciones
                    </p>
                </div>

                <div className="ranking-filtros">
                    <select className="ranking-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="todas">Categoría: todas</option>
                        {categorias.map((c) => (
                            <option key={c} value={c}>Categoría: {c}</option>
                        ))}
                    </select>
                    <select className="ranking-select" value={sedeActual} onChange={(e) => setSede(e.target.value)}>
                        {sedes.map((x) => (
                            <option key={x} value={x}>Sede: {x}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <p className="ranking-vacio">{error}</p>}

            <div className="ranking-grid">
                <TarjetaRanking
                    titulo="Productos mejor calificados"
                    items={productosTop}
                    detalle={(p) => `${p.local} · ${p.calificaciones} calificaciones`}
                />
                <TarjetaRanking
                    titulo="Locales mejor calificados"
                    items={localesTop}
                    detalle={(l) => `${l.calificaciones} calificaciones${l.espera ? ` · ${l.espera} min de espera` : ''}`}
                />
            </div>

        </div>
    );
}