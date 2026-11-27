import * as scheduleService from '../services/schedules_services.js';
import { ok, fail } from './responses.js';

export const getMySchedule = async (req, res) => {
  try {
    return ok(res, 'Horario obtenido correctamente', await scheduleService.fetchByStore(req.store.id));
  } catch (error) {
    return fail(res, error, 'Error al obtener el horario');
  }
};

export const saveMySchedule = async (req, res) => {
  try {
    const schedule = await scheduleService.saveForStore(req.store.id, req.body);

    return ok(res, 'Horario guardado correctamente', schedule);
  } catch (error) {
    return fail(res, error, 'Error al guardar el horario');
  }
};
