import { useState } from 'react';
import './OpcionesAgregados.css';

// Catálogo inicial de productos con sus imágenes y sus propios grupos de opciones
const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: 'Sándwich de pollo deshilachado',
        categoria: 'Sándwiches',
        precio: 12.50,
        imagen: '/assets/img/cafeteriaCentral.png',
        grupos: [
            {
                id: 1, nombre: 'Tipo de pan', seleccion: 'unica', obligatorio: true,
                alternativas: [
                    { id: 11, nombre: 'Pan francés', precio: 0 },
                    { id: 12, nombre: 'Pan ciabatta', precio: 1.0 },
                    { id: 13, nombre: 'Pan integral', precio: 1.5 },
                ],
            },
            {
                id: 2, nombre: 'Agregados', seleccion: 'multiple', obligatorio: false,
                alternativas: [
                    { id: 21, nombre: 'Agregar queso', precio: 2.0 },
                    { id: 22, nombre: 'Palta extra', precio: 2.5 },
                    { id: 23, nombre: 'Doble porción de pollo', precio: 4.0 },
                ],
            },
            {
                id: 3, nombre: 'Para llevar', seleccion: 'unica', obligatorio: false,
                alternativas: [
                    { id: 31, nombre: 'En el local', precio: 0 },
                    { id: 32, nombre: 'Empaque para llevar', precio: 0.5 },
                ],
            },
        ],
    },
    {
        id: 2,
        nombre: 'Café Americano / Espresso',
        categoria: 'Bebidas calientes',
        precio: 6.50,
        imagen: '/assets/img/cafeteria.png',
        grupos: [
            {
                id: 101, nombre: 'Tamaño del vaso', seleccion: 'unica', obligatorio: true,
                alternativas: [
                    { id: 1011, nombre: 'Regular (8 oz)', precio: 0 },
                    { id: 1012, nombre: 'Grande (12 oz)', precio: 2.0 },
                ],
            },
            {
                id: 102, nombre: 'Endulzante', seleccion: 'unica', obligatorio: false,
                alternativas: [
                    { id: 1021, nombre: 'Azúcar rubia', precio: 0 },
                    { id: 1022, nombre: 'Stevia', precio: 0 },
                    { id: 1023, nombre: 'Sin endulzante', precio: 0 },
                ],
            },
        ],
    },
    {
        id: 3,
        nombre: 'Bowl de Ensalada César con Pollo',
        categoria: 'Platos de fondo',
        precio: 16.00,
        imagen: '/assets/img/cafeteriaCentral.png',
        grupos: [
            {
                id: 201, nombre: 'Tipo de aliño', seleccion: 'unica', obligatorio: true,
                alternativas: [
                    { id: 2011, nombre: 'Aliño César clásico', precio: 0 },
                    { id: 2012, nombre: 'Vinagreta de la casa', precio: 0 },
                ],
            },
        ],
    },
    {
        id: 4,
        nombre: 'Empanada artesanal horneada',
        categoria: 'Snacks y postres',
        precio: 7.00,
        imagen: '/assets/img/cafeteria.png',
        grupos: [],
    },
    {
        id: 5,
        nombre: 'Jugo de frutas natural',
        categoria: 'Bebidas frías',
        precio: 8.50,
        imagen: '/assets/img/cafeteriaCentral.png',
        grupos: [
            {
                id: 301, nombre: 'Temperatura', seleccion: 'unica', obligatorio: true,
                alternativas: [
                    { id: 3011, nombre: 'Sin helar', precio: 0 },
                    { id: 3012, nombre: 'Helado (con hielo)', precio: 0 },
                ],
            },
        ],
    },
    {
        id: 6,
        nombre: 'Croissant mixto de jamón y queso',
        categoria: 'Sándwiches',
        precio: 10.50,
        imagen: '/assets/img/cafeteria.png',
        grupos: [],
    },
];

const FORM_VACIO = {
    id: null,
    nombre: '',
    seleccion: 'unica',
    obligatorio: false,
    alternativas: [
        { id: 'n1', nombre: '', precio: '' },
        { id: 'n2', nombre: '', precio: '' },
    ],
};

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;
const precioTexto = (n) => (n > 0 ? `+ ${soles(n)}` : 'Sin costo');

export default function OpcionesAgregados() {
    const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
    // null = mostramos la galería de productos; número = mostramos las opciones de ese producto
    const [productoIdActivo, setProductoIdActivo] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

    const [form, setForm] = useState(FORM_VACIO);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    // Producto actualmente seleccionado
    const productoActual = productos.find((p) => p.id === productoIdActivo) || null;
    const grupos = productoActual ? productoActual.grupos : [];
    const totalAlternativas = grupos.reduce((s, g) => s + g.alternativas.length, 0);
    const editando = form.id !== null;

    // Categorías únicas para el filtro
    const categorias = ['Todas', ...new Set(productos.map((p) => p.categoria))];

    // Productos filtrados por búsqueda y categoría
    const productosFiltrados = productos.filter((p) => {
        const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCat = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;
        return coincideTexto && coincideCat;
    });

    /* ---------- Navegación entre vistas ---------- */
    const seleccionarProducto = (id) => {
        setProductoIdActivo(id);
        setForm({ ...FORM_VACIO, alternativas: FORM_VACIO.alternativas.map((a) => ({ ...a })) });
        setError('');
        setAviso('');
    };

    const volverAListaProductos = () => {
        setProductoIdActivo(null);
        setError('');
        setAviso('');
    };

    /* ---------- Actualizar grupos del producto activo ---------- */
    const actualizarGruposProducto = (nuevosGrupos) => {
        setProductos((prev) =>
            prev.map((p) => (p.id === productoIdActivo ? { ...p, grupos: nuevosGrupos } : p))
        );
    };

    /* ---------- Formulario de grupos ---------- */
    const nuevoGrupo = () => {
        setForm({ ...FORM_VACIO, alternativas: FORM_VACIO.alternativas.map((a) => ({ ...a })) });
        setError('');
        setAviso('');
    };

    const editarGrupo = (g) => {
        setForm({
            ...g,
            alternativas: g.alternativas.map((a) => ({
                ...a,
                precio: a.precio === 0 ? '' : String(a.precio),
            })),
        });
        setError('');
        setAviso('');
    };

    const cambiarCampo = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

    const cambiarAlternativa = (id, campo, valor) =>
        setForm((f) => ({
            ...f,
            alternativas: f.alternativas.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)),
        }));

    const agregarAlternativa = () =>
        setForm((f) => ({
            ...f,
            alternativas: [...f.alternativas, { id: `n${Date.now()}`, nombre: '', precio: '' }],
        }));

    const quitarAlternativa = (id) =>
        setForm((f) => ({ ...f, alternativas: f.alternativas.filter((a) => a.id !== id) }));

    const guardar = (e) => {
        e.preventDefault();
        setAviso('');

        const nombre = form.nombre.trim();
        const alternativas = form.alternativas
            .filter((a) => a.nombre.trim() !== '')
            .map((a) => ({ id: a.id, nombre: a.nombre.trim(), precio: parseFloat(a.precio) || 0 }));

        if (!nombre) return setError('Escribe el nombre del grupo.');
        if (alternativas.length === 0) return setError('Agrega al menos una alternativa con nombre.');
        if (alternativas.some((a) => a.precio < 0)) return setError('El precio no puede ser negativo.');

        const grupo = {
            id: form.id ?? Date.now(),
            nombre,
            seleccion: form.seleccion,
            obligatorio: form.obligatorio,
            alternativas,
        };

        const nuevosGrupos = editando
            ? grupos.map((g) => (g.id === grupo.id ? grupo : g))
            : [...grupos, grupo];

        actualizarGruposProducto(nuevosGrupos);
        setAviso(editando ? `Grupo «${nombre}» actualizado.` : `Grupo «${nombre}» creado.`);
        setError('');
        setForm({ ...FORM_VACIO, alternativas: FORM_VACIO.alternativas.map((a) => ({ ...a })) });
    };

    const eliminarGrupo = () => {
        if (!window.confirm(`¿Eliminar el grupo «${form.nombre}»?`)) return;
        const nuevosGrupos = grupos.filter((g) => g.id !== form.id);
        actualizarGruposProducto(nuevosGrupos);
        setAviso(`Grupo «${form.nombre}» eliminado.`);
        nuevoGrupo();
    };

    /* =====================================================================
       VISTA 1: CATÁLOGO DE PRODUCTOS CON IMÁGENES (CUANDO NO HAY SELECCIÓN)
       ===================================================================== */
    if (!productoActual) {
        return (
            <main className="app-content">
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

                    {/* Barra de búsqueda y filtro por categoría */}
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

                    {/* Cuadrícula de productos con imagen */}
                    <div className="productos-grid">
                        {productosFiltrados.map((prod) => {
                            const cantGrupos = prod.grupos.length;
                            const cantAlt = prod.grupos.reduce((s, g) => s + g.alternativas.length, 0);

                            return (
                                <article
                                    key={prod.id}
                                    className="producto-card-select"
                                    onClick={() => seleccionarProducto(prod.id)}
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
            </main>
        );
    }

    /* =====================================================================
       VISTA 2: OPCIONES Y AGREGADOS DEL PRODUCTO SELECCIONADO
       ===================================================================== */
    return (
        <main className="app-content">
            <div className="opciones-container">

                <div className="opciones-topbar">
                    <div>
                        <span className="text-muted-custom small">
                            Carta &gt;{' '}
                            <button
                                type="button"
                                className="breadcrumb-link"
                                onClick={volverAListaProductos}
                            >
                                Opciones y agregados
                            </button>{' '}
                            &gt; {productoActual.nombre}
                        </span>
                        <h1 className="opciones-title">Opciones de «{productoActual.nombre}»</h1>
                        <p className="text-muted-custom small">
                            {grupos.length} {grupos.length === 1 ? 'grupo' : 'grupos'} de opciones • {totalAlternativas} alternativas
                        </p>
                    </div>

                    <div className="opciones-topbar-actions">
                        <button
                            type="button"
                            className="btn-volver-productos"
                            onClick={volverAListaProductos}
                        >
                            &larr; Cambiar producto
                        </button>
                        <button className="btn btn-danger-custom opciones-nuevo" onClick={nuevoGrupo}>
                            Nuevo grupo
                        </button>
                    </div>
                </div>

                {aviso && <p className="opciones-aviso" role="status">{aviso}</p>}

                <div className="opciones-layout">

                    {/* ===== Lista de grupos ===== */}
                    <div className="opciones-lista">
                        {grupos.length === 0 && (
                            <p className="opciones-vacio">
                                Este producto no tiene opciones. Crea el primer grupo con el formulario.
                            </p>
                        )}

                        {grupos.map((g) => (
                            <section
                                key={g.id}
                                className={`grupo-card ${form.id === g.id ? 'grupo-editando' : ''}`}
                            >
                                <header className="grupo-head">
                                    <h2>{g.nombre}</h2>
                                    <div className="grupo-tags">
                                        <span className="tag tag-rojo">
                                            {g.seleccion === 'unica' ? 'Selección única' : 'Selección múltiple'}
                                        </span>
                                        <span className={`tag ${g.obligatorio ? 'tag-rojo' : 'tag-gris'}`}>
                                            {g.obligatorio ? 'Obligatorio' : 'Opcional'}
                                        </span>
                                        <button className="link-editar" onClick={() => editarGrupo(g)}>
                                            Editar
                                        </button>
                                    </div>
                                </header>

                                <ul className="grupo-items">
                                    {g.alternativas.map((a) => (
                                        <li key={a.id}>
                                            <span>{a.nombre}</span>
                                            <strong className={a.precio > 0 ? '' : 'sin-costo'}>
                                                {precioTexto(a.precio)}
                                            </strong>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>

                    {/* ===== Formulario ===== */}
                    <form className="grupo-form" onSubmit={guardar}>
                        <h3 className="form-title">
                            {editando ? 'EDITAR GRUPO DE OPCIONES' : 'NUEVO GRUPO DE OPCIONES'}
                        </h3>

                        <label className="form-label" htmlFor="g-nombre">NOMBRE DEL GRUPO</label>
                        <input
                            id="g-nombre"
                            className="form-input"
                            type="text"
                            placeholder="Tamaño"
                            value={form.nombre}
                            onChange={(e) => cambiarCampo('nombre', e.target.value)}
                        />

                        <span className="form-label">TIPO DE SELECCIÓN</span>
                        <div className="form-radios">
                            <label className={form.seleccion === 'unica' ? 'radio activo' : 'radio'}>
                                <input
                                    type="radio"
                                    name="seleccion"
                                    checked={form.seleccion === 'unica'}
                                    onChange={() => cambiarCampo('seleccion', 'unica')}
                                />
                                <span>Única</span>
                            </label>
                            <label className={form.seleccion === 'multiple' ? 'radio activo' : 'radio'}>
                                <input
                                    type="radio"
                                    name="seleccion"
                                    checked={form.seleccion === 'multiple'}
                                    onChange={() => cambiarCampo('seleccion', 'multiple')}
                                />
                                <span>Múltiple</span>
                            </label>
                        </div>

                        <label className="switch-row">
                            <input
                                type="checkbox"
                                className="switch"
                                checked={form.obligatorio}
                                onChange={(e) => cambiarCampo('obligatorio', e.target.checked)}
                            />
                            <span>Obligatorio para el comensal</span>
                        </label>

                        <span className="form-label">ALTERNATIVAS</span>
                        <div className="alt-lista">
                            {form.alternativas.map((a) => (
                                <div className="alt-fila" key={a.id}>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Nombre"
                                        value={a.nombre}
                                        onChange={(e) => cambiarAlternativa(a.id, 'nombre', e.target.value)}
                                    />
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        inputMode="decimal"
                                        placeholder="S/ 0.00"
                                        value={a.precio}
                                        onChange={(e) => cambiarAlternativa(a.id, 'precio', e.target.value)}
                                    />
                                    {form.alternativas.length > 1 && (
                                        <button
                                            type="button"
                                            className="alt-quitar"
                                            aria-label="Quitar alternativa"
                                            onClick={() => quitarAlternativa(a.id)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button type="button" className="link-editar link-agregar" onClick={agregarAlternativa}>
                            + Agregar alternativa
                        </button>

                        {error && <p className="form-error" role="alert">{error}</p>}

                        <button type="submit" className="btn btn-danger-custom form-guardar">
                            {editando ? 'Guardar cambios' : 'Guardar grupo'}
                        </button>

                        {editando && (
                            <div className="form-secundarios">
                                <button type="button" className="link-secundario" onClick={nuevoGrupo}>
                                    Cancelar
                                </button>
                                <button type="button" className="link-secundario link-peligro" onClick={eliminarGrupo}>
                                    Eliminar grupo
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
}