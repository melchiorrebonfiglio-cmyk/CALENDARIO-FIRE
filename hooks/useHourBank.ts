import { useState, useEffect, useCallback } from 'react';
import { HourBank, AbsenceType } from '../types';

const HOUR_BANK_KEY = 'work-calendar-hour-bank';

const initialBank: HourBank = {
    [AbsenceType.FERIE]: 0,
    [AbsenceType.RU]: 0,
    [AbsenceType.SMART_WORKING]: 0,
    [AbsenceType.VISITA_MEDICA]: 0,
    [AbsenceType.PRESENZA_UFFICIO]: 0,
};

export const useHourBank = () => {
    const [hourBank, setHourBank] = useState<HourBank>(initialBank);

    useEffect(() => {
        try {
            const storedBank = localStorage.getItem(HOUR_BANK_KEY);
            if (storedBank) {
                setHourBank(prev => ({ ...prev, ...JSON.parse(storedBank) }));
            }
        } catch (error) {
            console.error("Failed to load hour bank from localStorage", error);
        }
    }, []);

    const updateHourBank = useCallback((newBank: HourBank) => {
        const cleanedBank = { ...newBank };
        // Clean "-" from values before saving
        for (const key in cleanedBank) {
            // FIX: The value can be a string "-" from the input field during editing, which conflicts
            // with the `HourBank` type. Cast to `any` to allow the comparison and clean the data.
            if ((cleanedBank[key as AbsenceType] as any) === "-") {
                cleanedBank[key as AbsenceType] = 0;
            }
        }
        const updatedBank = { ...hourBank, ...cleanedBank };
        setHourBank(updatedBank);
        try {
            localStorage.setItem(HOUR_BANK_KEY, JSON.stringify(updatedBank));
        } catch (error) {
             console.error("Failed to save hour bank to localStorage", error);
        }
    }, [hourBank]);

    const replaceAllHourBank = useCallback((newBank: HourBank) => {
        setHourBank(newBank);
        try {
            localStorage.setItem(HOUR_BANK_KEY, JSON.stringify(newBank));
        } catch (error) {
             console.error("Failed to save hour bank to localStorage", error);
        }
    }, []);

    return { hourBank, updateHourBank, replaceAllHourBank };
};
