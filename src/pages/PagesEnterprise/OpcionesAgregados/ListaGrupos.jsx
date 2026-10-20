import React from 'react';

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;
const precioTexto = (n) => (n > 0 ? `+ ${soles(n)}` : 'Sin costo');

export default function ListaGrupos({ grupos, formIdEditando, onEditarGrupo }) {
    return (
        <div className="opciones-lista">
            {grupos.length === 0 && (
                <p className="opciones-vacio">
                    Este producto no tiene opciones. Crea el primer grupo con el formulario.
                </p>
            )}

            {grupos.map((g) => (
                <section
                    key={g.id}
                    className={`grupo-card ${formIdEditando === g.id ? 'grupo-editando' : ''}`}
                >
                    <header className="grupo-head">
                        <h2>{g.nombre}</h2>
                        <div className="grupo-tags">
                            <span className="tag tag-rojo">
                                {g.seleccion === 'unica' ? 'Selección única' : 'Selección múltiple'}
                            </span>
                            <span className={`tag ${g.obligatorio ? 'tag-rojo' : 'tag-gris'}`}>
                                {g.obligatorio ? 'Obligatorio' : 'Opcional'}
                            </span>
                            <button className="link-editar" onClick={() => onEditarGrupo(g)}>
                                Editar
                            </button>
                        </div>
                    </header>

                    <ul className="grupo-items">
                        {g.alternativas.map((a) => (
                            <li key={a.id}>
                                <span>{a.nombre}</span>
                                <strong className={a.precio > 0 ? '' : 'sin-costo'}>
                                    {precioTexto(a.precio)}
                                </strong>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}