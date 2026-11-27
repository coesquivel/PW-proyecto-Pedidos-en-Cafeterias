// src/api/horario.js
// Horario de atención del local en sesión (pantalla "Horario de atención").
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

const datos = (respuesta) => respuesta.data.data;

// Ids de día de la pantalla <-> day_of_week de la base (1 = lunes ... 7 = domingo)
export const DIA_A_NUMERO = { lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6, dom: 7 };

export const obtenerHorario = async () => datos(await api.get('/my-store/schedule'));

export const guardarHorarioApi = async (days) => datos(await api.put('/my-store/schedule', { days }));

// Respuesta de la API -> { lun: { abierto, apertura, cierre }, ... }
export const horarioAFormulario = (dias) => {
  const formulario = {};
  Object.entries(DIA_A_NUMERO).forEach(([id, numero]) => {
    const dia = dias.find((d) => d.day_of_week === numero);
    formulario[id] = dia && !dia.is_closed
      ? { abierto: true, apertura: dia.open_time, cierre: dia.close_time }
      : { abierto: false, apertura: '', cierre: '' };
  });
  return formulario;
};

// { lun: { abierto, apertura, cierre }, ... } -> lista de 7 días para la API
export const formularioAHorario = (formulario) =>
  Object.entries(DIA_A_NUMERO).map(([id, numero]) => {
    const dia = formulario[id];
    return dia.abierto
      ? { day_of_week: numero, is_closed: false, open_time: dia.apertura, close_time: dia.cierre }
      : { day_of_week: numero, is_closed: true, open_time: null, close_time: null };
  });
