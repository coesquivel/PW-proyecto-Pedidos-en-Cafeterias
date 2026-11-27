import { nowInLima, addDays, isoWeekday, toMinutes } from './lima_time.js';

// Las franjas de recojo duran 30 minutos; la última termina a la hora de cierre
export const SLOT_MINUTES = 30;

const hhmm = (time) => (time ? String(time).slice(0, 5) : null);

/**
 * Normaliza las filas de la base a los 7 días (lunes=1 ... domingo=7).
 * Un día sin fila cuenta como cerrado.
 */
export const normalizeSchedule = (rows = []) => {
  return [1, 2, 3, 4, 5, 6, 7].map((day) => {
    const row = rows.find((r) => r.day_of_week === day);

    if (!row || row.is_closed || !row.open_time || !row.close_time) {
      return { day_of_week: day, is_closed: true, open_time: null, close_time: null };
    }

    return {
      day_of_week: day,
      is_closed: false,
      open_time: hhmm(row.open_time),
      close_time: hhmm(row.close_time)
    };
  });
};

const dayOf = (schedule, date) => schedule.find((d) => d.day_of_week === isoWeekday(date));

/**
 * ¿La hora de recojo es una franja válida de ese día?
 * Debe ser en punto o y media, desde la apertura hasta 30 min antes del cierre.
 */
export const isValidSlot = (schedule, date, time) => {
  const day = dayOf(schedule, date);

  if (!day || day.is_closed) return false;

  const minutes = toMinutes(time);

  return (
    minutes % SLOT_MINUTES === 0 &&
    minutes >= toMinutes(day.open_time) &&
    minutes + SLOT_MINUTES <= toMinutes(day.close_time)
  );
};

/**
 * Estado del local ahora mismo y próxima apertura.
 * next_open: { days_ahead, day_of_week, time } (days_ahead 0 = hoy más tarde)
 */
export const storeStatus = (schedule, now = nowInLima()) => {
  const today = dayOf(schedule, now.date);

  const open_now =
    !today.is_closed &&
    now.minutes >= toMinutes(today.open_time) &&
    now.minutes < toMinutes(today.close_time);

  let next_open = null;

  if (!open_now) {
    for (let ahead = 0; ahead <= 7 && !next_open; ahead++) {
      const date = addDays(now.date, ahead);
      const day = dayOf(schedule, date);

      if (day.is_closed) continue;
      if (ahead === 0 && now.minutes >= toMinutes(day.open_time)) continue;

      next_open = { days_ahead: ahead, day_of_week: day.day_of_week, time: day.open_time };
    }
  }

  return { open_now, next_open };
};
