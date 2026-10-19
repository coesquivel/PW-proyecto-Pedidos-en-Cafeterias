// src/pages/PedidosComensal/PedidosComensal.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PedidosComensal.css';

export default function PedidosComensal({ pedidos = [] }) {
  const navigate = useNavigate();
  const [simularSinPedidos, setSimularSinPedidos] = useState(false);

  // VISTA SIN PEDIDOS (PIEZA SUELTA)
  if (simularSinPedidos) {
    return (
      <main className="pedidos-layout">
        <div className="simulador-bar" style={{ marginBottom: "20px" }}>
          <span>Probando vista:</span>
          <button className="btn-simulador" onClick={() => setSimularSinPedidos(false)}>Mostrar lista con pedidos</button>
        </div>

        <div className="cart-card-container" style={{ textAlign: "center", padding: "48px 20px", maxWidth: "600px", margin: "40px auto" }}>
          <div style={{ width: "48px", height: "48px", background: "var(--primary-soft)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--primary)", fontSize: "20px" }}>
            📑
          </div>
          <h2 className="locales-title" style={{ fontSize: "22px", textAlign: "center" }}>Aún no tienes pedidos</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", textAlign: "center" }}>
            Cuando pidas en un local del campus verás aquí su avance y su código de recojo.
          </p>
          <button className="btn-primary-action" onClick={() => navigate('/comensales/localescomensal')}>
            Ver locales abiertos
          </button>
        </div>
      </main>
    );
  }

  // VISTA 4.3 MIS PEDIDOS COMPLETA (IMAGEN 9006d8.png)
  return (
    <main className="pedidos-layout">
      <div className="simulador-bar" style={{ marginBottom: "20px" }}>
        <span>Simulador de pruebas:</span>
        <button className="btn-simulador" onClick={() => setSimularSinPedidos(true)}>
          Ver estado "Aún no tienes pedidos"
        </button>
      </div>

      <div className="pedidos-header-row">
        <div>
          <h1 className="locales-title">Mis pedidos</h1>
          <p className="locales-subtitle">2 pedidos en curso · 7 en el histórico</p>
        </div>
        <select className="filter-dropdown" defaultValue="todos">
          <option value="todos">Local: todos</option>
          <option value="central">Cafetería Central</option>
        </select>
      </div>

      {/* SECCIÓN EN CURSO */}
      <div className="section-label-group">EN CURSO · 2</div>

      <div className="pedido-row-card">
        <div className="pedido-info-block">
          <div className="pedido-title-code" style={{ minWidth: "180px" }}>
            <h3>Cafetería Central</h3>
            <span>PED-4821</span>
          </div>
          <div className="pedido-meta-item">
            <label>RECOJO</label>
            <span>11:30</span>
          </div>
          <div className="pedido-meta-item">
            <label>FECHA</label>
            <span>15/09/2026</span>
          </div>
          <div className="pedido-meta-item">
            <label>ÍTEMS</label>
            <span>3 productos</span>
          </div>
          <div className="pedido-meta-item">
            <label>TOTAL</label>
            <span>S/ 36.00</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span className="badge-status-pill badge-status-preparacion">En preparación</span>
          <button className="btn-outline-wide" style={{ minHeight: "36px", padding: "0 16px", fontSize: "13px", width: "auto" }}>
            Ver avance
          </button>
        </div>
      </div>

      <div className="pedido-row-card pedido-row-card--listo">
        <div className="pedido-info-block">
          <div className="pedido-title-code" style={{ minWidth: "180px" }}>
            <h3>Café de Biblioteca</h3>
            <span>PED-4835</span>
          </div>
          <div className="pedido-meta-item">
            <label>RECOJO</label>
            <span>16:00</span>
          </div>
          <div className="pedido-meta-item">
            <label>FECHA</label>
            <span>15/09/2026</span>
          </div>
          <div className="pedido-meta-item">
            <label>ÍTEMS</label>
            <span>1 producto</span>
          </div>
          <div className="pedido-meta-item">
            <label>TOTAL</label>
            <span>S/ 7.50</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span className="badge-status-pill badge-status-listo">Listo para recoger</span>
          <button className="btn-primary-action" style={{ minHeight: "36px", padding: "0 16px", fontSize: "13px" }}>
            Ver código
          </button>
        </div>
      </div>

      {/* SECCIÓN HISTÓRICOS */}
      <div className="section-label-group section-label-group--muted" style={{ marginTop: "32px" }}>
        HISTÓRICOS
      </div>

      <div className="pedido-row-card">
        <div className="pedido-info-block">
          <div className="pedido-title-code" style={{ minWidth: "180px" }}>
            <h3>Sanguchería pabellón E</h3>
            <span>PED-4790</span>
          </div>
          <div className="pedido-meta-item">
            <label>RECOJO</label>
            <span>12:00</span>
          </div>
          <div className="pedido-meta-item">
            <label>FECHA</label>
            <span>12/09/2026</span>
          </div>
          <div className="pedido-meta-item">
            <label>ÍTEMS</label>
            <span>2 productos</span>
          </div>
          <div className="pedido-meta-item">
            <label>TOTAL</label>
            <span>S/ 12.00</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="badge-status-pill badge-status-entregado">Entregado</span>
          <button className="btn-secondary-action" style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px" }}>Repetir</button>
          <button className="btn-primary-action" style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px", background: "#5B9B2E" }} onClick={() => navigate('/comensales/calificaciones')}>Calificar</button>
        </div>
      </div>

      <div className="pedido-row-card">
        <div className="pedido-info-block">
          <div className="pedido-title-code" style={{ minWidth: "180px" }}>
            <h3>Menú Universitario N</h3>
            <span>PED-4712</span>
          </div>
          <div className="pedido-meta-item">
            <label>RECOJO</label>
            <span>13:00</span>
          </div>
          <div className="pedido-meta-item">
            <label>FECHA</label>
            <span>09/09/2026</span>
          </div>
          <div className="pedido-meta-item">
            <label>ÍTEMS</label>
            <span>1 producto</span>
          </div>
          <div className="pedido-meta-item">
            <label>TOTAL</label>
            <span>S/ 14.00</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="badge-status-pill badge-status-rechazado">Rechazado</span>
          <button className="btn-secondary-action" style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px" }}>Repetir</button>
        </div>
      </div>

      <div className="pedido-row-card">
        <div className="pedido-info-block">
          <div className="pedido-title-code" style={{ minWidth: "180px" }}>
            <h3>Juguería La Fuente</h3>
            <span>PED-4655</span>
          </div>
          <div className="pedido-meta-item">
            <label>RECOJO</label>
            <span>10:30</span>
          </div>
          <div className="pedido-meta-item">
            <label>FECHA</label>
            <span>04/09/2026</span>
          </div>
          <div className="pedido-meta-item">
            <label>ÍTEMS</label>
            <span>2 productos</span>
          </div>
          <div className="pedido-meta-item">
            <label>TOTAL</label>
            <span>S/ 11.00</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="badge-status-pill badge-status-entregado">Entregado</span>
          <button className="btn-secondary-action" style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px" }}>Repetir</button>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="pagination-row">
        <span>Mostrando 1 a 5 de 9 pedidos</span>
        <div className="pagination-controls">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>
    </main>
  );
}