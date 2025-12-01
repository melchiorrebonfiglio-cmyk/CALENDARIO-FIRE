import React, { useMemo } from 'react';
import { Absence, AbsenceType } from '../types';
import { ABSENCE_TYPE_DISPLAY_ORDER, ABSENCE_TYPE_CARD_BG_COLORS, ABSENCE_TYPE_TEXT_COLORS, ABSENCE_TYPE_BORDERS } from '../constants';
import { getMonthYearText, getWorkingDaysInMonth, getWorkingHoursForDate, formatDate } from '../utils/dateUtils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  absences: Absence[];
}

const CloseIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, date, absences }) => {
  const monthAbsences = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const yearMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    
    return absences.filter(absence => {
      return absence.date.startsWith(yearMonthPrefix);
    });
  }, [absences, date]);

  const monthTotals = useMemo(() => {
    const initialTotals: Record<AbsenceType, number> = {
        [AbsenceType.SMART_WORKING]: 0,
        [AbsenceType.RU]: 0,
        [AbsenceType.FERIE]: 0,
        [AbsenceType.VISITA_MEDICA]: 0,
        [AbsenceType.SMART_WORKING_MANAGER]: 0,
        [AbsenceType.PRESENZA_UFFICIO]: 0,
    };
    return monthAbsences.reduce((acc, absence) => {
      acc[absence.type] = (acc[absence.type] || 0) + Number(absence.hours || 0);
      return acc;
    }, initialTotals);
  }, [monthAbsences]);

  const workingDaysInMonth = useMemo(() => {
    return getWorkingDaysInMonth(date.getFullYear(), date.getMonth());
  }, [date]);

  const mealTicketCount = useMemo(() => {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0-11

    // Determine the previous month for all calculations
    const firstDayPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = firstDayPrevMonth.getMonth();
    const prevMonthYear = firstDayPrevMonth.getFullYear();

    // Eligible days are the working days of the PREVIOUS month
    const eligibleDays = getWorkingDaysInMonth(prevMonthYear, prevMonth);

    let deductionDays = 0;
    const prevMonthDayIterator = new Date(firstDayPrevMonth);

    while (prevMonthDayIterator.getMonth() === prevMonth && prevMonthDayIterator.getFullYear() === prevMonthYear) {
         if (getWorkingHoursForDate(prevMonthDayIterator) > 0) {
            const formattedDay = formatDate(prevMonthDayIterator);
            const absenceHours = absences
                .filter(a => a.date === formattedDay && (a.type === AbsenceType.FERIE || a.type === AbsenceType.RU || a.type === AbsenceType.VISITA_MEDICA))
                .reduce((sum, a) => sum + a.hours, 0);

            if (absenceHours > 4) {
                deductionDays++;
            }
        }
        prevMonthDayIterator.setDate(prevMonthDayIterator.getDate() + 1);
    }
    
    const total = eligibleDays - deductionDays;

    return {
        eligible: eligibleDays,
        deductions: deductionDays,
        total: total
    };
  }, [date, absences]);


  if (!isOpen) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 id="report-title" className="text-xl font-bold text-gray-800 capitalize">
                Report Mensile: {getMonthYearText(date)}
            </h2>
            <button 
                onClick={onClose} 
                className="p-2 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Chiudi modale"
            >
                <CloseIcon className="w-6 h-6"/>
            </button>
        </div>
        
        <div className="p-6 space-y-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-white rounded-xl text-center border border-gray-200 shadow-sm">
                    <p className="text-base font-semibold text-indigo-700">Giorni Lavorativi Totali</p>
                    <p className="text-5xl font-extrabold text-indigo-900 mt-2">{workingDaysInMonth}</p>
                </div>
                
                 <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-base font-semibold text-lime-700 text-center mb-3">Conteggio Ticket Pasto</p>
                    <div className="grid grid-cols-3 gap-4 text-center items-center">
                        <div>
                            <p className="text-xs text-lime-600">Spettanti</p>
                            <p className="text-2xl font-bold text-lime-900">{mealTicketCount.eligible}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Assenze Mese Precedente</p>
                            <p className="text-2xl font-bold text-gray-800">{mealTicketCount.deductions}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Totale</p>
                            <p className="text-3xl font-extrabold text-gray-900">{mealTicketCount.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-2">
                <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Riepilogo Ore Mensili</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ABSENCE_TYPE_DISPLAY_ORDER.map(type => {
                        const usedInMonth = monthTotals[type] || 0;
                        return (
                            <div key={type} className={`p-4 rounded-lg flex justify-between items-center shadow-sm border-l-4 ${ABSENCE_TYPE_BORDERS[type]} ${ABSENCE_TYPE_CARD_BG_COLORS[type]}`}>
                                <div>
                                    <h4 className={`font-bold text-lg ${ABSENCE_TYPE_TEXT_COLORS[type]}`}>{type}</h4>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-bold ${ABSENCE_TYPE_TEXT_COLORS[type]}`}>{usedInMonth.toFixed(2)}h</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
        
        <div className="p-4 bg-gray-100 rounded-b-2xl flex justify-end border-t border-gray-200">
            <button 
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Chiudi
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;