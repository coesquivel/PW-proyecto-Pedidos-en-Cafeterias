import { useEffect, useState } from 'react';
import {
    obtenerProductos, obtenerGruposDeProducto, crearGrupo, actualizarGrupo,
    eliminarGrupoApi, mensajeDeError,
} from '../../../api/carta';
import SelectorProductos from './SelectorProductos';
import ListaGrupos from './ListaGrupos';
import FormularioGrupo from './FormularioGrupo';
import './OpcionesAgregados.css';

// Grupo de la API -> grupo de la pantalla
const grupoAPantalla = (g) => ({
    id: g.id,
    nombre: g.name,
    seleccion: g.selection_type,
    obligatorio: g.is_required,
    alternativas: g.options.map((o) => ({ id: o.id, nombre: o.name, precio: o.additional_price })),
});

// Grupo de la pantalla -> cuerpo que espera la API
const grupoAApi = (g) => ({
    name: g.nombre,
    selection_type: g.seleccion,
    is_required: g.obligatorio,
    options: g.alternativas.map((a) => ({ name: a.nombre, additional_price: a.precio })),
});

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
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [productoIdActivo, setProductoIdActivo] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

    const [form, setForm] = useState(FORM_VACIO);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const lista = await obtenerProductos();
                const conGrupos = await Promise.all(
                    lista.map(async (p) => ({
                        id: p.id,
                        nombre: p.name,
                        categoria: p.category?.name || 'Sin categoría',
                        precio: Number(p.price),
                        imagen: p.picture_url || '',
                        grupos: (await obtenerGruposDeProducto(p.id)).map(grupoAPantalla),
                    }))
                );
                setProductos(conGrupos);
            } catch (e) {
                setError(mensajeDeError(e, 'No se pudo cargar tu carta.'));
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

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

    const guardar = async (e) => {
        e.preventDefault();
        setAviso('');

        const nombre = form.nombre.trim();
        const alternativas = form.alternativas
            .filter((a) => a.nombre.trim() !== '')
            .map((a) => ({ id: a.id, nombre: a.nombre.trim(), precio: parseFloat(a.precio) || 0 }));

        if (!nombre) return setError('Escribe el nombre del grupo.');
        if (alternativas.length === 0) return setError('Agrega al menos una alternativa con nombre.');
        if (alternativas.some((a) => a.precio < 0)) return setError('El precio no puede ser negativo.');

        const cuerpo = grupoAApi({ nombre, seleccion: form.seleccion, obligatorio: form.obligatorio, alternativas });

        try {
            const guardado = grupoAPantalla(
                editando
                    ? await actualizarGrupo(form.id, cuerpo)
                    : await crearGrupo(productoIdActivo, cuerpo)
            );
            actualizarGruposProducto(
                editando ? grupos.map((g) => (g.id === guardado.id ? guardado : g)) : [...grupos, guardado]
            );
            setAviso(editando ? `Grupo «${nombre}» actualizado.` : `Grupo «${nombre}» creado.`);
            setError('');
            setForm({ ...FORM_VACIO, alternativas: FORM_VACIO.alternativas.map((a) => ({ ...a })) });
        } catch (err) {
            setError(mensajeDeError(err, 'No se pudo guardar el grupo.'));
        }
    };

    const eliminarGrupo = async () => {
        if (!window.confirm(`¿Eliminar el grupo «${form.nombre}»?`)) return;
        try {
            await eliminarGrupoApi(form.id);
            actualizarGruposProducto(grupos.filter((g) => g.id !== form.id));
            setAviso(`Grupo «${form.nombre}» eliminado.`);
            nuevoGrupo();
        } catch (err) {
            setError(mensajeDeError(err, 'No se pudo eliminar el grupo.'));
        }
    };

    if (cargando) {
        return <main className="app-content"><p className="text-muted-custom">Cargando tu carta…</p></main>;
    }

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