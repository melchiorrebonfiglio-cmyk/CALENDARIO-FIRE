import { AbsenceType } from './types';

export const ABSENCE_TYPE_COLORS: { [key in AbsenceType]: string } = {
  [AbsenceType.SMART_WORKING]: 'bg-sky-100 text-sky-800',
  [AbsenceType.RU]: 'bg-emerald-600 text-white',
  [AbsenceType.FERIE]: 'bg-amber-100 text-amber-800',
  [AbsenceType.VISITA_MEDICA]: 'bg-purple-100 text-purple-800',
  [AbsenceType.SMART_WORKING_MANAGER]: 'bg-teal-100 text-teal-800',
  [AbsenceType.PRESENZA_UFFICIO]: 'bg-slate-100 text-slate-800',
};

export const ABSENCE_TYPE_BORDERS: { [key in AbsenceType]: string } = {
    [AbsenceType.SMART_WORKING]: 'border-sky-500',
    [AbsenceType.RU]: 'border-emerald-600',
    [AbsenceType.FERIE]: 'border-amber-500',
    [AbsenceType.VISITA_MEDICA]: 'border-purple-500',
    [AbsenceType.SMART_WORKING_MANAGER]: 'border-teal-500',
    [AbsenceType.PRESENZA_UFFICIO]: 'border-slate-500',
};

export const ABSENCE_TYPE_TEXT_COLORS: { [key in AbsenceType]: string } = {
  [AbsenceType.SMART_WORKING]: 'text-sky-700',
  [AbsenceType.RU]: 'text-emerald-800',
  [AbsenceType.FERIE]: 'text-amber-700',
  [AbsenceType.VISITA_MEDICA]: 'text-purple-700',
  [AbsenceType.SMART_WORKING_MANAGER]: 'text-teal-700',
  [AbsenceType.PRESENZA_UFFICIO]: 'text-slate-700',
};

export const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const ABSENCE_TYPE_DISPLAY_ORDER: AbsenceType[] = [
  AbsenceType.SMART_WORKING,
  AbsenceType.RU,
  AbsenceType.PRESENZA_UFFICIO,
  AbsenceType.FERIE,
  AbsenceType.SMART_WORKING_MANAGER,
  AbsenceType.VISITA_MEDICA,
];

export const ANNUAL_ACCRUAL_HOURS: { [key in AbsenceType]?: number } = {
  [AbsenceType.FERIE]: 176,
  [AbsenceType.RU]: 104,
};

export const ABSENCE_TYPE_CARD_BG_COLORS: { [key in AbsenceType]: string } = {
  [AbsenceType.SMART_WORKING]: 'bg-sky-50',
  [AbsenceType.RU]: 'bg-emerald-50',
  [AbsenceType.FERIE]: 'bg-amber-50',
  [AbsenceType.VISITA_MEDICA]: 'bg-purple-50',
  [AbsenceType.SMART_WORKING_MANAGER]: 'bg-teal-50',
  [AbsenceType.PRESENZA_UFFICIO]: 'bg-slate-50',
};

export const AVERAGE_WORK_HOURS_PER_DAY = 7.6;