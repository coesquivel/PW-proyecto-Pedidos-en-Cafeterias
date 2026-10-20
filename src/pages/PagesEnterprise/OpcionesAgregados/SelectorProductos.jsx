import React from 'react';

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

export default function SelectorProductos({
    productos,
    busqueda,
    setBusqueda,
    categoriaFiltro,
    setCategoriaFiltro,
    categorias,
    onSeleccionarProducto
}) {
    // Productos filtrados por texto y categoría
    const productosFiltrados = productos.filter((p) => {
        const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCat = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;
        return coincideTexto && coincideCat;
    });

    return (
        <div className="opciones-container">
            <div className="opciones-topbar">
                <div>
                    <span className="text-muted-custom small">
                        Carta &gt; Opciones y agregados
                    </span>
                    <h1 className="opciones-title">Selecciona un producto</h1>
                    <p className="text-muted-custom small">
                        Elige un producto de tu carta para configurar sus grupos de opciones y agregados.
                    </p>
                </div>
            </div>

            {/* Filtros y Buscador */}
            <div className="productos-filtros">
                <input
                    type="text"
                    className="form-input productos-buscador"
                    placeholder="Buscar producto por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="productos-categorias">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`cat-chip ${categoriaFiltro === cat ? 'activo' : ''}`}
                            onClick={() => setCategoriaFiltro(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cuadrícula de tarjetas */}
            <div className="productos-grid">
                {productosFiltrados.map((prod) => {
                    const cantGrupos = prod.grupos.length;
                    const cantAlt = prod.grupos.reduce((s, g) => s + g.alternativas.length, 0);

                    return (
                        <article
                            key={prod.id}
                            className="producto-card-select"
                            onClick={() => onSeleccionarProducto(prod.id)}
                        >
                            <div className="producto-card-img">
                                <img src={prod.imagen} alt={prod.nombre} />
                                <span className="producto-cat-badge">{prod.categoria}</span>
                            </div>

                            <div className="producto-card-body">
                                <div className="producto-card-header">
                                    <h3>{prod.nombre}</h3>
                                    <span className="producto-precio">{soles(prod.precio)}</span>
                                </div>

                                <div className="producto-card-meta">
                                    <span className={`tag ${cantGrupos > 0 ? 'tag-rojo' : 'tag-gris'}`}>
                                        {cantGrupos} {cantGrupos === 1 ? 'grupo' : 'grupos'}
                                    </span>
                                    <span className="text-muted-custom small">
                                        {cantAlt} {cantAlt === 1 ? 'alternativa' : 'alternativas'}
                                    </span>
                                </div>

                                <button type="button" className="btn-configurar-opciones">
                                    Configurar opciones &rarr;
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}