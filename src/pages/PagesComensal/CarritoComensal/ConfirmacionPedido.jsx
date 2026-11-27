// src/pages/CarritoComensal/ConfirmacionPedido.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerCarrito,
  confirmarPedido,
  CARRITO_VACIO,
  ahoraEnLima,
  sumarDias,
  fechaCorta,
  horaAMinutos,
  minutosAHora,
  diaDeSemana,
} from '../../../api/pedidos';
import { obtenerLocal } from '../../../api/locales';
import { mensajeDeError } from '../../../api/carta';
import './ConfirmacionPedido.css';

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

const PASO = 30; // minutos entre franjas

// Franjas de un día según el horario del local: de la apertura hasta 30 min antes del cierre
const franjasDelDia = (local, fecha) => {
  const dia = local?.schedule?.find((d) => d.day_of_week === diaDeSemana(fecha));
  if (!dia || dia.is_closed) return [];

  const franjas = [];
  for (let t = horaAMinutos(dia.open_time); t + PASO <= horaAMinutos(dia.close_time); t += PASO) {
    franjas.push(minutosAHora(t));
  }
  return franjas;
};

export default function ConfirmacionPedido({ carrito, setCarrito }) {
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState('');
  const [pedido, setPedido] = useState(null); // pedido confirmado (respuesta de la API)
  const [dia, setDia] = useState(null); // 'hoy' | 'manana'
  const [franjaSeleccionada, setFranjaSeleccionada] = useState('');
  const [local, setLocal] = useState(null); // local del carrito, con su horario
  const [cargandoLocal, setCargandoLocal] = useState(true);

  const items = carrito.items;
  const nombreLocal = carrito.store ? carrito.store.name : '';
  const ubicacion = carrito.store?.campus_location || '';

  // Al entrar se vuelve a pedir el carrito (precios y disponibilidad al día)
  useEffect(() => {
    obtenerCarrito()
      .then(setCarrito)
      .catch((e) => setError(mensajeDeError(e, 'No se pudo cargar tu carrito.')))
      .finally(() => setCargando(false));
  }, [setCarrito]);

  // Horario del local del carrito (para armar las franjas de recojo)
  const idLocal = carrito.store?.id;
  useEffect(() => {
    if (!idLocal) return;
    setCargandoLocal(true);
    obtenerLocal(idLocal)
      .then(setLocal)
      .catch((e) => setError(mensajeDeError(e, 'No se pudo cargar el horario del local.')))
      .finally(() => setCargandoLocal(false));
  }, [idLocal]);

  const ahora = ahoraEnLima();
  const fechaHoy = ahora.fecha;
  const fechaManana = sumarDias(fechaHoy, 1);

  // El producto más lento decide desde qué hora alcanza a estar listo
  const prepMax = Math.max(0, ...items.map((i) => i.preparation_time || 0));

  const franjasHoy = franjasDelDia(local, fechaHoy);
  const franjasManana = franjasDelDia(local, fechaManana);

  // Hoy no se puede elegir una franja que ya pasó o que no alcanza para preparar el pedido
  const franjaDisponible = (hora, diaElegido) =>
    diaElegido === 'manana' || horaAMinutos(hora) >= ahora.minutos + prepMax;

  const hayFranjasHoy = franjasHoy.some((h) => franjaDisponible(h, 'hoy'));

  // Día por defecto: hoy si aún quedan franjas, si no mañana
  const diaActual = dia || (hayFranjasHoy ? 'hoy' : 'manana');
  const fechaElegida = diaActual === 'hoy' ? fechaHoy : fechaManana;
  const franjasDelDiaElegido = diaActual === 'hoy' ? franjasHoy : franjasManana;

  // Si la franja elegida deja de estar disponible (o cambió el día), se elige la primera libre
  const franjaValida = franjaSeleccionada
    && franjasDelDiaElegido.includes(franjaSeleccionada)
    && franjaDisponible(franjaSeleccionada, diaActual)
    ? franjaSeleccionada
    : (franjasDelDiaElegido.find((h) => franjaDisponible(h, diaActual)) || '');

  const handleConfirmar = async () => {
    setConfirmando(true);
    setError('');
    try {
      const creado = await confirmarPedido({ pickup_time: franjaValida, pickup_date: fechaElegida });
      setCarrito(CARRITO_VACIO);
      setPedido(creado);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo confirmar el pedido.'));
      // Si algo cambió (producto agotado, hora ya pasada) se refresca el carrito
      obtenerCarrito().then(setCarrito).catch(() => {});
    } finally {
      setConfirmando(false);
    }
  };

  // VISTA 4.2: PEDIDO CONFIRMADO
  if (pedido) {
    return (
      <main className="confirmacion-layout">
        <div style={{ background: "#E8F5E9", border: "1px solid #48BB78", color: "#2E7D32", padding: "12px 16px", borderRadius: "var(--radius-container)", textAlign: "center", fontSize: "13px", marginBottom: "32px", fontWeight: "500" }}>
          ✓ Pedido confirmado. {pedido.store.name} ya lo recibió en su bandeja del día.
        </div>

        <div className="confirmado-card-main" style={{ border: "none", boxShadow: "none", background: "transparent" }}>
          <div style={{ width: "48px", height: "48px", background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#2E7D32", fontWeight: "bold", fontSize: "20px" }}>
            ✓
          </div>

          <h1 className="locales-title" style={{ fontSize: "32px", textAlign: "center" }}>Pedido confirmado</h1>
          <p className="locales-subtitle" style={{ fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
            Dicta este código en el mostrador de {pedido.store.name} para recoger y pagar.
          </p>

          <div className="codigo-box-large" style={{ maxWidth: "480px", margin: "0 auto 24px auto" }}>
            <span>CÓDIGO DE PEDIDO</span>
            <h1>{pedido.code}</h1>
          </div>

          <div className="detalles-confirmacion-grid" style={{ maxWidth: "720px", margin: "0 auto 24px auto" }}>
            <div className="detalle-pill-box">
              <label>HORA DE RECOJO</label>
              <span>{pedido.pickup_time}</span>
            </div>
            <div className="detalle-pill-box">
              <label>FECHA</label>
              <span>{fechaCorta(pedido.pickup_date)}</span>
            </div>
            <div className="detalle-pill-box">
              <label>LOCAL</label>
              <span>{pedido.store.name}</span>
            </div>
            <div className="detalle-pill-box">
              <label>TOTAL A PAGAR</label>
              <span>{soles(pedido.total)}</span>
            </div>
          </div>

          <div style={{ background: "var(--primary-soft)", borderRadius: "var(--radius-container)", padding: "14px 20px", fontSize: "13px", color: "var(--text-muted)", maxWidth: "640px", margin: "0 auto 28px auto", lineHeight: "1.5" }}>
            {pedido.store.campus_location ? `Ubicación de recojo: ${pedido.store.campus_location}. ` : ''}
            El pago se realiza en el punto de recojo; la plataforma no cobra en línea.
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

  if (cargando && items.length === 0) {
    return (
      <main className="confirmacion-layout">
        <p className="locales-subtitle">Cargando tu pedido...</p>
      </main>
    );
  }

  // Sin productos: no hay nada que confirmar
  if (items.length === 0) {
    return (
      <main className="confirmacion-layout">
        <h1 className="locales-title">No tienes productos en el carrito</h1>
        <p className="locales-subtitle" style={{ marginBottom: "20px" }}>
          Agrega productos de un local para elegir tu hora de recojo.
        </p>
        {error && <div className="alert-obligatorio">{error}</div>}
        <button className="btn-primary-action" onClick={() => navigate('/comensales/localescomensal')}>
          Ver locales
        </button>
      </main>
    );
  }

  const hayAgotados = items.some((i) => !i.available);

  // VISTA 4.1: FORMULARIO DE CONFIRMACIÓN Y SELECTOR DE HORA DE RECOJO
  return (
    <main className="confirmacion-layout">
      <div className="breadcrumbs" style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
        Carrito &gt; <span style={{ color: "var(--text)" }}>Hora de recojo y confirmación</span>
      </div>

      <h1 className="locales-title">Confirma tu pedido</h1>
      <p className="locales-subtitle" style={{ marginBottom: "20px" }}>
        {nombreLocal}{ubicacion ? ` · ${ubicacion}` : ''} · {diaActual === 'hoy' ? 'hoy' : 'mañana'} {fechaCorta(fechaElegida)}
      </p>

      <div className="confirmacion-grid">
        {/* COLUMNA IZQUIERDA: RESUMEN DEL PEDIDO */}
        <div className="confirmacion-card">
          <h3 className="section-title" style={{ fontSize: "18px", margin: "0 0 16px 0" }}>Resumen del pedido</h3>

          {items.map((item) => (
            <div key={item.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <strong>{item.quantity} × {item.name}</strong>
                <span className="price-text">{soles(item.subtotal)}</span>
              </div>
              {item.options && item.options.length > 0 && <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{item.options.map((o) => o.name).join(', ')}</p>}
              {item.notes && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>Nota: {item.notes}</p>
              )}
              {!item.available && (
                <p style={{ fontSize: "12px", color: "var(--primary)", margin: "4px 0 0 0" }}>Agotado: quítalo del carrito para continuar</p>
              )}
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "20px" }}>
            <span style={{ fontSize: "14px" }}>Total a pagar en el mostrador</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: "600", color: "var(--text)" }}>{soles(carrito.total)}</span>
          </div>

          <div style={{ background: "var(--primary-soft)", borderRadius: "var(--radius-container)", padding: "12px", fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>
            El pago es en el punto de recojo. Tienes 15 minutos de tolerancia desde el inicio de tu franja.
          </div>
        </div>

        {/* COLUMNA DERECHA: SELECTOR DE HORA DE RECOJO DE FRANJAS */}
        <div className="confirmacion-card">
          <div>
            <h3 className="section-title" style={{ fontSize: "18px", margin: "0 0 4px 0" }}>Elige tu hora de recojo</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 12px 0" }}>
              Franjas de 30 minutos dentro del horario del local · las tachadas ya pasaron o no alcanzan el tiempo de preparación
              {prepMax > 0 ? ` (${prepMax} min)` : ''}.
            </p>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                className={diaActual === 'hoy' ? 'btn-primary-action' : 'btn-secondary-action'}
                style={{ minHeight: "34px", padding: "0 14px", fontSize: "13px" }}
                disabled={!hayFranjasHoy}
                onClick={() => setDia('hoy')}
              >
                Hoy
              </button>
              <button
                className={diaActual === 'manana' ? 'btn-primary-action' : 'btn-secondary-action'}
                style={{ minHeight: "34px", padding: "0 14px", fontSize: "13px" }}
                onClick={() => setDia('manana')}
              >
                Mañana
              </button>
            </div>

            <div className="franjas-grid-selector">
              {franjasDelDiaElegido.map((hora) => {
                const libre = franjaDisponible(hora, diaActual);
                return (
                  <button
                    key={hora}
                    className={`franja-chip ${!libre ? 'disabled' : franjaValida === hora ? 'selected' : ''}`}
                    disabled={!libre}
                    onClick={() => setFranjaSeleccionada(hora)}
                  >
                    {hora}
                  </button>
                );
              })}
            </div>

            {!cargandoLocal && franjasDelDiaElegido.length === 0 && (
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 12px 0" }}>
                {nombreLocal} no atiende {diaActual === 'hoy' ? 'hoy' : 'mañana'}. Prueba con otro día.
              </p>
            )}

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-container)", padding: "12px 16px", display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "16px" }}>
              <span>Franja elegida</span>
              <strong>{franjaValida || '—'} · {fechaCorta(fechaElegida)}</strong>
            </div>

            {error && <div className="alert-obligatorio" style={{ marginBottom: "12px" }}>{error}</div>}

            <button
              className="btn-primary-action"
              style={{ width: "100%", marginBottom: "8px" }}
              disabled={confirmando || !franjaValida || hayAgotados}
              onClick={handleConfirmar}
            >
              {confirmando ? 'Confirmando...' : `Confirmar pedido · ${soles(carrito.total)}`}
            </button>

            {hayAgotados && (
              <p style={{ fontSize: "11px", color: "var(--primary)", textAlign: "center", margin: 0 }}>
                Hay productos agotados en tu carrito. Vuelve al carrito para quitarlos.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
