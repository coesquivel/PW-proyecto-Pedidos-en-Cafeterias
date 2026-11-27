import sequelize from '../../configs/database.js';

/**
 * Pedidos, rechazados, entregados y total vendido (solo entregados) por día y por local.
 * Se agrupa por la fecha de recojo, igual que el resumen del día de cada local.
 */
const findDailySales = async (fromDate, toDate) => {
  return await sequelize.query(
    `SELECT o.pickup_date::text AS date,
            o.store_id,
            COUNT(*)::int AS orders,
            COUNT(*) FILTER (WHERE s.name = 'rechazado')::int AS cancelled,
            COUNT(*) FILTER (WHERE s.name = 'entregado')::int AS delivered,
            COALESCE(SUM(o.total_amount) FILTER (WHERE s.name = 'entregado'), 0)::float AS total
       FROM orders o
       JOIN order_statuses s ON s.id = o.status_id
      WHERE o.pickup_date BETWEEN :fromDate AND :toDate
      GROUP BY o.pickup_date, o.store_id
      ORDER BY o.pickup_date`,
    { replacements: { fromDate, toDate }, type: 'SELECT' }
  );
};

/**
 * Calificación promedio y cantidad de calificaciones por producto desde una fecha
 */
const findProductRatings = async (fromDate) => {
  return await sequelize.query(
    `SELECT p.id, p.name, p.picture_url, p.store_id,
            st.commercial_name AS store_name, st.campus,
            c.name AS category,
            ROUND(AVG(pr.rating)::numeric, 1)::float AS rating,
            COUNT(*)::int AS count
       FROM product_reviews pr
       JOIN order_reviews orv ON orv.id = pr.order_review_id
       JOIN products p ON p.id = pr.product_id
       JOIN stores st ON st.id = p.store_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE orv.created_at >= :fromDate AND st.operative_status = 'activo'
      GROUP BY p.id, st.id, c.id
      ORDER BY rating DESC, count DESC`,
    { replacements: { fromDate }, type: 'SELECT' }
  );
};

/**
 * Calificación promedio, cantidad y tiempo de preparación promedio por local desde una fecha
 */
const findStoreRatings = async (fromDate) => {
  return await sequelize.query(
    `SELECT st.id, st.commercial_name AS name, st.logo_url, st.campus,
            ROUND(AVG(orv.store_rating)::numeric, 1)::float AS rating,
            COUNT(*)::int AS count,
            (SELECT ROUND(AVG(p.preparation_time))::int FROM products p
              WHERE p.store_id = st.id AND p.preparation_time IS NOT NULL) AS wait
       FROM order_reviews orv
       JOIN stores st ON st.id = orv.store_id
      WHERE orv.created_at >= :fromDate AND st.operative_status = 'activo'
      GROUP BY st.id
      ORDER BY rating DESC, count DESC`,
    { replacements: { fromDate }, type: 'SELECT' }
  );
};

/**
 * Productos de los locales activos (con categoría), para listar también los que no se vendieron
 */
const findCatalog = async () => {
  return await sequelize.query(
    `SELECT p.id, p.name, p.price::float AS price, p.store_id, c.name AS category
       FROM products p
       JOIN stores st ON st.id = p.store_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE st.operative_status = 'activo'
      ORDER BY p.id`,
    { type: 'SELECT' }
  );
};

/**
 * Unidades y monto vendidos por producto y hora de recojo (sin pedidos rechazados)
 */
const findProductSales = async (fromDate, toDate) => {
  return await sequelize.query(
    `SELECT oi.product_id,
            EXTRACT(HOUR FROM o.pickup_time)::int AS hour,
            SUM(oi.quantity)::int AS units,
            SUM(oi.subtotal)::float AS amount
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN order_statuses s ON s.id = o.status_id
      WHERE o.pickup_date BETWEEN :fromDate AND :toDate
        AND s.name <> 'rechazado'
        AND oi.product_id IS NOT NULL
      GROUP BY oi.product_id, EXTRACT(HOUR FROM o.pickup_time)
      ORDER BY oi.product_id`,
    { replacements: { fromDate, toDate }, type: 'SELECT' }
  );
};

const ownerStatsRepository = {
  findCatalog,
  findProductSales,
  findProductRatings,
  findStoreRatings,
  findDailySales
};

export default ownerStatsRepository;
