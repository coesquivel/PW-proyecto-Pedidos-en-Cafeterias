import scheduleRepository from '../repositories/schedules_repository.js';
import { normalizeSchedule, SLOT_MINUTES } from './schedule_rules.js';
import { toMinutes } from './lima_time.js';
import { serviceError } from './errors.js';

const TIME_FORMAT = /^([01]\d|2[0-3]):(00|30)$/;

/**
 * Horario del local: siempre los 7 días (lunes=1 ... domingo=7)
 */
export const fetchByStore = async (storeId) => {
  const rows = await scheduleRepository.findByStore(storeId);

  return normalizeSchedule(rows.map((row) => row.toJSON()));
};

/**
 * Valida y guarda el horario completo del local.
 * Espera { days: [{ day_of_week, is_closed, open_time, close_time } x 7] }
 */
export const saveForStore = async (storeId, data = {}) => {
  const days = data.days;

  if (!Array.isArray(days) || days.length !== 7) {
    throw serviceError(400, 'INVALID_SCHEDULE', 'Envía el horario de los 7 días de la semana');
  }

  const clean = [];

  for (const day of days) {
    const dayOfWeek = day?.day_of_week;

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7 || clean.some((d) => d.day_of_week === dayOfWeek)) {
      throw serviceError(400, 'INVALID_SCHEDULE', 'Cada día (1 a 7) debe aparecer una sola vez');
    }

    if (typeof day.is_closed !== 'boolean') {
      throw serviceError(400, 'INVALID_SCHEDULE', 'is_closed debe ser true o false');
    }

    if (day.is_closed) {
      clean.push({ day_of_week: dayOfWeek, is_closed: true, open_time: null, close_time: null });
      continue;
    }

    if (!TIME_FORMAT.test(day.open_time || '') || !TIME_FORMAT.test(day.close_time || '')) {
      throw serviceError(400, 'INVALID_SCHEDULE', 'Las horas deben ser en punto o y media (HH:00 / HH:30)');
    }

    if (toMinutes(day.close_time) - toMinutes(day.open_time) < SLOT_MINUTES) {
      throw serviceError(400, 'INVALID_SCHEDULE', `El cierre debe ser al menos ${SLOT_MINUTES} minutos después de la apertura`);
    }

    clean.push({ day_of_week: dayOfWeek, is_closed: false, open_time: day.open_time, close_time: day.close_time });
  }

  await scheduleRepository.replaceForStore(storeId, clean);

  return await fetchByStore(storeId);
};
