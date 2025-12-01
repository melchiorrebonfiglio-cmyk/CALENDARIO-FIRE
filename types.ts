export enum AbsenceType {
  SMART_WORKING = 'SMART WORKING',
  RU = 'RU',
  FERIE = 'FERIE',
  SMART_WORKING_MANAGER = 'SMART WORKING MANAGER',
  VISITA_MEDICA = 'VISITA MEDICA',
  PRESENZA_UFFICIO = 'PRESENZA UFFICIO',
}

export interface Absence {
  id: string;
  date: string; // YYYY-MM-DD format
  type: AbsenceType;
  hours: number;
}

export interface DayNote {
  date: string; // YYYY-MM-DD format
  text: string;
}

export type HourBank = {
  [key in AbsenceType]?: number;
};