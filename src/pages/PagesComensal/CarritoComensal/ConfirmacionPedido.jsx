// src/pages/CarritoComensal/ConfirmacionPedido.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConfirmacionPedido.css';

export default function ConfirmacionPedido({ items = [], setItems, onConfirmarPedido }) {
  const navigate = useNavigate();

  // Estados de franja y vista
  const [franjaSeleccionada, setFranjaSeleccionada] = useState("11:30");
  const [pedidoExito, setPedidoExito] = useState(false); // Inicia en el selector de hora por defecto
  const [simularFueraHorario, setSimularFueraHorario] = useState(false);
  const [simularRecepcionSuspendida, setSimularRecepcionSuspendida] = useState(false);

  const totalCalculado = 36.00;

  const handleConfirmar = () => {
    const nuevo = {
      id: "PED-4821",
      local: "Cafetería Central",
      fecha: "15/09/2026",
      horaRecojo: franjaSeleccionada,
      estado: "En preparación",
      total: totalCalculado,
      itemsCount: items.length || 3
    };

    if (onConfirmarPedido) onConfirmarPedido(nuevo);
    setPedidoExito(true);
  };

  // VISTA 4.2: PEDIDO CONFIRMADO (Pantalla con código PED-4821 tras confirmar)
  if (pedidoExito) {
    return (
      <main className="confirmacion-layout">
        {/* Banner Superior Verde de Éxito */}
        <div style={{ background: "#E8F5E9", border: "1px solid #48BB78", color: "#2E7D32", padding: "12px 16px", borderRadius: "var(--radius-container)", textAlign: "center", fontSize: "13px", marginBottom: "32px", fontWeight: "500" }}>
          ✓ Pedido confirmado. Cafetería Central ya lo recibió en su bandeja del día.
        </div>

        <div className="confirmado-card-main" style={{ border: "none", boxShadow: "none", background: "transparent" }}>
          <div style={{ width: "48px", height: "48px", background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#2E7D32", fontWeight: "bold", fontSize: "20px" }}>
            ✓
          </div>
          
          <h1 className="locales-title" style={{ fontSize: "32px", textAlign: "center" }}>Pedido confirmado</h1>
          <p className="locales-subtitle" style={{ fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
            Dicta este código en el mostrador de Cafetería Central para recoger y pagar.
          </p>

          <div className="codigo-box-large" style={{ maxWidth: "480px", margin: "0 auto 24px auto" }}>
            <span>CÓDIGO DE PEDIDO</span>
            <h1>PED-4821</h1>
          </div>

          <div className="detalles-confirmacion-grid" style={{ maxWidth: "720px", margin: "0 auto 24px auto" }}>
            <div className="detalle-pill-box">
              <label>HORA DE RECOJO</label>
              <span>{franjaSeleccionada}</span>
            </div>
            <div className="detalle-pill-box">
              <label>FECHA</label>
              <span>15/09/2026</span>
            </div>
            <div className="detalle-pill-box">
              <label>LOCAL</label>
              <span>Cafetería Central</span>
            </div>
            <div className="detalle-pill-box">
              <label>TOTAL A PAGAR</label>
              <span>S/ {totalCalculado.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ background: "var(--primary-soft)", borderRadius: "var(--radius-container)", padding: "14px 20px", fontSize: "13px", color: "var(--text-muted)", maxWidth: "640px", margin: "0 auto 28px auto", lineHeight: "1.5" }}>
            Ubicación de recojo: Pabellón A, primer piso, mostrador principal. El pago se realiza en el punto de recojo; la plataforma no cobra en línea.
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="btn-primary-action" onClick={() => navigate('/comensales/pedidos')}>
              Ver avance del pedido
            </button>
            <button className="btn-secondary-action" onClick={() => navigate('/comensales/localescomensal')}>
              Volver a los locales
            </button>
          </div>
        </div>
      </main>
    );
  }

  // VISTA 4.1: FORMULARIO DE CONFIRMACIÓN Y SELECTOR DE HORA DE RECOJO
  return (
    <main className="confirmacion-layout">
      <div className="breadcrumbs" style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
        Carrito &gt; <span style={{ color: "var(--text)" }}>Hora de recojo y confirmación</span>
      </div>

      <h1 className="locales-title">Confirma tu pedido</h1>
      <p className="locales-subtitle" style={{ marginBottom: "20px" }}>
        Cafetería Central · Pabellón A, primer piso · hoy 15/09/2026
      </p>

      {/* BANNER SIMULADOR DE EXCEPCIONES Y ERRORES */}
      <div className="simulador-bar" style={{ marginBottom: "20px" }}>
        <span>Probar piezas sueltas de error:</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-simulador" onClick={() => { setSimularFueraHorario(!simularFueraHorario); setSimularRecepcionSuspendida(false); }}>
            {simularFueraHorario ? "Quitar fuera de horario" : "Simular franja fuera de horario (19:30)"}
          </button>
          <button className="btn-simulador" onClick={() => { setSimularRecepcionSuspendida(!simularRecepcionSuspendida); setSimularFueraHorario(false); }}>
            {simularRecepcionSuspendida ? "Quitar recepción suspendida" : "Simular recepción suspendida"}
          </button>
        </div>
      </div>

      <div className="confirmacion-grid">
        {/* COLUMNA IZQUIERDA: RESUMEN DEL PEDIDO */}
        <div className="confirmacion-card">
          <h3 className="section-title" style={{ fontSize: "18px", margin: "0 0 16px 0" }}>Resumen del pedido</h3>

          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <strong>2 × Sándwich de pollo deshilachado</strong>
              <span className="price-text">S/ 23.00</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Pan francés · agregar queso · sin cebolla</p>
          </div>

          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <strong>1 × Jugo surtido</strong>
              <span className="price-text">S/ 9.00</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Tamaño grande · sin azúcar</p>
          </div>

          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <strong>1 × Café pasado</strong>
              <span className="price-text">S/ 4.00</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Empaque para llevar</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "20px" }}>
            <span style={{ fontSize: "14px" }}>Total a pagar en el mostrador</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: "600", color: "var(--text)" }}>S/ {totalCalculado.toFixed(2)}</span>
          </div>

          <div style={{ background: "var(--primary-soft)", borderRadius: "var(--radius-container)", padding: "12px", fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>
            El pago es en el punto de recojo. Tienes 15 minutos de tolerancia desde el inicio de tu franja.
          </div>
        </div>

        {/* COLUMNA DERECHA: SELECTOR DE HORA DE RECOJO DE FRANJAS */}
        <div className="confirmacion-card">
          {simularRecepcionSuspendida ? (
            <div>
              <div className="banner-alerta-suspendida">
                Cafetería Central suspendió la recepción de pedidos. Guardamos tu carrito para cuando reabra.
              </div>
              <button className="btn-disabled-wide" disabled>Confirmar pedido</button>
              <button className="btn-outline-wide" onClick={() => navigate('/comensales/localescomensal')}>Ver otros locales abiertos</button>
            </div>
          ) : (
            <div>
              {simularFueraHorario && (
                <div className="banner-alerta-franja">
                  La franja 19:30 quedó fuera del horario del local. Elige otra hora para continuar.
                </div>
              )}

              <h3 className="section-title" style={{ fontSize: "18px", margin: "0 0 4px 0" }}>Elige tu hora de recojo</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
                Franjas de 30 minutos · las tachadas están completas o no alcanzan el tiempo de preparación.
              </p>

              {/* MATRIZ DE FRANJAS HORARIAS (10:00 A 15:30) */}
              <div className="franjas-grid-selector">
                {["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"].map((hora) => {
                  const esTachada = hora === "10:00" || hora === "10:30" || hora === "13:00";
                  return (
                    <button
                      key={hora}
                      className={`franja-chip ${esTachada ? 'disabled' : franjaSeleccionada === hora ? 'selected' : ''}`}
                      disabled={esTachada}
                      onClick={() => setFranjaSeleccionada(hora)}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>

              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "12px 16px", display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "16px" }}>
                <span>Franja elegida</span>
                <strong>{franjaSeleccionada} · 15/09/2026</strong>
              </div>

              <button className="btn-primary-action" style={{ width: "100%", marginBottom: "8px" }} onClick={handleConfirmar}>
                Confirmar pedido · S/ {totalCalculado.toFixed(2)}
              </button>

              <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
                Podrás cancelar hasta 20 minutos antes de tu franja.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}