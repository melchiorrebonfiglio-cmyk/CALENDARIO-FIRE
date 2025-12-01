import { Absence, DayNote, HourBank } from '../types';

const ABSENCES_KEY = 'work-calendar-absences';
const NOTES_KEY = 'work-calendar-notes';
const HOUR_BANK_KEY = 'work-calendar-hour-bank';
const API_LATENCY = 500; // ms

// --- Helper function to simulate async operations ---
const simulateRequest = <T>(key: string, defaultValue: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          resolve(JSON.parse(storedValue));
        } else {
          resolve(defaultValue);
        }
      } catch (error) {
        console.error(`Failed to retrieve ${key} from localStorage`, error);
        reject(error);
      }
    }, API_LATENCY);
  });
};

const simulateSave = <T>(key: string, data: T): Promise<void> => {
   return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        resolve();
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage`, error);
        reject(error);
      }
    }, API_LATENCY / 2); // Make saves faster
  });
}

// --- Absences API ---
export const getAbsences = (): Promise<Absence[]> => {
  return simulateRequest<Absence[]>(ABSENCES_KEY, []);
};

export const saveAbsences = (absences: Absence[]): Promise<void> => {
  return simulateSave(ABSENCES_KEY, absences);
};

// --- Notes API ---
export const getNotes = (): Promise<DayNote[]> => {
  return simulateRequest<DayNote[]>(NOTES_KEY, []);
};

export const saveNotes = (notes: DayNote[]): Promise<void> => {
  return simulateSave(NOTES_KEY, notes);
};

// --- Hour Bank API ---
export const getHourBank = (): Promise<HourBank> => {
  return simulateRequest<HourBank>(HOUR_BANK_KEY, {});
};

export const saveHourBank = (hourBank: HourBank): Promise<void> => {
  return simulateSave(HOUR_BANK_KEY, hourBank);
};
