// src/pages/PagesOwner/VentasProducto/VentasProducto.jsx

import { useMemo, useState } from 'react'
import '../OwnerUI.css'
import './VentasProducto.css'

const LOCALES = [
  { id: 'cafeteria',   nombre: 'Cafetería Central' },
  { id: 'menu',        nombre: 'Menú Universitario N' },
  { id: 'sangucheria', nombre: 'Sanguchería del pabellón E' },
  { id: 'biblioteca',  nombre: 'Café de Biblioteca' },
  { id: 'jugueria',    nombre: 'Juguería La Fuente' },
]

const CATEGORIAS = ['Desayunos', 'Almuerzos', 'Sándwiches', 'Bebidas', 'Postres']

const FRANJAS = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00']

// Cómo se reparte cada categoría a lo largo de las franjas
const PERFIL = {
  Desayunos:  [0.45, 0.35, 0.10, 0.03, 0.04, 0.03],
  Almuerzos:  [0.00, 0.05, 0.25, 0.60, 0.08, 0.02],
  Sándwiches: [0.05, 0.15, 0.20, 0.30, 0.18, 0.12],
  Bebidas:    [0.12, 0.14, 0.20, 0.24, 0.16, 0.14],
  Postres:    [0.00, 0.10, 0.20, 0.30, 0.25, 0.15],
}

// u = unidades vendidas en el periodo
const PRODUCTOS = [
  { n: 'Menú ejecutivo',                  cat: 'Almuerzos',  local: 'menu',        precio: 14.0, u: 312 },
  { n: 'Lomo saltado',                    cat: 'Almuerzos',  local: 'cafeteria',   precio: 18.0, u: 96 },
  { n: 'Ají de gallina',                  cat: 'Almuerzos',  local: 'menu',        precio: 15.0, u: 74 },
  { n: 'Ensalada César',                  cat: 'Almuerzos',  local: 'cafeteria',   precio: 12.0, u: 0 },
  { n: 'Sándwich de pollo deshilachado',  cat: 'Sándwiches', local: 'sangucheria', precio: 9.5,  u: 248 },
  { n: 'Triple de palta',                 cat: 'Sándwiches', local: 'sangucheria', precio: 8.0,  u: 121 },
  { n: 'Empanada de carne',               cat: 'Sándwiches', local: 'cafeteria',   precio: 5.0,  u: 164 },
  { n: 'Café pasado',                     cat: 'Bebidas',    local: 'biblioteca',  precio: 3.5,  u: 402 },
  { n: 'Jugo surtido',                    cat: 'Bebidas',    local: 'jugueria',    precio: 6.5,  u: 186 },
  { n: 'Chicha morada',                   cat: 'Bebidas',    local: 'cafeteria',   precio: 4.5,  u: 142 },
  { n: 'Limonada frozen',                 cat: 'Bebidas',    local: 'jugueria',    precio: 7.0,  u: 88 },
  { n: 'Infusión de manzanilla',          cat: 'Bebidas',    local: 'biblioteca',  precio: 3.0,  u: 0 },
  { n: 'Alfajor de maicena',              cat: 'Postres',    local: 'biblioteca',  precio: 3.5,  u: 2 },
  { n: 'Keke de zanahoria',               cat: 'Postres',    local: 'biblioteca',  precio: 4.0,  u: 67 },
  { n: 'Gelatina',                        cat: 'Postres',    local: 'menu',        precio: 2.5,  u: 45 },
  { n: 'Pan con huevo',                   cat: 'Desayunos',  local: 'cafeteria',   precio: 6.0,  u: 133 },
  { n: 'Pan con chicharrón',              cat: 'Desayunos',  local: 'cafeteria',   precio: 9.0,  u: 58 },
  { n: 'Tostadas con mermelada',          cat: 'Desayunos',  local: 'biblioteca',  precio: 5.0,  u: 0 },
]

const soles = (n) =>
  `S/ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const entero = (n) => n.toLocaleString('en-US')
const dos = (n) => String(n).padStart(2, '0')

export default function VentasProducto() {
  const [local, setLocal] = useState('todos')
  const [categoria, setCategoria] = useState('todas')

  const datos = useMemo(() => {
    const filtrados = PRODUCTOS.filter(
      (p) => (local === 'todos' || p.local === local) && (categoria === 'todas' || p.cat === categoria)
    )

    const franjas = FRANJAS.map((_, i) =>
      filtrados.reduce((s, p) => s + Math.round(p.u * PERFIL[p.cat][i]), 0)
    )
    const totalPedidos = franjas.reduce((a, b) => a + b, 0)
    const maxFranja = Math.max(...franjas, 0)
    const idxPico = maxFranja ? franjas.indexOf(maxFranja) : -1

    const masVendidos = filtrados
      .filter((p) => p.u > 2)
      .sort((a, b) => b.u - a.u)
      .slice(0, 6)

    const sinMovimiento = filtrados
      .filter((p) => p.u <= 2)
      .sort((a, b) => a.u - b.u)

    return { franjas, totalPedidos, maxFranja, idxPico, masVendidos, sinMovimiento }
  }, [local, categoria])

  const { franjas, totalPedidos, maxFranja, idxPico, masVendidos, sinMovimiento } = datos

  let notaFranja = 'No hay pedidos para este filtro.'
  if (idxPico >= 0) {
    const hora = parseInt(FRANJAS[idxPico], 10)
    const pct = Math.round((maxFranja / totalPedidos) * 100)
    notaFranja = `La franja de ${FRANJAS[idxPico]} concentra el ${pct} % de los pedidos del periodo. Sugerencia: reforzar la preparación entre ${dos(hora - 1)}:30 y ${dos(hora + 1)}:00.`
  }

  return (
    <section className="owner-page">
      <p className="owner-page__crumbs">Métricas › Ventas por producto y franja</p>

      <div className="owner-page__head">
        <div>
          <h1 className="owner-page__title">Ventas por producto y franja</h1>
          <p className="owner-page__sub">
            01/09/2026 al 15/09/2026 · {entero(totalPedidos)} pedidos
          </p>
        </div>

        <div className="owner-page__actions">
          <label className="owner-select">
            <select value={local} onChange={(e) => setLocal(e.target.value)} aria-label="Local">
              <option value="todos">Local: todos</option>
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>Local: {l.nombre}</option>
              ))}
            </select>
          </label>

          <label className="owner-select">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría">
              <option value="todas">Categoría: todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>Categoría: {c}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="vp-grid">
        {/* Franjas horarias */}
        <article className="owner-card">
          <h2 className="owner-card__title">Pedidos por franja horaria</h2>

          <ul className="vp-franjas">
            {FRANJAS.map((h, i) => (
              <li key={h} className="vp-franjas__fila">
                <span className="vp-franjas__hora">{h}</span>
                <div className="vp-franjas__pista">
                  <div
                    className={`vp-franjas__barra ${i === idxPico ? 'is-pico' : ''}`}
                    style={{ width: `${maxFranja ? (franjas[i] / maxFranja) * 100 : 0}%` }}
                  />
                </div>
                <strong className="vp-franjas__valor">{franjas[i]}</strong>
              </li>
            ))}
          </ul>

          <p className="owner-card__note">{notaFranja}</p>
        </article>

        {/* Más vendidos */}
        <article className="owner-card">
          <h2 className="owner-card__title">Productos más vendidos</h2>

          {masVendidos.length === 0 ? (
            <p className="owner-vacio">No hay productos con ventas para este filtro.</p>
          ) : (
            <table className="vp-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="num">Unid.</th>
                  <th className="num">Vendido</th>
                </tr>
              </thead>
              <tbody>
                {masVendidos.map((p) => (
                  <tr key={p.n}>
                    <td>{p.n}</td>
                    <td className="num">{p.u}</td>
                    <td className="num"><strong>{soles(p.u * p.precio)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        {/* Sin movimiento */}
        <article className="owner-card">
          <h2 className="owner-card__title">Sin movimiento en el periodo</h2>

          {sinMovimiento.length === 0 ? (
            <p className="owner-vacio">Todos los productos tuvieron ventas.</p>
          ) : (
            <>
              <ul className="vp-sin">
                {sinMovimiento.map((p) => (
                  <li key={p.n}>
                    <span>{p.n}</span>
                    <span>{p.u}</span>
                  </li>
                ))}
              </ul>
              <p className="owner-card__note">
                Sugerencia para el local: revisar precio, fotografía o disponibilidad de estos productos, o retirarlos de la carta.
              </p>
            </>
          )}
        </article>
      </div>
    </section>
  )
}
