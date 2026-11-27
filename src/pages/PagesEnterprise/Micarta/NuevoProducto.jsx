import { useState, useRef, useEffect } from "react";
import "./NuevoProducto.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  formularioAProducto,
  mensajeDeError,
  archivoADataUrl,
  subirFotoProducto,
  quitarFotoProducto,
} from "../../../api/carta";
// Bootstrap 5 debe estar cargado una sola vez en tu app (ej. en main.jsx / index.js):
//   import "bootstrap/dist/css/bootstrap.min.css";

/* Las categorías vienen de la carta del local (base de datos) */
const DISPONIBILIDAD = ["Disponible", "Agotado"];
const PRECIO_MIN = 3.5;
const PRECIO_MAX = 18.0;
const MAX_DESCRIPCION = 160;

export default function NuevoProducto({ onCancelar, onGuardar }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Si llegamos desde el botón "Editar" de Mi carta, aquí viene el producto
  const productoEditar = location.state?.producto;
  const esEdicion = Boolean(productoEditar);

  /* Estado del formulario:
     - en modo edición arranca con los datos del producto
     - si viene de "Agregar producto a <categoría>", solo trae la categoría
     - si no, usa los valores del diseño */
  const [form, setForm] = useState(
    productoEditar ?? {
      nombre: "",
      descripcion: "",
      categoria: location.state?.categoria ?? "",
      precio: "",
      tiempo: "",
      disponibilidad: "Disponible",
    }
  );
  const [foto, setFoto] = useState(productoEditar?.foto_url ?? null); // foto que se muestra: la guardada o la elegida
  const [archivoFoto, setArchivoFoto] = useState(null); // archivo nuevo elegido (se sube al guardar)
  const [quitarFoto, setQuitarFoto] = useState(false);
  const inputFotoRef = useRef(null);

  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Trae las categorías del local; si el formulario no tiene una elegida, usa la primera
  useEffect(() => {
    obtenerCategorias()
      .then((lista) => {
        setCategorias(lista);
        setForm((prev) =>
          prev.categoria || lista.length === 0 ? prev : { ...prev, categoria: lista[0].name }
        );
      })
      .catch((e) => setError(mensajeDeError(e, "No se pudieron cargar las categorías.")))
      .finally(() => setCargandoCategorias(false));
  }, []);

  // Libera la URL temporal cuando cambia la foto o se cierra la vista
  useEffect(() => () => foto && foto.startsWith('blob:') && URL.revokeObjectURL(foto), [foto]);

  const cambiar = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const precioNumero = parseFloat(form.precio);
  const precioInvalido =
    form.precio !== "" &&
    (isNaN(precioNumero) || precioNumero < PRECIO_MIN || precioNumero > PRECIO_MAX);

  const elegirFoto = (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(archivo.type) || archivo.size > 3 * 1024 * 1024) {
      setError('La foto debe ser PNG, JPG o WEBP y pesar menos de 3 MB.');
      return;
    }

    setError('');
    setArchivoFoto(archivo);
    setQuitarFoto(false);
    setFoto(URL.createObjectURL(archivo));
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (precioInvalido || form.precio === "") return;

    const datos = formularioAProducto(form, categorias);
    if (!datos.category_id) {
      setError("Elige una categoría para el producto.");
      return;
    }

    setGuardando(true);
    setError("");
    try {
      const guardado = esEdicion
        ? await actualizarProducto(productoEditar.id, datos)
        : await crearProducto(datos);

      // La foto se sube después de guardar el producto (necesita su id)
      try {
        if (archivoFoto) {
          await subirFotoProducto(guardado.id, await archivoADataUrl(archivoFoto));
        } else if (quitarFoto && esEdicion) {
          await quitarFotoProducto(guardado.id);
        }
      } catch (errFoto) {
        setError(`El producto se guardó, pero la foto no: ${mensajeDeError(errFoto, errFoto.message)}`);
        setGuardando(false);
        return;
      }
      onGuardar?.({ ...form, precio: precioNumero, foto });
      navigate("/enterprises/Micarta"); // redirige a Mi carta
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo guardar el producto."));
      setGuardando(false);
    }
  };

  const cancelar = () => {
    onCancelar?.();
    navigate("/enterprises/Micarta");
  };

  const titulo = esEdicion ? "Editar producto" : "Nuevo producto";

  return (
    <div className="np-app p-4">
      {/* 1. RUTA DE NAVEGACIÓN (breadcrumb): "Carta › Mi carta › Nuevo/Editar producto" */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb np-xs mb-1">
          <li className="breadcrumb-item">Carta</li>
          <li className="breadcrumb-item">Mi carta</li>
          <li className="breadcrumb-item active">{titulo}</li>
        </ol>
      </nav>

      {/* 2. TÍTULO DE LA PÁGINA */}
      <h1 className="np-titulo h4 mb-3">{titulo}</h1>

      {/* 3. TARJETA BLANCA CON EL FORMULARIO Y LA VISTA PREVIA */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form className="card np-card" onSubmit={guardar}>
        <div className="card-body p-4">
          <div className="row g-4">
            {/* ======== 3.1 COLUMNA IZQUIERDA: CAMPOS DEL FORMULARIO ======== */}
            <div className="col-12 col-lg-8">
              {/* Nombre del producto */}
              <div className="mb-3">
                <label className="np-label" htmlFor="np-nombre">NOMBRE DEL PRODUCTO</label>
                <input
                  id="np-nombre"
                  type="text"
                  className="form-control"
                  value={form.nombre}
                  onChange={cambiar("nombre")}
                  required
                />
              </div>

              {/* Descripción + texto de ayuda */}
              <div className="mb-3">
                <label className="np-label" htmlFor="np-desc">DESCRIPCIÓN</label>
                <textarea
                  id="np-desc"
                  className="form-control np-textarea"
                  maxLength={MAX_DESCRIPCION}
                  value={form.descripcion}
                  onChange={cambiar("descripcion")}
                />
                <div className="np-ayuda">
                  Menciona los ingredientes y el tamaño. Máximo {MAX_DESCRIPCION} caracteres.
                </div>
              </div>

              {/* Fila: Categoría + Precio */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="np-label" htmlFor="np-cat">CATEGORÍA</label>
                  <select
                    id="np-cat"
                    className="form-select"
                    value={form.categoria}
                    onChange={cambiar("categoria")}
                  >
                    {categorias.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {!cargandoCategorias && categorias.length === 0 && (
                    <div className="np-ayuda text-danger">
                      Primero crea una categoría en «Mi carta».
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6">
                  <label className="np-label" htmlFor="np-precio">PRECIO</label>
                  <div className="input-group">
                    <span className="input-group-text np-prefijo">S/</span>
                    <input
                      id="np-precio"
                      type="number"
                      step="0.10"
                      className={`form-control np-precio ${precioInvalido ? "is-invalid" : ""}`}
                      value={form.precio}
                      onChange={cambiar("precio")}
                      required
                    />
                  </div>
                  <div className={precioInvalido ? "np-ayuda text-danger" : "np-ayuda"}>
                    Entre S/ {PRECIO_MIN.toFixed(2)} y S/ {PRECIO_MAX.toFixed(2)}.
                  </div>
                </div>
              </div>

              {/* Fila: Tiempo de preparación + Disponibilidad */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="np-label" htmlFor="np-tiempo">TIEMPO DE PREPARACIÓN</label>
                  <div className="input-group">
                    <input
                      id="np-tiempo"
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      placeholder="Ej. 5"
                      value={form.tiempo}
                      onChange={cambiar("tiempo")}
                    />
                    <span className="input-group-text np-prefijo">min</span>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="np-label" htmlFor="np-disp">DISPONIBILIDAD</label>
                  <select
                    id="np-disp"
                    className="form-select"
                    value={form.disponibilidad}
                    onChange={cambiar("disponibilidad")}
                  >
                    {DISPONIBILIDAD.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fotografía: miniatura 1:1 + botón "Cambiar fotografía" */}
              <div className="mb-4">
                <span className="np-label d-block">FOTOGRAFÍA DEL PRODUCTO</span>
                <div className="d-flex align-items-center gap-3">
                  {/* Miniatura cuadrada (placeholder con rayas o foto elegida) */}
                  <div className="np-placeholder np-miniatura flex-shrink-0">
                    {foto ? <img src={foto} alt="Foto del producto" /> : <span>foto 1:1</span>}
                  </div>
                  <div className="flex-grow-1">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm np-btn-foto"
                      onClick={() => inputFotoRef.current?.click()}
                    >
                      {foto ? 'Cambiar fotografía' : 'Subir fotografía'}
                    </button>
                    {foto && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger"
                        onClick={() => { setFoto(null); setArchivoFoto(null); setQuitarFoto(true); }}
                      >
                        Quitar
                      </button>
                    )}
                    {/* Input real de archivo (oculto): lo abre el botón de arriba */}
                    <input
                      ref={inputFotoRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="d-none"
                      onChange={elegirFoto}
                    />
                    <div className="np-ayuda">
                      PNG, JPG o WEBP de hasta 3 MB. Mejor cuadrada (1:1).
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción: Cancelar + Guardar */}
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light border np-btn" onClick={cancelar}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-danger np-btn"
                  disabled={guardando || categorias.length === 0}
                >
                  {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Guardar producto"}
                </button>
              </div>
            </div>

            {/* ======== 3.2 COLUMNA DERECHA: VISTA PREVIA DEL COMENSAL ======== */}
            <aside className="col-12 col-lg-4">
              <span className="np-label d-block">VISTA PREVIA DEL COMENSAL</span>

              {/* Tarjeta de producto tal como la verá el cliente */}
              <div className="card np-preview">
                <div className="np-placeholder np-preview__foto">
                  {foto ? <img src={foto} alt="" /> : <span>foto 1:1</span>}
                </div>
                <div className="p-3">
                  <h2 className="np-preview__nombre mb-1">{form.nombre || "Nombre del producto"}</h2>
                  <p className="np-preview__desc mb-3">
                    {form.descripcion || "La descripción aparecerá aquí."}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="np-preview__precio">
                      S/ {isNaN(precioNumero) ? "0.00" : precioNumero.toFixed(2)}
                    </strong>
                    <button type="button" className="btn btn-danger btn-sm px-3" tabIndex={-1}>
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              <p className="np-ayuda mt-2">Así se verá la tarjeta en la carta del local.</p>
            </aside>
          </div>
        </div>
      </form>
    </div>
  );
}