// src/pages/PedidosComensal/PedidosComensal.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PedidosComensal.css';

export default function PedidosComensal() {
  const navigate = useNavigate();
  const [filtroLocal, setFiltroLocal] = useState('todos');
  const [simularVacio, setSimularVacio] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  // Lista de pedidos mock según las maquetas
  const pedidosEnCurso = [
    {
      id: 'PED-4821',
      local: 'Cafetería Central',
      horaRecojo: '11:30',
      fecha: '15/09/2026',
      itemsCount: 3,
      total: '36.00',
      estado: 'En preparación',
      tipoEstado: 'PREPARACION'
    },
    {
      id: 'PED-4835',
      local: 'Café de Biblioteca',
      horaRecojo: '16:00',
      fecha: '15/09/2026',
      itemsCount: 1,
      total: '7.50',
      estado: 'Listo para recoger',
      tipoEstado: 'LISTO'
    }
  ];

  const pedidosHistoricos = [
    {
      id: 'PED-4790',
      local: 'Sanguchería pabellón E',
      horaRecojo: '12:00',
      fecha: '12/09/2026',
      itemsCount: 2,
      total: '12.00',
      estado: 'Entregado',
      tipoEstado: 'ENTREGADO',
      puedeCalificar: true
    },
    {
      id: 'PED-4712',
      local: 'Menú Universitario N',
      horaRecojo: '13:00',
      fecha: '09/09/2026',
      itemsCount: 1,
      total: '14.00',
      estado: 'Rechazado',
      tipoEstado: 'RECHAZADO',
      puedeCalificar: false
    },
    {
      id: 'PED-4655',
      local: 'Juguería La Fuente',
      horaRecojo: '10:30',
      fecha: '04/09/2026',
      itemsCount: 2,
      total: '11.00',
      estado: 'Entregado',
      tipoEstado: 'ENTREGADO',
      puedeCalificar: false
    }
  ];

  // Filtrado por local seleccionado
  const enCursoFiltrados = simularVacio
    ? []
    : pedidosEnCurso.filter((p) => filtroLocal === 'todos' || p.local.toLowerCase().includes(filtroLocal));

  const historicosFiltrados = simularVacio
    ? []
    : pedidosHistoricos.filter((p) => filtroLocal === 'todos' || p.local.toLowerCase().includes(filtroLocal));

  const estaVacio = enCursoFiltrados.length === 0 && historicosFiltrados.length === 0;

  return (
    <main className="comensal-main-layout pedidos-container">
      {/* BARRA DE SIMULACIÓN PARA EVALUAR ESTADOS */}
      <div className="pedidos-simulador-bar">
        <span className="pedidos-simulador-label">Simular vista:</span>
        <button
          className={`pedidos-btn-simulador ${!simularVacio ? 'active' : ''}`}
          onClick={() => setSimularVacio(false)}
        >
          Con Pedidos
        </button>
        <button
          className={`pedidos-btn-simulador ${simularVacio ? 'active' : ''}`}
          onClick={() => setSimularVacio(true)}
        >
          Sin Pedidos (Vacío)
        </button>
      </div>

      {estaVacio ? (
        /* VISTA ESTADO VACÍO (PIEZA SUELTA) */
        <div className="pedidos-empty-card">
          <div className="pedidos-empty-icon-circle">📋</div>
          <h2 className="pedidos-empty-title">Aún no tienes pedidos</h2>
          <p className="pedidos-empty-desc">
            Cuando pidas en un local del campus verás aquí su avance y su código de recojo.
          </p>
          <button
            className="pedidos-btn-primary"
            onClick={() => navigate('/comensales/localescomensal')}
          >
            Ver locales abiertos
          </button>
        </div>
      ) : (
        /* VISTA PRINCIPAL CON PEDIDOS */
        <div>
          {/* CABECERA Y FILTRO */}
          <div className="pedidos-header flex-between">
            <div>
              <h1 className="pedidos-title">Mis pedidos</h1>
              <p className="pedidos-subtitle">
                {enCursoFiltrados.length} pedidos en curso · {historicosFiltrados.length + 4} en el histórico
              </p>
            </div>
            <select
              className="pedidos-select-filter"
              value={filtroLocal}
              onChange={(e) => setFiltroLocal(e.target.value)}
            >
              <option value="todos">Local: todos</option>
              <option value="cafetería central">Cafetería Central</option>
              <option value="café de biblioteca">Café de Biblioteca</option>
              <option value="sanguchería">Sanguchería pabellón E</option>
            </select>
          </div>

          {/* SECCIÓN EN CURSO */}
          {enCursoFiltrados.length > 0 && (
            <div className="pedidos-section">
              <h3 className="pedidos-section-label label-en-curso">
                EN CURSO · {enCursoFiltrados.length}
              </h3>
              <div className="pedidos-list">
                {enCursoFiltrados.map((p) => {
                  const esListo = p.tipoEstado === 'LISTO';
                  return (
                    <div
                      key={p.id}
                      className={`pedidos-card ${esListo ? 'card-listo' : 'card-normal'}`}
                    >
                      <div>
                        <h4 className="pedidos-card-title">{p.local}</h4>
                        <span className={`pedidos-card-code ${esListo ? 'code-listo' : ''}`}>
                          {p.id}
                        </span>
                      </div>

                      <div className="pedidos-col">
                        <span className="pedidos-col-label">RECOJO</span>
                        <strong className="pedidos-col-value">{p.horaRecojo}</strong>
                      </div>

                      <div className="pedidos-col">
                        <span className="pedidos-col-label">FECHA</span>
                        <span className="pedidos-col-text">{p.fecha}</span>
                      </div>

                      <div className="pedidos-col">
                        <span className="pedidos-col-label">ÍTEMS</span>
                        <span className="pedidos-col-text">
                          {p.itemsCount} {p.itemsCount === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>

                      <div className="pedidos-col">
                        <span className="pedidos-col-label">TOTAL</span>
                        <strong className="pedidos-col-total">S/ {p.total}</strong>
                      </div>

                      <div className="pedidos-actions-group">
                        <span className={`pedidos-badge ${esListo ? 'badge-listo' : 'badge-preparacion'}`}>
                          {p.estado}
                        </span>
                        <button
                          className={`pedidos-btn-action ${esListo ? 'btn-listo' : 'btn-avance'}`}
                          onClick={() => navigate('/comensales/confirmacion')}
                        >
                          {esListo ? 'Ver código' : 'Ver avance'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN HISTÓRICOS */}
          <div className="pedidos-section">
            <h3 className="pedidos-section-label label-historicos">HISTÓRICOS</h3>
            <div className="pedidos-list">
              {historicosFiltrados.map((p) => {
                const esRechazado = p.tipoEstado === 'RECHAZADO';
                return (
                  <div key={p.id} className="pedidos-card card-normal">
                    <div>
                      <h4 className="pedidos-card-title">{p.local}</h4>
                      <span className="pedidos-card-code">{p.id}</span>
                    </div>

                    <div className="pedidos-col">
                      <span className="pedidos-col-label">RECOJO</span>
                      <span className="pedidos-col-text">{p.horaRecojo}</span>
                    </div>

                    <div className="pedidos-col">
                      <span className="pedidos-col-label">FECHA</span>
                      <span className="pedidos-col-text">{p.fecha}</span>
                    </div>

                    <div className="pedidos-col">
                      <span className="pedidos-col-label">ÍTEMS</span>
                      <span className="pedidos-col-text">
                        {p.itemsCount} {p.itemsCount === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>

                    <div className="pedidos-col">
                      <span className="pedidos-col-label">TOTAL</span>
                      <strong className="pedidos-col-total">S/ {p.total}</strong>
                    </div>

                    <div className="pedidos-actions-group">
                      <span className={`pedidos-badge ${esRechazado ? 'badge-rechazado' : 'badge-entregado'}`}>
                        {p.estado}
                      </span>
                      <button
                        className="pedidos-btn-secondary"
                        onClick={() => navigate('/comensales/carrito')}
                      >
                        Repetir
                      </button>
                      {p.puedeCalificar && (
                        <button
                          className="pedidos-btn-calificar"
                          onClick={() => navigate('/comensales/calificaciones')}
                        >
                          Calificar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAGINACIÓN INFERIOR */}
          <div className="pedidos-pagination-row flex-between">
            <span className="pedidos-pagination-info">Mostrando 1 a 5 de 9 pedidos</span>
            <div className="pedidos-pagination-btns">
              <button className="pedidos-pg-btn disabled">‹</button>
              <button
                className={`pedidos-pg-btn ${paginaActual === 1 ? 'active' : ''}`}
                onClick={() => setPaginaActual(1)}
              >
                1
              </button>
              <button
                className={`pedidos-pg-btn ${paginaActual === 2 ? 'active' : ''}`}
                onClick={() => setPaginaActual(2)}
              >
                2
              </button>
              <button className="pedidos-pg-btn">›</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}