import React from 'react';
import { Link } from 'react-router-dom';
import './FooterComensal.css';

export default function PieEnterprise() {
  const soporte = 'campuspide@ulima.edu.pe';

  return (
    <footer className="enterprise-footer">
      <div className="enterprise-footer__left">
        <span className="enterprise-footer__brand">
          Campus Pide
        </span>

        <Link className="enterprise-footer__link" to="/comensales/localescomensal">
          Locales
        </Link>

        <a className="enterprise-footer__link" href="#como-funciona">
          Cómo funciona
        </a>

        <a className="enterprise-footer__link" href="#terminos">
          Términos del servicio
        </a>

        <a className="enterprise-footer__email" href={`mailto:${soporte}`}>
          {soporte}
        </a>
      </div>

      <div className="enterprise-footer__right">
        © Universidad de Lima
      </div>
    </footer>
  );
}