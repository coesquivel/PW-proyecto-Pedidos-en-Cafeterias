//src\partials\FooterEnterprise.jsx
import './FooterPanel.css'

export default function PieEnterprise() {
    const soporte = 'campuspide@ulima.edu.pe'
    const anexo = '1180'
    const sede = 'Cafetería Central'

    return (
        <footer className="enterprise-footer">
            <div className="enterprise-footer__left">

                <span className="enterprise-footer__brand">
                    Campus Pide
                </span>

                <span className="enterprise-footer__separator">
                    ·
                </span>

                <span className="enterprise-footer__section">
                    Panel del local
                </span>

                <span className="enterprise-footer__separator">
                    ·
                </span>

                <span className="enterprise-footer__support">
                    Soporte:
                </span>

                <a
                    className="enterprise-footer__email"
                    href={`mailto:${soporte}`}
                >
                    {soporte}
                </a>

                <span className="enterprise-footer__separator">
                    ·
                </span>

                <span className="enterprise-footer__annex">
                    Anexo {anexo}
                </span>

            </div>

            <div className="enterprise-footer__right">
                Sesión iniciada como {sede}
            </div>
        </footer>
    )
}
