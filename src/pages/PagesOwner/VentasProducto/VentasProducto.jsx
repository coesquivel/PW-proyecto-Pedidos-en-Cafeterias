// src/pages/PagesOwner/VentasProducto/VentasProducto.jsx

import { useEffect, useMemo, useState } from 'react'
import '../OwnerUI.css'
import './VentasProducto.css'
import { obtenerVentasPorProducto } from '../../../api/owner'
import { mensajeDeError } from '../../../api/carta'

const DIAS = 30

// Franjas de dos horas; las ventas de otras horas se suman a la primera o a la última
const FRANJAS = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00']

const indiceFranja = (hora) => Math.min(FRANJAS.length - 1, Math.max(0, Math.floor((hora - 7) / 2)))

const fechaCorta = (f) => f.split('-').reverse().join('/')

const soles = (n) =>
  `S/ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const entero = (n) => n.toLocaleString('en-US')
const dos = (n) => String(n).padStart(2, '0')

export default function VentasProducto() {
  const [local, setLocal] = useState('todos')
  const [categoria, setCategoria] = useState('todas')
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerVentasPorProducto(DIAS)
      .then(setApi)
      .catch((e) => setError(mensajeDeError(e, 'No se pudieron cargar las ventas.')))
  }, [])

  const LOCALES = useMemo(() => (api ? api.stores.map((l) => ({ id: String(l.id), nombre: l.name })) : []), [api])
  const CATEGORIAS = useMemo(
    () => (api ? [...new Set(api.products.map((p) => p.category || 'Sin categoría'))].sort() : []),
    [api]
  )

  const datos = useMemo(() => {
    const vacio = { franjas: FRANJAS.map(() => 0), totalPedidos: 0, maxFranja: 0, idxPico: -1, masVendidos: [], sinMovimiento: [] }
    if (!api) return vacio

    // Unidades por producto y por franja
    const porProducto = {}
    api.sales.forEach((v) => {
      const f = (porProducto[v.product_id] ||= { u: 0, monto: 0, franjas: FRANJAS.map(() => 0) })
      f.u += v.units
      f.monto += v.amount
      f.franjas[indiceFranja(v.hour)] += v.units
    })

    const filtrados = api.products
      .map((p) => ({
        n: p.name,
        cat: p.category || 'Sin categoría',
        local: String(p.store_id),
        u: porProducto[p.id]?.u ?? 0,
        monto: porProducto[p.id]?.monto ?? 0,
        franjas: porProducto[p.id]?.franjas ?? FRANJAS.map(() => 0),
      }))
      .filter((p) => (local === 'todos' || p.local === local) && (categoria === 'todas' || p.cat === categoria))

    const franjas = FRANJAS.map((_, i) => filtrados.reduce((s, p) => s + p.franjas[i], 0))
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
  }, [api, local, categoria])

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
            {api ? `${fechaCorta(api.from)} al ${fechaCorta(api.to)}` : 'Cargando…'} · {entero(totalPedidos)} unidades vendidas
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

      {error && <p className="owner-vacio">{error}</p>}

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
                  <tr key={`${p.local}-${p.n}`}>
                    <td>{p.n}</td>
                    <td className="num">{p.u}</td>
                    <td className="num"><strong>{soles(p.monto)}</strong></td>
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
                  <li key={`${p.local}-${p.n}`}>
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
