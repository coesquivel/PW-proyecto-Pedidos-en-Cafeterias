import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Micarta.css';

const Micarta = () => {
  // Lista de Categorías
  const categoriesList = [
    { id: 'desayunos', name: 'Desayunos' },
    { id: 'sandwiches', name: 'Sándwiches' },
    { id: 'menu_dia', name: 'Menú del día' },
    { id: 'jugos', name: 'Jugos y bebidas' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'postres', name: 'Postres' },
    { id: 'cafe', name: 'Café' },
  ];

  // Categoría activa por defecto
  const [activeCategory, setActiveCategory] = useState('desayunos');

  // Filtros de búsqueda y disponibilidad
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('todas');

  // Base de datos de productos por categoría
  const [productsData, setProductsData] = useState({
    desayunos: [
      {
        id: 1,
        name: 'Sándwich de pollo deshilachado',
        desc: 'Pan francés, pollo deshilachado y salsa criolla · 8 min · 3 grupos de opciones',
        status: 'Disponible',
        price: '9.50',
      },
      {
        id: 2,
        name: 'Pan con palta',
        desc: 'Pan ciabatta, palta fuerte y tomate · 6 min · 1 grupo de opciones',
        status: 'Disponible',
        price: '8.50',
      },
      {
        id: 3,
        name: 'Ensalada de frutas',
        desc: 'Papaya, piña, plátano y miel · 5 min',
        status: 'Agotado',
        price: '7.00',
      },
      {
        id: 4,
        name: 'Tostadas con mermelada',
        desc: 'Pan de molde, mermelada de fresa y mantequilla · 4 min',
        status: 'Disponible',
        price: '5.50',
      },
      {
        id: 5,
        name: 'Café pasado',
        desc: 'Café de Chanchamayo, taza de 8 oz · 3 min · 2 grupos de opciones',
        status: 'Disponible',
        price: '3.50',
      },
    ],
    sandwiches: [
      {
        id: 6,
        name: 'Sándwich Club',
        desc: 'Pan de molde, jamón, queso, huevo y pollo · 10 min',
        status: 'Disponible',
        price: '12.00',
      },
      {
        id: 7,
        name: 'Triple de Huevo y Palta',
        desc: 'Pan de molde, huevo sancochado y palta · 5 min',
        status: 'Disponible',
        price: '7.50',
      },
      {
        id: 8,
        name: 'Sándwich de Jamón y Queso',
        desc: 'Pan ciabatta tostado con mantequilla · 4 min',
        status: 'Agotado',
        price: '8.00',
      },
      {
        id: 9,
        name: 'Mixto Especial',
        desc: 'Pan de molde con doble queso derretido · 6 min',
        status: 'Disponible',
        price: '8.50',
      },
    ],
    menu_dia: [
      {
        id: 10,
        name: 'Menú Ejecutivo',
        desc: 'Entrada + Segundo + Refresco de chicha · 15 min',
        status: 'Disponible',
        price: '15.00',
      },
      {
        id: 11,
        name: 'Menú Económico Universitario',
        desc: 'Plato de fondo + Sopa del día · 10 min',
        status: 'Disponible',
        price: '12.00',
      },
    ],
    jugos: [
      {
        id: 12,
        name: 'Jugo de Fresa con Leche',
        desc: 'Fresa fresca, leche entera · 5 min',
        status: 'Disponible',
        price: '6.50',
      },
      {
        id: 13,
        name: 'Jugo Surtido',
        desc: 'Papaya, piña, plátano y manzana · 5 min',
        status: 'Disponible',
        price: '6.00',
      },
      {
        id: 14,
        name: 'Jugo de Papaya',
        desc: 'Papaya endulzada con miel o azúcar · 4 min',
        status: 'Agotado',
        price: '5.50',
      },
      {
        id: 15,
        name: 'Limonada Frozen 16 oz',
        desc: 'Limón recién exprimido con hielo frappé · 3 min',
        status: 'Disponible',
        price: '5.00',
      },
    ],
    snacks: [
      {
        id: 16,
        name: 'Galletas de Avena',
        desc: 'Paquete de 2 unidades artesanal · 1 min',
        status: 'Disponible',
        price: '3.00',
      },
      {
        id: 17,
        name: 'Barra de Cereal y Frutos Secos',
        desc: 'Avena, miel, almendras y pasas · 1 min',
        status: 'Disponible',
        price: '3.50',
      },
    ],
    postres: [
      {
        id: 18,
        name: 'Pie de Limón',
        desc: 'Porción individual de la casa · 2 min',
        status: 'Disponible',
        price: '6.00',
      },
    ],
    cafe: [],
  });

  // Nombre de la categoría activa
  const currentCategoryObj = categoriesList.find((c) => c.id === activeCategory);
  const currentCategoryName = currentCategoryObj ? currentCategoryObj.name : '';

  // Filtrado dinámico por texto y por disponibilidad
  const currentProducts = (productsData[activeCategory] || []).filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesAvailability =
      availabilityFilter === 'todas' || product.status === availabilityFilter;

    return matchesSearch && matchesAvailability;
  });

  // Totales globales
  const totalProductsCount = Object.values(productsData).reduce(
    (acc, list) => acc + list.length,
    0
  );
  const totalAgotadosCount = Object.values(productsData)
    .flat()
    .filter((p) => p.status === 'Agotado').length;

  // Manejadores de eventos
  const handleNuevaCategoria = () => alert('Acción: Nueva categoría');
  const handleNuevoProducto = () => alert('Acción: Nuevo producto');
  const handleEditarProducto = (id) => alert(`Editar producto con ID: ${id}`);
  const handleQuitarProducto = (id) => alert(`Quitar producto con ID: ${id}`);

  return (
    <div className="micarta-container container-fluid p-4">
      {/* Miga de pan / Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb micarta-breadcrumb mb-1">
          <li className="breadcrumb-item"><a href="#carta">Carta</a></li>
          <li className="breadcrumb-item"><a href="#micarta">Mi carta</a></li>
          <li className="breadcrumb-item active" aria-current="page">
            {currentCategoryName}
          </li>
        </ol>
      </nav>

      {/* Encabezado y botones superiores */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Mi carta</h1>
          <p className="text-muted small mb-0">
            {totalProductsCount} productos en {categoriesList.length} categorías · {totalAgotadosCount} agotados hoy
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary custom-btn-category shadow-sm fw-semibold"
            onClick={handleNuevaCategoria}
          >
            Nueva categoría
          </button>
          <button
            className="btn custom-btn-product shadow-sm fw-semibold text-white"
            onClick={handleNuevoProducto}
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
              {categoriesList.map((category) => {
                const count = (productsData[category.id] || []).length;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-3 border-0 ${
                      isActive ? 'active-category' : ''
                    }`}
                    onClick={() => setActiveCategory(category.id)}
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
                    <div className="product-img-placeholder flex-shrink-0"></div>

                    <div className="flex-grow-1 min-w-0">
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
                          className="btn btn-link p-0 action-link text-decoration-none"
                          onClick={() => handleEditarProducto(product.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-link p-0 action-link text-decoration-none ms-1"
                          onClick={() => handleQuitarProducto(product.id)}
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
              Mostrando los {currentProducts.length} productos de «{currentCategoryName}»
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
        </div>
      </div>
    </div>
  );
};

export default Micarta;