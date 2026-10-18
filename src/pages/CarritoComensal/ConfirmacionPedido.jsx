// src/pages/CarritoComensal/ConfirmacionPedido.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ConfirmacionPedido.css';

export default function ConfirmacionPedido({ items = [], setItems, onConfirmarPedido }) {
  const navigate = useNavigate();

  // Estados del selector y simuladores de excepciones
  const [franjaElegida, setFranjaElegida] = useState("11:30");
  const [estadoExcepcional, setEstadoExcepcional] = useState("NORMAL"); // "NORMAL" | "FUERA_HORARIO" | "SUSPENDIDO"
  const [pedidoExitoso, setPedidoExitoso] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState("");

  // Horarios de la grilla
  const franjas = [
    { hora: "10:00", estado: "llena" },
    { hora: "10:30", estado: "llena" },
    { hora: "11:00", estado: "disponible" },
    { hora: "11:30", estado: "disponible" },
    { hora: "12:00", estado: "disponible" },
    { hora: "12:30", estado: "disponible" },
    { hora: "13:00", estado: "llena" },
    { hora: "13:30", estado: "disponible" },
    { hora: "14:00", estado: "disponible" },
    { hora: "14:30", estado: "disponible" },
    { hora: "15:00", estado: "disponible" },
    { hora: "15:30", estado: "disponible" },
  ];

  const calcularTotal = () => {
    return items.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2);
  };

  const handleConfirmar = () => {
    if (estadoExcepcional !== "NORMAL" || !franjaElegida) return;

    // Generar código de pedido tipo PED-4821
    const codigo = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    setCodigoGenerado(codigo);

    if (onConfirmarPedido) {
      onConfirmarPedido({
        codigo,
        hora: franjaElegida,
        fecha: "15/09/2026",
        local: "Cafetería Central",
        total: `S/ ${calcularTotal()}`,
        items: [...items]
      });
    }

    // Vaciar carrito
    if (setItems) setItems([]);
    setPedidoExitoso(true);
  };

  // VISTA 4.2: PEDIDO CONFIRMADO
  if (pedidoExitoso) {
    return (
      <main className="confirmacion-main-layout">
        {/* Baner superior confirmación */}
        <div className="banner-exito">
          ✓ Pedido confirmado. Cafetería Central ya lo recibió en su bandeja del día.
        </div>

        <div className="card-exito-box">
          <div className="check-circle-icon">✓</div>
          <h1 className="exito-title">Pedido confirmado</h1>
          <p className="exito-subtitle">
            Dicta este código en el mostrador de Cafetería Central para recoger y pagar.
          </p>

          {/* CÓDIGO GIGANTE */}
          <div className="codigo-pedido-container">
            <span className="codigo-label">CÓDIGO DE PEDIDO</span>
            <div className="codigo-numero">{codigoGenerado}</div>
          </div>

          {/* 4 BLOQUES INFORMATIVOS */}
          <div className="bloques-info-grid">
            <div className="info-block">
              <span className="info-block-label">HORA DE RECOJO</span>
              <strong className="info-block-val">{franjaElegida}</strong>
            </div>
            <div className="info-block">
              <span className="info-block-label">FECHA</span>
              <strong className="info-block-val">15/09/2026</strong>
            </div>
            <div className="info-block">
              <span className="info-block-label">LOCAL</span>
              <strong className="info-block-val">Cafetería Central</strong>
            </div>
            <div className="info-block">
              <span className="info-block-label">TOTAL A PAGAR</span>
              <strong className="info-block-val">S/ {calcularTotal()}</strong>
            </div>
          </div>

          {/* AVISO DE UBICACIÓN Y PAGO */}
          <div className="aviso-ubicacion-box">
            Ubicación de recojo: Pabellón A, primer piso, mostrador principal. El pago se realiza en el punto de recojo; la plataforma no cobra en línea.
          </div>

          {/* BOTONES REDIRECCIÓN */}
          <div className="exito-acciones-row">
            <button 
              className="btn-rojo-confirmar"
              onClick={() => navigate("/comensales/pedidos")}
            >
              Ver avance del pedido
            </button>
            <button 
              className="btn-blanco-secundario"
              onClick={() => navigate("/comensales/localescomensal")}
            >
              Volver a los locales
            </button>
          </div>
        </div>
      </main>
    );
  }

  // VISTA 4.1: CONFIRMACIÓN DEL PEDIDO
  return (
    <main className="confirmacion-main-layout">
      {/* MODO SIMULADOR DE EXCEPCIONES */}
      <div className="simulador-excepciones-bar">
        <span>Simular escenario:</span>
        <button 
          className={`btn-sim ${estadoExcepcional === "NORMAL" ? "btn-sim--active" : ""}`}
          onClick={() => setEstadoExcepcional("NORMAL")}
        >
          Normal
        </button>
        <button 
          className={`btn-sim ${estadoExcepcional === "FUERA_HORARIO" ? "btn-sim--active" : ""}`}
          onClick={() => setEstadoExcepcional("FUERA_HORARIO")}
        >
          Franja Fuera de Horario
        </button>
        <button 
          className={`btn-sim ${estadoExcepcional === "SUSPENDIDO" ? "btn-sim--active" : ""}`}
          onClick={() => setEstadoExcepcional("SUSPENDIDO")}
        >
          Recepción Suspendida
        </button>
      </div>

      {/* BREADCRUMB */}
      <div className="confirmacion-breadcrumb">
        <Link to="/comensales/carrito">Carrito</Link>
        {" > "}
        <strong>Hora de recojo y confirmación</strong>
      </div>

      <h1 className="confirmacion-main-title">Confirma tu pedido</h1>
      <p className="confirmacion-main-subtitle">
        Cafetería Central · Pabellón A, primer piso · hoy 15/09/2026
      </p>

      <div className="confirmacion-grid">
        {/* COLUMNA IZQUIERDA: RESUMEN DEL PEDIDO */}
        <div className="confirmacion-card">
          <h3 className="card-sub-title">Resumen del pedido</h3>

          <div className="items-resumen-list">
            {items.length > 0 ? (
              items.map((it) => (
                <div key={it.id} className="item-resumen-row">
                  <div>
                    <strong className="item-resumen-nombre">{it.cantidad} × {it.nombre}</strong>
                    <p className="item-resumen-detalles">{it.detalles} {it.nota ? `· ${it.nota}` : ""}</p>
                  </div>
                  <span className="item-resumen-precio">S/ {it.subtotal.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="item-resumen-row">
                <div>
                  <strong className="item-resumen-nombre">2 × Sándwich de pollo deshilachado</strong>
                  <p className="item-resumen-detalles">Pan francés · agregar queso · sin cebolla</p>
                </div>
                <span className="item-resumen-precio">S/ 23.00</span>
              </div>
            )}
          </div>

          <div className="total-destacado-row">
            <span>Total a pagar en el mostrador</span>
            <strong className="total-destacado-monto">S/ {calcularTotal() === "0.00" ? "36.00" : calcularTotal()}</strong>
          </div>

          <div className="aviso-alerta-tolerancia">
            El pago es en el punto de recojo. Tienes 15 minutos de tolerancia desde el inicio de tu franja.
          </div>
        </div>

        {/* COLUMNA DERECHA: SELECTOR DE FRANJA DE RECOJO */}
        <div className="confirmacion-card">
          <h3 className="card-sub-title">Elige tu hora de recojo</h3>
          <p className="card-sub-description">
            Franjas de 30 minutos · las tachadas están completas o no alcanzan el tiempo de preparación.
          </p>

          {/* CASO EXCEPCIÓN 1: FRANJA FUERA DE HORARIO */}
          {estadoExcepcional === "FUERA_HORARIO" && (
            <div className="alerta-excepcion-amber">
              La franja 19:30 quedó fuera del horario del local. Elige otra hora para continuar.
            </div>
          )}

          {/* CASO EXCEPCIÓN 2: RECEPCIÓN SUSPENDIDA */}
          {estadoExcepcional === "SUSPENDIDO" && (
            <div className="alerta-excepcion-roja">
              Cafetería Central suspendió la recepción de pedidos. Guardamos tu carrito para cuando reabra.
            </div>
          )}

          {/* GRILLA DE FRANJAS */}
          {estadoExcepcional !== "SUSPENDIDO" ? (
            <>
              <div className="franjas-grid">
                {franjas.map((f) => {
                  const esTachada = f.estado === "llena";
                  const esSeleccionada = franjaElegida === f.hora && estadoExcepcional === "NORMAL";

                  return (
                    <button
                      key={f.hora}
                      disabled={esTachada}
                      className={`btn-franja ${esTachada ? "btn-franja--tachada" : ""} ${esSeleccionada ? "btn-franja--seleccionada" : ""}`}
                      onClick={() => setFranjaElegida(f.hora)}
                    >
                      {f.hora}
                    </button>
                  );
                })}

                {/* Franja de prueba fuera de horario */}
                {estadoExcepcional === "FUERA_HORARIO" && (
                  <button className="btn-franja btn-franja--fuera-horario">
                    19:30
                  </button>
                )}
              </div>

              <div className="franja-elegida-banner">
                <span>Franja elegida</span>
                <strong>{franjaElegida} · 15/09/2026</strong>
              </div>

              <button
                disabled={estadoExcepcional !== "NORMAL"}
                className={`btn-rojo-confirmar ${estadoExcepcional !== "NORMAL" ? "btn-rojo-confirmar--disabled" : ""}`}
                onClick={handleConfirmar}
              >
                Confirmar pedido · S/ {calcularTotal() === "0.00" ? "36.00" : calcularTotal()}
              </button>

              <p className="texto-cancelacion-nota">
                Podrás cancelar hasta 20 minutos antes de tu franja.
              </p>
            </>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <button className="btn-rojo-confirmar btn-rojo-confirmar--disabled" disabled>
                Confirmar pedido
              </button>
              <button 
                className="btn-blanco-secundario" 
                style={{ width: "100%", marginTop: "12px", color: "#d9381e", borderColor: "#d9381e" }}
                onClick={() => navigate("/comensales/localescomensal")}
              >
                Ver otros locales abiertos
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}