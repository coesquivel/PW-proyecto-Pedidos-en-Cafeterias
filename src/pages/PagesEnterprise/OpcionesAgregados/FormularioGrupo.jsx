import React from 'react';

export default function FormularioGrupo({
    form,
    editando,
    error,
    onChangeCampo,
    onChangeAlternativa,
    onAgregarAlternativa,
    onQuitarAlternativa,
    onGuardar,
    onCancelar,
    onEliminar
}) {
    return (
        <form className="grupo-form" onSubmit={onGuardar}>
            <h3 className="form-title">
                {editando ? 'EDITAR GRUPO DE OPCIONES' : 'NUEVO GRUPO DE OPCIONES'}
            </h3>

            <label className="form-label" htmlFor="g-nombre">NOMBRE DEL GRUPO</label>
            <input
                id="g-nombre"
                className="form-input"
                type="text"
                placeholder="Tamaño"
                value={form.nombre}
                onChange={(e) => onChangeCampo('nombre', e.target.value)}
            />

            <span className="form-label">TIPO DE SELECCIÓN</span>
            <div className="form-radios">
                <label className={form.seleccion === 'unica' ? 'radio activo' : 'radio'}>
                    <input
                        type="radio"
                        name="seleccion"
                        checked={form.seleccion === 'unica'}
                        onChange={() => onChangeCampo('seleccion', 'unica')}
                    />
                    <span>Única</span>
                </label>
                <label className={form.seleccion === 'multiple' ? 'radio activo' : 'radio'}>
                    <input
                        type="radio"
                        name="seleccion"
                        checked={form.seleccion === 'multiple'}
                        onChange={() => onChangeCampo('seleccion', 'multiple')}
                    />
                    <span>Múltiple</span>
                </label>
            </div>

            <label className="switch-row">
                <input
                    type="checkbox"
                    className="switch"
                    checked={form.obligatorio}
                    onChange={(e) => onChangeCampo('obligatorio', e.target.checked)}
                />
                <span>Obligatorio para el comensal</span>
            </label>

            <span className="form-label">ALTERNATIVAS</span>
            <div className="alt-lista">
                {form.alternativas.map((a) => (
                    <div className="alt-fila" key={a.id}>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Nombre"
                            value={a.nombre}
                            onChange={(e) => onChangeAlternativa(a.id, 'nombre', e.target.value)}
                        />
                        <input
                            className="form-input"
                            type="number"
                            min="0"
                            step="0.1"
                            inputMode="decimal"
                            placeholder="S/ 0.00"
                            value={a.precio}
                            onChange={(e) => onChangeAlternativa(a.id, 'precio', e.target.value)}
                        />
                        {form.alternativas.length > 1 && (
                            <button
                                type="button"
                                className="alt-quitar"
                                aria-label="Quitar alternativa"
                                onClick={() => onQuitarAlternativa(a.id)}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button type="button" className="link-editar link-agregar" onClick={onAgregarAlternativa}>
                + Agregar alternativa
            </button>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button type="submit" className="btn btn-danger-custom form-guardar">
                {editando ? 'Guardar cambios' : 'Guardar grupo'}
            </button>

            {editando && (
                <div className="form-secundarios">
                    <button type="button" className="link-secundario" onClick={onCancelar}>
                        Cancelar
                    </button>
                    <button type="button" className="link-secundario link-peligro" onClick={onEliminar}>
                        Eliminar grupo
                    </button>
                </div>
            )}
        </form>
    );
}