// src/pages/PagesOwner/Ranking/Ranking.jsx
import { useState } from 'react';
import './Ranking.css';

const MINIMO_CALIFICACIONES = 10;
const TOP = 5;

// Datos de ejemplo (luego los reemplazas por tu API)
const PRODUCTOS = [
    { id: 1, nombre: 'Sándwich de pollo deshilachado', local: 'Cafetería Central',    categoria: 'desayunos', sede: 'monterrico', nota: 4.9, calificaciones: 62 },
    { id: 2, nombre: 'Jugo surtido',                   local: 'Juguería La Fuente',   categoria: 'bebidas',   sede: 'monterrico', nota: 4.8, calificaciones: 48 },
    { id: 3, nombre: 'Café pasado',                    local: 'Café de Biblioteca',   categoria: 'bebidas',   sede: 'monterrico', nota: 4.7, calificaciones: 71 },
    { id: 4, nombre: 'Menú ejecutivo',                 local: 'Menú Universitario N', categoria: 'menu',      sede: 'monterrico', nota: 4.5, calificaciones: 96 },
    { id: 5, nombre: 'Pan con palta',                  local: 'Cafetería Central',    categoria: 'desayunos', sede: 'monterrico', nota: 4.4, calificaciones: 34 },
    { id: 6, nombre: 'Chicha morada',                  local: 'Sanguchería del pabellón E', categoria: 'bebidas', sede: 'monterrico', nota: 4.3, calificaciones: 27 },
    { id: 7, nombre: 'Empanada de carne',              local: 'Cafetería Central',    categoria: 'snacks',    sede: 'monterrico', nota: 4.2, calificaciones: 19 },
    { id: 8, nombre: 'Brownie de chocolate',           local: 'Café de Biblioteca',   categoria: 'snacks',    sede: 'monterrico', nota: 4.9, calificaciones: 6 },
];

const LOCALES = [
    { id: 1, nombre: 'Café de Biblioteca',         sede: 'monterrico', nota: 4.8, calificaciones: 96,  espera: 6 },
    { id: 2, nombre: 'Cafetería Central',          sede: 'monterrico', nota: 4.6, calificaciones: 128, espera: 12 },
    { id: 3, nombre: 'Juguería La Fuente',         sede: 'monterrico', nota: 4.5, calificaciones: 74,  espera: 8 },
    { id: 4, nombre: 'Sanguchería del pabellón E', sede: 'monterrico', nota: 4.3, calificaciones: 61,  espera: 10 },
    { id: 5, nombre: 'Menú Universitario N',       sede: 'monterrico', nota: 4.2, calificaciones: 142, espera: 15 },
];

const CATEGORIAS = [
    { value: 'todas',     label: 'Categoría: todas' },
    { value: 'desayunos', label: 'Categoría: desayunos' },
    { value: 'bebidas',   label: 'Categoría: bebidas' },
    { value: 'menu',      label: 'Categoría: menú' },
    { value: 'snacks',    label: 'Categoría: snacks' },
];

const SEDES = [
    { value: 'monterrico', label: 'Sede: Monterrico' },
    { value: 'sanisidro',  label: 'Sede: San Isidro' },
];

const ordenarPorNota = (a, b) => b.nota - a.nota || b.calificaciones - a.calificaciones;

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
                            <div className="ranking-thumb"></div>
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
    const [sede, setSede] = useState('monterrico');

    const productosTop = PRODUCTOS
        .filter((p) => p.calificaciones >= MINIMO_CALIFICACIONES)
        .filter((p) => p.sede === sede)
        .filter((p) => categoria === 'todas' || p.categoria === categoria)
        .sort(ordenarPorNota)
        .slice(0, TOP);

    const localesTop = LOCALES
        .filter((l) => l.calificaciones >= MINIMO_CALIFICACIONES)
        .filter((l) => l.sede === sede)
        .sort(ordenarPorNota)
        .slice(0, TOP);

    return (
        <div className="ranking-page">

            <div className="ranking-topbar">
                <div>
                    <span className="ranking-breadcrumb">Contenido › Ranking de productos y locales</span>
                    <h1 className="ranking-title">Ranking de productos y locales</h1>
                    <p className="ranking-subtitle">
                        Periodo 01/09/2026 al 15/09/2026 · mínimo {MINIMO_CALIFICACIONES} calificaciones
                    </p>
                </div>

                <div className="ranking-filtros">
                    <select className="ranking-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        {CATEGORIAS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                    <select className="ranking-select" value={sede} onChange={(e) => setSede(e.target.value)}>
                        {SEDES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="ranking-grid">
                <TarjetaRanking
                    titulo="Productos mejor calificados"
                    items={productosTop}
                    detalle={(p) => `${p.local} · ${p.calificaciones} calificaciones`}
                />
                <TarjetaRanking
                    titulo="Locales mejor calificados"
                    items={localesTop}
                    detalle={(l) => `${l.calificaciones} calificaciones · ${l.espera} min de espera`}
                />
            </div>

        </div>
    );
}