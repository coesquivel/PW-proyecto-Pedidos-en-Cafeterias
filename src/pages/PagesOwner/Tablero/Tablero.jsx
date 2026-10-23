// src/pages/PagesOwner/Tablero/Tablero.jsx

import { useMemo, useState } from 'react'
import '../OwnerUI.css'
import './Tablero.css'

/* ---------- Datos de ejemplo (60 días, 5 locales) ---------- */

const LOCALES = [
  { id: 'cafeteria',   nombre: 'Cafetería Central',          base: 34, ticket: 14.5 },
  { id: 'menu',        nombre: 'Menú Universitario N',       base: 26, ticket: 13.2 },
  { id: 'sangucheria', nombre: 'Sanguchería del pabellón E', base: 19, ticket: 11.8 },
  { id: 'biblioteca',  nombre: 'Café de Biblioteca',         base: 13, ticket: 9.6 },
  { id: 'jugueria',    nombre: 'Juguería La Fuente',         base: 9,  ticket: 8.4 },
]

const RANGOS = [
  { valor: 7,  texto: 'últimos 7 días' },
  { valor: 15, texto: 'últimos 15 días' },
  { valor: 30, texto: 'últimos 30 días' },
]

// domingo … sábado
const FACTOR_DIA = [0.06, 0.85, 1.3, 0.9, 0.95, 1.3, 0.4]
const NOMBRE_DIA = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados']

const ruido = (i, j) => {
  const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// Del 18/07/2026 al 15/09/2026
const DIAS = Array.from({ length: 60 }, (_, i) => {
  const fecha = new Date(Date.UTC(2026, 6, 18 + i))
  const dow = fecha.getUTCDay()
  const porLocal = {}
  LOCALES.forEach((l, j) => {
    const pedidos = Math.round(l.base * FACTOR_DIA[dow] * (0.88 + ruido(i, j) * 0.24))
    const cancelados = Math.round(pedidos * (0.05 + ruido(j, i) * 0.06))
    const total = Math.round(pedidos * l.ticket * (0.95 + ruido(i + 7, j) * 0.1) * 100) / 100
    porLocal[l.id] = { pedidos, cancelados, total }
  })
  return { fecha, dow, porLocal }
})

/* ---------- Utilidades ---------- */

const dos = (n) => String(n).padStart(2, '0')
const fechaCorta = (f) => `${dos(f.getUTCDate())}/${dos(f.getUTCMonth() + 1)}`
const fechaLarga = (f) => `${fechaCorta(f)}/${f.getUTCFullYear()}`
const soles = (n) =>
  `S/ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const entero = (n) => n.toLocaleString('en-US')

function sumar(dias, localId) {
  const ids = localId === 'todos' ? LOCALES.map((l) => l.id) : [localId]
  return dias.reduce(
    (acc, d) => {
      ids.forEach((id) => {
        const r = d.porLocal[id]
        acc.pedidos += r.pedidos
        acc.cancelados += r.cancelados
        acc.total += r.total
      })
      return acc
    },
    { pedidos: 0, cancelados: 0, total: 0 }
  )
}

function Variacion({ actual, previo }) {
  if (!previo) return <span className="tab-delta tab-delta--neutro">sin periodo anterior</span>
  const pct = ((actual - previo) / previo) * 100
  if (Math.abs(pct) < 2) return <span className="tab-delta tab-delta--neutro">sin cambios relevantes</span>
  return (
    <span className={`tab-delta ${pct > 0 ? 'tab-delta--sube' : 'tab-delta--baja'}`}>
      {pct > 0 ? '+' : ''}
      {Math.round(pct)} % vs. periodo anterior
    </span>
  )
}

/* ---------- Página ---------- */

export default function Tablero() {
  const [rango, setRango] = useState(15)
  const [local, setLocal] = useState('todos')

  const datos = useMemo(() => {
    const diasAct = DIAS.slice(DIAS.length - rango)
    const diasPrev = DIAS.slice(DIAS.length - 2 * rango, DIAS.length - rango)

    const act = sumar(diasAct, local)
    const prev = sumar(diasPrev, local)

    const tasa = act.pedidos ? (act.cancelados / act.pedidos) * 100 : 0
    const tasaPrev = prev.pedidos ? (prev.cancelados / prev.pedidos) * 100 : 0
    const ticket = act.pedidos ? act.total / act.pedidos : 0
    const ticketPrev = prev.pedidos ? prev.total / prev.pedidos : 0

    const serie = diasAct.map((d) => ({
      fecha: d.fecha,
      dow: d.dow,
      pedidos: sumar([d], local).pedidos,
    }))

    const porLocal = LOCALES.filter((l) => local === 'todos' || l.id === local)
      .map((l) => ({ ...l, vendido: sumar(diasAct, l.id).total }))
      .sort((a, b) => b.vendido - a.vendido)

    // Promedio por día de la semana, para la nota del gráfico
    const suma = Array(7).fill(0)
    const cuenta = Array(7).fill(0)
    serie.forEach((s) => {
      suma[s.dow] += s.pedidos
      cuenta[s.dow] += 1
    })
    const promedios = suma
      .map((s, dow) => ({ dow, prom: cuenta[dow] ? s / cuenta[dow] : null }))
      .filter((x) => x.prom !== null)
      .sort((a, b) => b.prom - a.prom)

    let nota = ''
    if (promedios.length >= 3) {
      const [a, b] = promedios
      const menor = promedios[promedios.length - 1]
      nota = `Los picos corresponden a ${NOMBRE_DIA[a.dow]} y ${NOMBRE_DIA[b.dow]}; los ${NOMBRE_DIA[menor.dow]} el campus registra menos pedidos.`
    }

    return { diasAct, act, prev, tasa, tasaPrev, ticket, ticketPrev, serie, porLocal, nota }
  }, [rango, local])

  const { diasAct, act, prev, tasa, tasaPrev, ticket, ticketPrev, serie, porLocal, nota } = datos

  const maxSerie = Math.max(...serie.map((s) => s.pedidos), 0)
  const maxLocal = Math.max(...porLocal.map((l) => l.vendido), 0)
  const paso = Math.max(1, Math.ceil(serie.length / 5))
  const nombreLocal = local === 'todos' ? 'todos los locales' : LOCALES.find((l) => l.id === local).nombre

  const difTasa = tasa - tasaPrev
  const cancelAlta = tasa > 5

  function exportar() {
    const filas = ['fecha,pedidos,cancelados,total_vendido']
    diasAct.forEach((d) => {
      const r = sumar([d], local)
      filas.push(`${d.fecha.toISOString().slice(0, 10)},${r.pedidos},${r.cancelados},${r.total.toFixed(2)}`)
    })
    const blob = new Blob(['﻿' + filas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tablero-ventas-${local}-${rango}d.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="owner-page">
      <p className="owner-page__crumbs">Métricas › Tablero de ventas</p>

      <div className="owner-page__head">
        <div>
          <h1 className="owner-page__title">Tablero de ventas</h1>
          <p className="owner-page__sub">
            {fechaLarga(diasAct[0].fecha)} al {fechaLarga(diasAct[diasAct.length - 1].fecha)} · {nombreLocal} · sede Monterrico
          </p>
        </div>

        <div className="owner-page__actions">
          <label className="owner-select">
            <select value={rango} onChange={(e) => setRango(Number(e.target.value))} aria-label="Rango de fechas">
              {RANGOS.map((r) => (
                <option key={r.valor} value={r.valor}>Rango: {r.texto}</option>
              ))}
            </select>
          </label>

          <label className="owner-select">
            <select value={local} onChange={(e) => setLocal(e.target.value)} aria-label="Local">
              <option value="todos">Local: todos</option>
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>Local: {l.nombre}</option>
              ))}
            </select>
          </label>

          <button type="button" className="owner-btn owner-btn--outline" onClick={exportar}>
            Exportar
          </button>
        </div>
      </div>

      {/* Indicadores */}
      <div className="tab-kpis">
        <article className="owner-card">
          <h2 className="owner-card__title">Pedidos del periodo</h2>
          <p className="tab-kpi__valor">{entero(act.pedidos)}</p>
          <Variacion actual={act.pedidos} previo={prev.pedidos} />
        </article>

        <article className="owner-card">
          <h2 className="owner-card__title">Total vendido</h2>
          <p className="tab-kpi__valor">{soles(act.total)}</p>
          <Variacion actual={act.total} previo={prev.total} />
        </article>

        <article className="owner-card">
          <h2 className="owner-card__title">Ticket promedio</h2>
          <p className="tab-kpi__valor">{soles(ticket)}</p>
          <Variacion actual={ticket} previo={ticketPrev} />
        </article>

        <article className="owner-card">
          <h2 className="owner-card__title">Tasa de cancelación</h2>
          <p className={`tab-kpi__valor ${cancelAlta ? 'tab-kpi__valor--alerta' : ''}`}>{tasa.toFixed(1)} %</p>
          {Math.abs(difTasa) < 0.3 ? (
            <span className="tab-delta tab-delta--neutro">sin cambios relevantes</span>
          ) : (
            <span className={`tab-delta ${difTasa > 0 ? 'tab-delta--baja' : 'tab-delta--sube'}`}>
              {difTasa > 0 ? '+' : ''}
              {difTasa.toFixed(1)} puntos
            </span>
          )}
        </article>
      </div>

      {/* Gráficos */}
      <div className="tab-row">
        <article className="owner-card">
          <h2 className="owner-card__title">Pedidos por día</h2>

          <div className="tab-bars" role="img" aria-label="Pedidos por día">
            {serie.map((s, i) => {
              const clase =
                maxSerie && s.pedidos >= maxSerie * 0.9 ? 'is-pico'
                : maxSerie && s.pedidos < maxSerie * 0.25 ? 'is-bajo'
                : ''
              const mostrar = i === serie.length - 1 || (i % paso === 0 && serie.length - 1 - i >= paso / 2)
              return (
                <div key={s.fecha.toISOString()} className="tab-bars__col" title={`${fechaCorta(s.fecha)}: ${s.pedidos} pedidos`}>
                  <div
                    className={`tab-bars__bar ${clase}`}
                    style={{ height: `${maxSerie ? (s.pedidos / maxSerie) * 100 : 0}%` }}
                  />
                  {mostrar && <span className="tab-bars__label">{fechaCorta(s.fecha)}</span>}
                </div>
              )
            })}
          </div>

          {nota && <p className="owner-card__note">{nota}</p>}
        </article>

        <article className="owner-card">
          <h2 className="owner-card__title">Ventas por local</h2>

          <ul className="tab-locales">
            {porLocal.map((l) => (
              <li key={l.id}>
                <div className="tab-locales__fila">
                  <span>{l.nombre}</span>
                  <strong>{soles(l.vendido)}</strong>
                </div>
                <div className="tab-locales__pista">
                  <div className="tab-locales__barra" style={{ width: `${maxLocal ? (l.vendido / maxLocal) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
