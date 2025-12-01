import { useState, useEffect, useCallback } from 'react';
import { Absence, AbsenceType } from '../types';
import { getWorkingHoursForDate, formatDate, isHoliday } from '../utils/dateUtils';

const ABSENCES_KEY = 'work-calendar-absences';

export const useAbsences = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);

  useEffect(() => {
    try {
      const storedAbsences = localStorage.getItem(ABSENCES_KEY);
      if (storedAbsences) {
        setAbsences(JSON.parse(storedAbsences));
      }
    } catch (error) {
      console.error("Failed to load absences from localStorage", error);
    }
  }, []);

  const persistAbsences = (updatedAbsences: Absence[]) => {
    try {
      localStorage.setItem(ABSENCES_KEY, JSON.stringify(updatedAbsences));
    } catch (error) {
      console.error("Failed to save absences to localStorage", error);
    }
  };

  const addAbsence = useCallback((date: Date, type: AbsenceType, hours: number) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        alert("Non è possibile inserire giustificativi durante il weekend.");
        return;
    }

    if (isHoliday(date)) {
        alert("Non è possibile inserire giustificativi in un giorno festivo.");
        return;
    }
      
    const formattedDate = formatDate(date);
    const maxHoursForDay = getWorkingHoursForDate(date);
    
    const hoursOnDate = absences
      .filter(a => a.date === formattedDate)
      .reduce((sum, a) => sum + a.hours, 0);

    if (hoursOnDate + hours > maxHoursForDay) {
      alert(`Con questa aggiunta supereresti le ${maxHoursForDay} ore giornaliere per questa data.`);
      return;
    }

    const newAbsence: Absence = {
      id: `${Date.now()}-${Math.random()}`,
      date: formattedDate,
      type,
      hours: hours,
    };
    const updatedAbsences = [...absences, newAbsence];
    setAbsences(updatedAbsences);
    persistAbsences(updatedAbsences);
  }, [absences]);

  const removeAbsence = useCallback((absenceId: string) => {
    const updatedAbsences = absences.filter(a => a.id !== absenceId);
    setAbsences(updatedAbsences);
    persistAbsences(updatedAbsences);
  }, [absences]);
  
  const addAbsencesBatch = useCallback((absencesToAdd: { date: Date, type: AbsenceType, hours: number }[]) => {
    let addedCount = 0;
    let skippedCount = 0;
    const validAbsences: Absence[] = [];

    const groupedCurrentAbsences = absences.reduce((acc, curr) => {
        (acc[curr.date] = acc[curr.date] || []).push(curr);
        return acc;
    }, {} as Record<string, Absence[]>);

    const hoursToAddByDate = new Map<string, number>();

    for (const newAbsence of absencesToAdd) {
        if (!(newAbsence.date instanceof Date) || isNaN(newAbsence.date.getTime())) {
            console.warn("Skipping absence due to invalid date", newAbsence);
            skippedCount++;
            continue;
        }

        const date = newAbsence.date;
        const maxHours = getWorkingHoursForDate(date);
        
        if (maxHours === 0) {
            skippedCount++;
            continue;
        }

        const formattedDate = formatDate(date);
        
        const existingHours = (groupedCurrentAbsences[formattedDate] || []).reduce((sum, a) => sum + a.hours, 0);
        const batchHoursForDate = hoursToAddByDate.get(formattedDate) || 0;

        if (existingHours + batchHoursForDate + newAbsence.hours > maxHours) {
            skippedCount++;
            continue;
        }

        validAbsences.push({
            id: `${Date.now()}-${Math.random()}-${validAbsences.length}`,
            date: formattedDate,
            type: newAbsence.type,
            hours: newAbsence.hours,
        });
        
        hoursToAddByDate.set(formattedDate, batchHoursForDate + newAbsence.hours);
        addedCount++;
    }
    
    if (validAbsences.length > 0) {
        const updatedAbsences = [...absences, ...validAbsences];
        setAbsences(updatedAbsences);
        persistAbsences(updatedAbsences);
    }

    return { addedCount, skippedCount };

}, [absences]);

  const clearAllAbsences = useCallback(() => {
    setAbsences([]);
    persistAbsences([]);
  }, []);

  const replaceAllAbsences = useCallback((newAbsences: Absence[]) => {
    setAbsences(newAbsences);
    persistAbsences(newAbsences);
  }, []);


  return { absences, addAbsence, removeAbsence, addAbsencesBatch, clearAllAbsences, replaceAllAbsences };
};
