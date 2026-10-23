import { useState } from 'react';
import SelectorProductos from './SelectorProductos';
import ListaGrupos from './ListaGrupos';
import FormularioGrupo from './FormularioGrupo';
import './OpcionesAgregados.css';

const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: 'Sándwich de pollo deshilachado',
        categoria: 'Sándwiches',
        precio: 12.50,
        imagen: '',
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
        imagen: '',
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
        imagen: '',
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
        imagen: '',
        grupos: [],
    },
    {
        id: 5,
        nombre: 'Jugo de frutas natural',
        categoria: 'Bebidas frías',
        precio: 8.50,
        imagen: '',
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
        imagen: '',
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

export default function OpcionesAgregados() {
    const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
    const [productoIdActivo, setProductoIdActivo] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

    const [form, setForm] = useState(FORM_VACIO);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    const productoActual = productos.find((p) => p.id === productoIdActivo) || null;
    const grupos = productoActual ? productoActual.grupos : [];
    const totalAlternativas = grupos.reduce((s, g) => s + g.alternativas.length, 0);
    const editando = form.id !== null;
    const categorias = ['Todas', ...new Set(productos.map((p) => p.categoria))];

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

    const actualizarGruposProducto = (nuevosGrupos) => {
        setProductos((prev) =>
            prev.map((p) => (p.id === productoIdActivo ? { ...p, grupos: nuevosGrupos } : p))
        );
    };

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

    // VISTA 1: Selector de productos
    if (!productoActual) {
        return (
            <main className="app-content">
                <SelectorProductos
                    productos={productos}
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    categoriaFiltro={categoriaFiltro}
                    setCategoriaFiltro={setCategoriaFiltro}
                    categorias={categorias}
                    onSeleccionarProducto={seleccionarProducto}
                />
            </main>
        );
    }

    // VISTA 2: Editor de grupos del producto seleccionado
    return (
        <main className="app-content">
            <div className="opciones-container">
                <div className="opciones-topbar">
                    <div>
                        <span className="text-muted-custom small">
                            Carta &gt;{' '}
                            <button type="button" className="breadcrumb-link" onClick={volverAListaProductos}>
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
                        <button type="button" className="btn-volver-productos" onClick={volverAListaProductos}>
                            &larr; Cambiar producto
                        </button>
                        <button className="btn btn-danger-custom opciones-nuevo" onClick={nuevoGrupo}>
                            Nuevo grupo
                        </button>
                    </div>
                </div>

                {aviso && <p className="opciones-aviso" role="status">{aviso}</p>}

                <div className="opciones-layout">
                    <ListaGrupos
                        grupos={grupos}
                        formIdEditando={form.id}
                        onEditarGrupo={editarGrupo}
                    />

                    <FormularioGrupo
                        form={form}
                        editando={editando}
                        error={error}
                        onChangeCampo={cambiarCampo}
                        onChangeAlternativa={cambiarAlternativa}
                        onAgregarAlternativa={agregarAlternativa}
                        onQuitarAlternativa={quitarAlternativa}
                        onGuardar={guardar}
                        onCancelar={nuevoGrupo}
                        onEliminar={eliminarGrupo}
                    />
                </div>
            </div>
        </main>
    );
}