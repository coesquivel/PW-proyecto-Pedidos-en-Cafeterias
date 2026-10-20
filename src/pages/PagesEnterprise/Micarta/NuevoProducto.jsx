import { useState, useRef, useEffect } from "react";
import "./NuevoProducto.css";
import { useNavigate, useLocation } from "react-router-dom";
// Bootstrap 5 debe estar cargado una sola vez en tu app (ej. en main.jsx / index.js):
//   import "bootstrap/dist/css/bootstrap.min.css";

/* Opciones de los selects (luego puedes traerlas de tu API) */
const CATEGORIAS = [
  "Desayunos",
  "Sándwiches",
  "Menú del día",
  "Jugos y bebidas",
  "Snacks",
  "Postres",
  "Café",
];
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
      nombre: "Jugo surtido",
      descripcion: "Papaya, plátano y naranja licuados al momento. Vaso de 16 oz.",
      categoria: location.state?.categoria ?? "Jugos y bebidas",
      precio: "6.50",
      tiempo: "5 minutos",
      disponibilidad: "Disponible",
    }
  );
  const [foto, setFoto] = useState(null); // URL temporal de la foto elegida
  const inputFotoRef = useRef(null);

  // Libera la URL temporal cuando cambia la foto o se cierra la vista
  useEffect(() => () => foto && URL.revokeObjectURL(foto), [foto]);

  const cambiar = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const precioNumero = parseFloat(form.precio);
  const precioInvalido =
    form.precio !== "" &&
    (isNaN(precioNumero) || precioNumero < PRECIO_MIN || precioNumero > PRECIO_MAX);

  const elegirFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (archivo) setFoto(URL.createObjectURL(archivo));
  };

  const guardar = (e) => {
    e.preventDefault();
    if (precioInvalido) return;
    onGuardar?.({ ...form, precio: precioNumero, foto });
    navigate("/enterprises/Micarta"); // redirige a Mi carta
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
                    {CATEGORIAS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
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
                  <input
                    id="np-tiempo"
                    type="text"
                    className="form-control"
                    value={form.tiempo}
                    onChange={cambiar("tiempo")}
                  />
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
                      Cambiar fotografía
                    </button>
                    {/* Input real de archivo (oculto): lo abre el botón de arriba */}
                    <input
                      ref={inputFotoRef}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={elegirFoto}
                    />
                    <div className="np-ayuda">
                      Cuadrada, mínimo 800 × 800 px. La imagen manda en la tarjeta.
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción: Cancelar + Guardar */}
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light border np-btn" onClick={cancelar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger np-btn">
                  {esEdicion ? "Guardar cambios" : "Guardar producto"}
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