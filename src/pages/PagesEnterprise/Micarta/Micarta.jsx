import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Micarta.css';
import {
  obtenerCategorias,
  obtenerProductos,
  crearCategoria,
  eliminarCategoria,
  eliminarProducto,
  productoACarta,
  tiempoAFormulario,
  mensajeDeError,
} from '../../../api/carta';

/* ==========================================================================
   Utilidades
   ========================================================================== */

// Genera un id legible a partir del nombre: "Cafés fríos" -> "cafes_frios"
const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'categoria';

/* ==========================================================================
   Ventana emergente: administrar categorías
   Trabaja sobre una copia (draft). Los cambios solo se aplican a "Mi carta"
   cuando se pulsa "Guardar cambios"; "Cancelar" descarta todo.
   ========================================================================== */
const CategoriasModal = ({ categories, productsData, onSave, onCancel }) => {
  const [draft, setDraft] = useState(categories);

  // 'list' = vista inicial · 'add' = formulario de nueva categoría · 'delete' = selección para eliminar
  const [mode, setMode] = useState('list');

  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const countOf = (id) => (productsData[id] || []).length;

  const hasChanges =
    draft.length !== categories.length ||
    draft.some((c, i) => c.id !== categories[i].id);

  const volverALista = () => {
    setMode('list');
    setNewName('');
    setError('');
    setSelectedIds([]);
  };

  // Escape: si hay un formulario abierto lo cierra; si no, cierra la ventana
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (mode !== 'list') {
        setMode('list');
        setNewName('');
        setError('');
        setSelectedIds([]);
      } else {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, onCancel]);

  /* ---------- Agregar ---------- */
  const handleGuardarNueva = () => {
    const name = newName.trim().replace(/\s+/g, ' ');

    if (!name) {
      setError('Escribe un nombre para la categoría.');
      return;
    }
    if (draft.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError('Ya existe una categoría con ese nombre.');
      return;
    }

    // El sufijo evita reutilizar el id de una categoría eliminada en esta misma ventana
    const id = `${slugify(name)}_${Date.now().toString(36)}`;
    setDraft((prev) => [...prev, { id, name }]);
    volverALista();
  };

  /* ---------- Eliminar ---------- */
  const toggleSeleccion = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedProductsCount = selectedIds.reduce(
    (acc, id) => acc + countOf(id),
    0
  );

  const handleConfirmarEliminar = () => {
    setDraft((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    volverALista();
  };

  return (
    <div className="cat-modal-backdrop">
      <div
        className="cat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cat-modal-title"
      >
        {/* Encabezado */}
        <div className="cat-modal__header">
          <div>
            <h2 id="cat-modal-title" className="cat-modal__title">
              Categorías
            </h2>
            <p className="cat-modal__subtitle">
              {draft.length} {draft.length === 1 ? 'categoría' : 'categorías'} en tu carta
            </p>
          </div>
          <button
            type="button"
            className="cat-modal__close"
            aria-label="Cerrar sin guardar"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        {/* Cuerpo */}
        <div className="cat-modal__body">
          {mode === 'delete' && (
            <p className="cat-modal__hint">
              Marca las categorías que quieres eliminar.
            </p>
          )}

          {/* Lista de categorías */}
          {draft.length === 0 ? (
            <div className="cat-modal__empty">
              No hay categorías. Agrega la primera con «Agregar categoría».
            </div>
          ) : (
            <ul className="cat-modal__list">
              {draft.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                const count = countOf(category.id);

                if (mode === 'delete') {
                  return (
                    <li key={category.id}>
                      <label
                        className={`cat-modal__item cat-modal__item--selectable ${
                          isSelected ? 'is-selected' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="cat-modal__check"
                          checked={isSelected}
                          onChange={() => toggleSeleccion(category.id)}
                        />
                        <span className="cat-modal__name">{category.name}</span>
                        <span className="cat-modal__count">{count}</span>
                      </label>
                    </li>
                  );
                }

                return (
                  <li key={category.id} className="cat-modal__item">
                    <span className="cat-modal__name">{category.name}</span>
                    <span className="cat-modal__count">{count}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Acciones: vista inicial */}
          {mode === 'list' && (
            <div className="cat-modal__actions">
              <button
                type="button"
                className="btn custom-btn-product text-white fw-semibold"
                onClick={() => setMode('add')}
              >
                Agregar categoría
              </button>
              <button
                type="button"
                className="btn cat-btn-danger fw-semibold"
                onClick={() => setMode('delete')}
                disabled={draft.length === 0}
              >
                Eliminar
              </button>
            </div>
          )}

          {/* Formulario: agregar */}
          {mode === 'add' && (
            <div className="cat-modal__panel">
              <label htmlFor="cat-new-name" className="cat-modal__label">
                Nombre de la categoría
              </label>
              <input
                id="cat-new-name"
                type="text"
                className={`form-control cat-modal__input ${error ? 'is-invalid' : ''}`}
                placeholder="Ej. Ensaladas"
                maxLength={30}
                autoFocus
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGuardarNueva();
                }}
              />
              {error && <div className="cat-modal__error">{error}</div>}

              <div className="cat-modal__panel-actions">
                <button
                  type="button"
                  className="btn custom-btn-product text-white fw-semibold"
                  onClick={handleGuardarNueva}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary custom-btn-category fw-semibold"
                  onClick={volverALista}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Acciones: eliminar */}
          {mode === 'delete' && (
            <div className="cat-modal__panel">
              {selectedIds.length > 0 && selectedProductsCount > 0 && (
                <p className="cat-modal__warning">
                  Se quitarán también {selectedProductsCount}{' '}
                  {selectedProductsCount === 1 ? 'producto' : 'productos'} de la carta.
                </p>
              )}
              <div className="cat-modal__panel-actions">
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    className="btn cat-btn-danger cat-btn-danger--solid fw-semibold"
                    onClick={handleConfirmarEliminar}
                  >
                    Eliminar ({selectedIds.length})
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-secondary custom-btn-category fw-semibold"
                  onClick={volverALista}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="cat-modal__footer">
          <span className="cat-modal__unsaved">
            {hasChanges ? 'Tienes cambios sin guardar' : ''}
          </span>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary custom-btn-category fw-semibold"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn custom-btn-product text-white fw-semibold"
              onClick={() => onSave(draft)}
              disabled={mode !== 'list'}
              title={
                mode !== 'list'
                  ? 'Termina o cancela la acción en curso para guardar'
                  : undefined
              }
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Página: Mi carta
   ========================================================================== */
const Micarta = () => {
  const navigate = useNavigate();

  // Categorías y productos reales del local (vienen de la base de datos)
  const [categories, setCategories] = useState([]);
  const [productsData, setProductsData] = useState({});
  const [cargando, setCargando] = useState(true);
  const [errorCarta, setErrorCarta] = useState('');

  // Ventana emergente de categorías
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Categoría activa (se define al cargar la carta)
  const [activeCategory, setActiveCategory] = useState(null);

  // Filtros de búsqueda y disponibilidad
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('todas');

  // Lee de la API las categorías y los productos, y los agrupa por categoría
  const cargarCarta = async () => {
    try {
      const [cats, prods] = await Promise.all([obtenerCategorias(), obtenerProductos()]);

      const agrupados = {};
      cats.forEach((c) => {
        agrupados[c.id] = [];
      });
      prods.forEach((p) => {
        if (agrupados[p.category_id]) agrupados[p.category_id].push(productoACarta(p));
      });

      setCategories(cats.map((c) => ({ id: c.id, name: c.name })));
      setProductsData(agrupados);
      setActiveCategory((actual) =>
        cats.some((c) => c.id === actual) ? actual : cats.length > 0 ? cats[0].id : null
      );
    } catch (error) {
      setErrorCarta(mensajeDeError(error, 'No se pudo cargar tu carta.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCarta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Producto que se está por quitar (null = ninguna confirmación abierta)
  const [productoAQuitar, setProductoAQuitar] = useState(null);
  const [quitando, setQuitando] = useState(false);

  // Escape cierra la confirmación
  useEffect(() => {
    if (!productoAQuitar) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setProductoAQuitar(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [productoAQuitar]);

  // Nombre de la categoría activa
  const currentCategoryObj = categories.find((c) => c.id === activeCategory);
  const currentCategoryName = currentCategoryObj ? currentCategoryObj.name : '';

  // ¿Se eliminaron todas las categorías?
  const hasNoCategories = categories.length === 0;

  // Filtrado dinámico por texto y por disponibilidad
  const currentProducts = (productsData[activeCategory] || []).filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesAvailability =
      availabilityFilter === 'todas' || product.status === availabilityFilter;

    return matchesSearch && matchesAvailability;
  });

  // Totales globales (solo de las categorías que existen)
  const allProducts = categories.flatMap((c) => productsData[c.id] || []);
  const totalProductsCount = allProducts.length;
  const totalAgotadosCount = allProducts.filter((p) => p.status === 'Agotado').length;

  // ¿La categoría activa no tiene ningún producto? (distinto a "los filtros no encontraron nada")
  const isCategoryEmpty = (productsData[activeCategory] || []).length === 0;

  // Manejadores de eventos
  const handleNuevaCategoria = () => setIsCategoriesModalOpen(true);

  const handleCerrarModalCategorias = () => setIsCategoriesModalOpen(false);

  // Cambia de categoría y limpia los filtros para no arrastrar una búsqueda anterior
  const handleCambiarCategoria = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchTerm('');
    setAvailabilityFilter('todas');
  };

  // Aplica los cambios hechos en la ventana emergente
  const handleGuardarCategorias = async (nuevasCategorias) => {
    setIsCategoriesModalOpen(false);
    setErrorCarta('');

    const idsActuales = new Set(categories.map((c) => c.id));
    const idsNuevos = new Set(nuevasCategorias.map((c) => c.id));
    const eliminadas = categories.filter((c) => !idsNuevos.has(c.id));
    const agregadas = nuevasCategorias.filter((c) => !idsActuales.has(c.id));

    try {
      // Al eliminar una categoría también se quitan sus productos (como avisa la ventana)
      for (const categoria of eliminadas) {
        for (const producto of productsData[categoria.id] || []) {
          await eliminarProducto(producto.id);
        }
        await eliminarCategoria(categoria.id);
      }

      for (const [i, categoria] of agregadas.entries()) {
        await crearCategoria(categoria.name, categories.length + i);
      }
    } catch (error) {
      setErrorCarta(mensajeDeError(error, 'No se pudieron guardar los cambios de categorías.'));
    }

    // Se vuelve a leer la carta para mostrar exactamente lo que quedó guardado
    setSearchTerm('');
    setAvailabilityFilter('todas');
    await cargarCarta();
  };

  // Lleva al formulario en modo edición, con los datos del producto ya cargados
  const handleEditarProducto = (product) => {
    const real = product.raw;

    navigate('/enterprises/NuevoProducto', {
      state: {
        producto: {
          id: product.id,
          nombre: real.name,
          descripcion: real.description ?? '',
          categoria: currentCategoryName,
          precio: product.price,
          tiempo: tiempoAFormulario(real.preparation_time),
          disponibilidad: product.status,
          foto_url: product.picture_url || null,
        },
      },
    });
  };

  // Confirma y elimina el producto de la base de datos
  const handleConfirmarQuitar = async () => {
    if (!productoAQuitar) return;

    setQuitando(true);
    setErrorCarta('');

    try {
      await eliminarProducto(productoAQuitar.id);
      setProductsData((prev) => ({
        ...prev,
        [activeCategory]: prev[activeCategory].filter((p) => p.id !== productoAQuitar.id),
      }));
    } catch (error) {
      setErrorCarta(mensajeDeError(error, 'No se pudo quitar el producto.'));
    }

    setQuitando(false);
    setProductoAQuitar(null);
  };

  if (cargando) {
    return (
      <div className="micarta-container container-fluid p-4 text-muted">
        Cargando tu carta…
      </div>
    );
  }

  return (
    <div className="micarta-container container-fluid p-4">
      {/* Aviso de error (carga, guardado o eliminación) */}
      {errorCarta && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center"
          role="alert"
        >
          <span>{errorCarta}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar aviso"
            onClick={() => setErrorCarta('')}
          ></button>
        </div>
      )}

      {/* Miga de pan / Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb micarta-breadcrumb mb-1">
          <li className="breadcrumb-item"><a href="#carta">Carta</a></li>
          <li className="breadcrumb-item"><a href="#micarta">Mi carta</a></li>
          {currentCategoryName && (
            <li className="breadcrumb-item active" aria-current="page">
              {currentCategoryName}
            </li>
          )}
        </ol>
      </nav>

      {/* Encabezado y botones superiores */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Mi carta</h1>
          <p className="text-muted small mb-0">
            {totalProductsCount} {totalProductsCount === 1 ? 'producto' : 'productos'} en{' '}
            {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'} ·{' '}
            {totalAgotadosCount} {totalAgotadosCount === 1 ? 'agotado' : 'agotados'} hoy
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary custom-btn-category shadow-sm fw-semibold"
            onClick={handleNuevaCategoria}
          >
            Nueva categoría
          </button>
          <button
            type="button"
            className="btn custom-btn-product shadow-sm fw-semibold text-white"
            onClick={() => navigate('/enterprises/NuevoProducto')}
          >
            Nuevo producto
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="row g-4">
        {/* Menú de Categorías (Izquierda) */}
        <div className="col-12 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="list-group list-group-flush micarta-category-list">
              {hasNoCategories && (
                <div className="px-3 py-3 text-muted small">Aún no tienes categorías.</div>
              )}

              {categories.map((category) => {
                const count = (productsData[category.id] || []).length;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-3 border-0 ${
                      isActive ? 'active-category' : ''
                    }`}
                    onClick={() => handleCambiarCategoria(category.id)}
                  >
                    <span className="fw-semibold">{category.name}</span>
                    <span
                      className={`badge rounded-pill ${
                        isActive ? 'badge-active' : 'badge-inactive'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista de Productos (Derecha) */}
        <div className="col-12 col-md-8 col-lg-9">
          {hasNoCategories ? (
            /* SIN CATEGORÍAS */
            <div className="card border-0 shadow-sm micarta-empty">
              <div className="micarta-empty__icon">+</div>
              <h2 className="micarta-empty__title">Tu carta aún no tiene categorías</h2>
              <p className="micarta-empty__text">
                Crea una categoría para empezar a agregar productos.
              </p>
              <button
                type="button"
                className="btn custom-btn-product text-white fw-semibold px-4"
                onClick={handleNuevaCategoria}
              >
                Agregar categoría
              </button>
            </div>
          ) : isCategoryEmpty ? (
            /* ESTADO VACÍO */
            <div className="card border-0 shadow-sm micarta-empty">
              <div className="micarta-empty__icon">+</div>
              <h2 className="micarta-empty__title">
                La categoría «{currentCategoryName}» aún no tiene productos
              </h2>
              <p className="micarta-empty__text">
                Agrega el primero para que aparezca en la carta que ve el comensal.
              </p>
              <button
                type="button"
                className="btn custom-btn-product text-white fw-semibold px-4"
                onClick={() =>
                  navigate('/enterprises/NuevoProducto', {
                    state: { categoria: currentCategoryName },
                  })
                }
              >
                Agregar producto a {currentCategoryName}
              </button>
            </div>
          ) : (
            <>
              {/* Búsqueda y Filtro de Disponibilidad */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-8 col-md-8">
                  <input
                    type="text"
                    className="form-control bg-white border-0 shadow-sm py-2 px-3 search-input"
                    placeholder="Buscar producto en mi carta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-4 col-md-4">
                  <select
                    className="form-select bg-white border-0 shadow-sm py-2 filter-select"
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="todas">Disponibilidad: todas</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Agotado">Agotado</option>
                  </select>
                </div>
              </div>

              {/* Tarjetas de Producto */}
              <div className="d-flex flex-column gap-3 mb-4">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="card border-0 shadow-sm rounded-3 p-3 product-card"
                    >
                      <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-3">
                        <div
                          className="product-img-placeholder flex-shrink-0"
                          style={product.picture_url ? { backgroundImage: `url(${product.picture_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                        ></div>

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <h5 className="fw-bold mb-1 text-dark product-title">
                            {product.name}
                          </h5>
                          <p className="text-muted small mb-0 product-desc">
                            {product.desc}
                          </p>
                        </div>

                        <div className="d-flex align-items-center gap-3 ms-auto flex-wrap justify-content-end">
                          <span
                            className={`badge px-3 py-2 fw-semibold ${
                              product.status === 'Disponible'
                                ? 'badge-status-available'
                                : 'badge-status-out'
                            }`}
                          >
                            {product.status}
                          </span>

                          <div className="fw-bold fs-5 text-dark text-nowrap">
                            S/ {product.price}
                          </div>

                          <div className="d-flex gap-2 align-items-center">
                            <button
                              type="button"
                              className="btn btn-link p-0 action-link text-decoration-none"
                              onClick={() => handleEditarProducto(product)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 action-link text-decoration-none ms-1"
                              onClick={() => setProductoAQuitar(product)}
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 bg-white rounded-3 shadow-sm text-muted">
                    No se encontraron productos con los filtros seleccionados.
                  </div>
                )}
              </div>

              {/* Pie de tabla / Paginación */}
              <div className="d-flex flex-wrap justify-content-between align-items-center text-muted small pt-2">
                <span>
                  Mostrando {currentProducts.length}{' '}
                  {currentProducts.length === 1 ? 'producto' : 'productos'} de «{currentCategoryName}»
                </span>

                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <span className="page-link border-0 text-muted">&lt;</span>
                  </li>
                  <li className="page-item active">
                    <span className="page-link custom-page-active rounded-circle">1</span>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link border-0 text-muted">&gt;</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmación para quitar un producto */}
      {productoAQuitar && (
        <div className="cat-modal-backdrop">
          <div
            className="cat-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="quitar-producto-title"
          >
            <div className="cat-modal__header">
              <div>
                <h2 id="quitar-producto-title" className="cat-modal__title">
                  Quitar producto
                </h2>
                <p className="cat-modal__subtitle">Esta acción no se puede deshacer.</p>
              </div>
              <button
                type="button"
                className="cat-modal__close"
                aria-label="Cancelar"
                onClick={() => setProductoAQuitar(null)}
              >
                ×
              </button>
            </div>

            <div className="cat-modal__body">
              <p className="mb-0">
                ¿Seguro que quieres quitar «{productoAQuitar.name}» de tu carta?
              </p>
            </div>

            <div className="cat-modal__footer">
              <span></span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary custom-btn-category fw-semibold"
                  onClick={() => setProductoAQuitar(null)}
                  disabled={quitando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn cat-btn-danger cat-btn-danger--solid fw-semibold"
                  onClick={handleConfirmarQuitar}
                  disabled={quitando}
                >
                  {quitando ? 'Quitando…' : 'Sí, quitar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ventana emergente de categorías (se monta al abrir, así siempre parte de los datos actuales) */}
      {isCategoriesModalOpen && (
        <CategoriasModal
          categories={categories}
          productsData={productsData}
          onSave={handleGuardarCategorias}
          onCancel={handleCerrarModalCategorias}
        />
      )}
    </div>
  );
};

export default Micarta;