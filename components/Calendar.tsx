

import React, { useMemo } from 'react';
import { Absence, AbsenceType, DayNote } from '../types';
import { DAY_NAMES, ABSENCE_TYPE_COLORS } from '../constants';
import { getCalendarDays, getMonthYearText, formatDate, getWorkingHoursForDate, isHoliday, getHolidayName, getWorkingDaysInMonth } from '../utils/dateUtils';

interface CalendarProps {
  absences: Absence[];
  notes: DayNote[];
  onDayClick: (date: Date) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDays: Date[];
}

const ChevronLeftIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const Calendar: React.FC<CalendarProps> = ({ absences, notes, onDayClick, currentDate, setCurrentDate, selectedDays }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);
  const workingDaysInCurrentMonth = useMemo(() => getWorkingDaysInMonth(year, month), [year, month]);
  
  const presenceStatsString = useMemo(() => {
    const yearMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const totalPresenceHours = absences
      .filter(absence => 
        absence.type === AbsenceType.PRESENZA_UFFICIO &&
        absence.date.startsWith(yearMonthPrefix)
      )
      .reduce((sum, absence) => sum + absence.hours, 0);

    if (totalPresenceHours === 0) {
      return '0 giorni';
    }

    const days = Math.floor(totalPresenceHours / 8);
    const remainingHours = totalPresenceHours % 8;

    const parts: string[] = [];
    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'giorno' : 'giorni'}`);
    }
    if (remainingHours > 0) {
      // Use toFixed to handle potential floating point inaccuracies
      parts.push(`${parseFloat(remainingHours.toFixed(2))}h`);
    }

    if (parts.length === 0) {
        return '0 giorni';
    }

    return parts.join(' e ');
  }, [year, month, absences]);

  const absencesMap = useMemo(() => {
    const map = new Map<string, Absence[]>();
    absences.forEach(absence => {
      const dayAbsences = map.get(absence.date) || [];
      dayAbsences.push(absence);
      map.set(absence.date, dayAbsences);
    });
    return map;
  }, [absences]);

  const unjustifiedDaysCount = useMemo(() => {
    return calendarDays.filter(day => {
        // Only count days within the currently viewed month.
        if (day.getMonth() !== month) return false;

        // Check if it's a working day with required hours.
        const totalHoursForDay = getWorkingHoursForDate(day);
        if (totalHoursForDay === 0) return false;

        // Calculate hours already covered by absences.
        const formattedDay = formatDate(day);
        const dayAbsences = absencesMap.get(formattedDay) || [];
        const usedHours = dayAbsences.reduce((sum, a) => sum + Number(a.hours || 0), 0);
        
        // If required hours are not fully covered, it's a day to justify.
        return (totalHoursForDay - usedHours) > 0;
    }).length;
  }, [calendarDays, absencesMap, month]);


  const notesMap = useMemo(() => {
    const map = new Map<string, DayNote>();
    notes.forEach(note => {
      map.set(note.date, note);
    });
    return map;
  }, [notes]);
  
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day: Date) => {
    onDayClick(day);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-indigo-50 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center p-4 bg-white rounded-t-2xl border-b border-indigo-100">
        <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 capitalize">{getMonthYearText(currentDate)}</h2>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2">
                <div className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full border border-indigo-200">
                    Giorni Lavorativi del Mese: <span className="font-bold text-indigo-900">{workingDaysInCurrentMonth}</span>
                </div>
                <div className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full border border-teal-200">
                    Giorni in Presenza: <span className="font-bold text-teal-900">{presenceStatsString}</span>
                </div>
                <div className="bg-rose-100 text-rose-800 text-sm font-medium px-3 py-1 rounded-full border border-rose-200">
                    Giorni da Giustificare: <span className="font-bold text-rose-900">{unjustifiedDaysCount}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">Oggi</button>
            <button onClick={handlePrevMonth} className="p-2 text-slate-500 rounded-full hover:bg-slate-200"><ChevronLeftIcon className="w-5 h-5"/></button>
            <button onClick={handleNextMonth} className="p-2 text-slate-500 rounded-full hover:bg-slate-200"><ChevronRightIcon className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px text-center font-semibold text-slate-600 text-sm py-2 px-2">
        {DAY_NAMES.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-px p-2">
        {calendarDays.map((day, index) => {
          const formattedDay = formatDate(day);
          const dayAbsences = absencesMap.get(formattedDay) || [];
          const dayNote = notesMap.get(formattedDay);
          const hasNote = dayNote && dayNote.text.trim() !== '';

          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.getTime() === today.getTime();
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isHolidayDay = isCurrentMonth && isHoliday(day);
          const holidayName = isHolidayDay ? getHolidayName(day) : null;
          const isClickable = isCurrentMonth && !isWeekend && !isHolidayDay;
          
          const isSelected = selectedDays.some(d => formatDate(d) === formatDate(day));

          const totalHoursForDay = getWorkingHoursForDate(day);
          const usedHours = dayAbsences.reduce((sum, a) => sum + Number(a.hours || 0), 0);
          const remainingHours = totalHoursForDay - usedHours;
          
          const isDayIncomplete = isCurrentMonth && !isWeekend && !isHolidayDay && remainingHours > 0;

          let dayClasses = `h-28 rounded-lg flex flex-col p-1.5 text-sm relative transition-colors duration-200 ease-in-out`;
          let dayNumberSpecificClasses = '';
          
          if (isCurrentMonth) {
            if (isSelected) {
              dayClasses += ' bg-indigo-200 ring-2 ring-indigo-500 ring-inset';
              dayNumberSpecificClasses = isWeekend || isHolidayDay ? 'text-indigo-900 font-bold' : 'text-indigo-800 font-bold';
            } else if (isHolidayDay) {
                dayClasses += ' bg-orange-100';
                dayNumberSpecificClasses = 'text-orange-700 font-bold';
            } else if (isWeekend) {
                 dayClasses += ' bg-orange-100';
                 dayNumberSpecificClasses = 'text-orange-800 font-semibold';
            } else if (isDayIncomplete) {
                dayClasses += ' bg-rose-200 hover:bg-rose-300';
                dayNumberSpecificClasses = 'font-semibold text-rose-800';
            } else {
                dayClasses += ' bg-green-200 hover:bg-green-300';
                dayNumberSpecificClasses = 'font-semibold text-gray-800';
            }
          } else {
            dayClasses += ' bg-gray-50 text-gray-400';
          }
          
          let wrapperCursorClass = '';
          if (!isClickable) {
              wrapperCursorClass = 'cursor-not-allowed';
          } else {
              wrapperCursorClass = 'cursor-pointer';
          }

          return (
            <div key={index} className={`relative group ${wrapperCursorClass}`} onClick={() => isClickable && handleDayClick(day)}>
              <div className={dayClasses}>
                <span className={`w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white font-bold' : dayNumberSpecificClasses}`}>
                  {day.getDate()}
                </span>
                {dayAbsences.length > 0 && isCurrentMonth && (
                  <div className="mt-1 flex-grow w-full flex flex-col space-y-0.5 overflow-hidden">
                    {dayAbsences.map(absence => (
                      <div key={absence.id} className={`rounded font-bold px-1.5 py-0.5 text-[10px] truncate ${ABSENCE_TYPE_COLORS[absence.type]}`}>
                        {absence.type === AbsenceType.SMART_WORKING ? 'SW' : absence.type} ({absence.hours}h)
                      </div>
                    ))}
                  </div>
                )}
                {isHolidayDay && holidayName && (
                  <div className="mt-1 flex-grow w-full flex items-center justify-center text-center">
                    <span className="text-orange-700 font-semibold text-xs leading-tight px-1">
                      {holidayName}
                    </span>
                  </div>
                )}
                {hasNote && isCurrentMonth && (
                    <div className="mt-auto text-center text-xs italic text-slate-600 pt-1 px-1 truncate" title={dayNote.text}>
                        {dayNote.text}
                    </div>
                )}
              </div>
              
              {/* Tooltip */}
              {isCurrentMonth && totalHoursForDay > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="text-left font-normal">
                        <p className="font-bold text-base border-b border-gray-600 pb-1 mb-2 capitalize">
                            {day.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric' })}
                            {holidayName && <span className="block text-sm font-normal text-orange-300">{holidayName}</span>}
                        </p>
                        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
                            <span>Lavorative:</span> <strong className="text-indigo-300 text-right">{totalHoursForDay.toFixed(2)}h</strong>
                            <span>Coperte:</span> <strong className="text-amber-300 text-right">{usedHours.toFixed(2)}h</strong>
                            <span>Rimanenti:</span> <strong className="text-emerald-300 text-right">{remainingHours.toFixed(2)}h</strong>
                        </div>

                        {dayAbsences.length > 0 && (
                        <>
                            <div className="mt-2 pt-2 border-t border-gray-600">
                            <p className="font-semibold mb-1">Giustificativi:</p>
                            <ul className="space-y-0.5">
                                {dayAbsences.map(a => (
                                <li key={a.id} className="text-xs flex items-center">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${ABSENCE_TYPE_COLORS[a.type].split(' ')[0]}`}></span>
                                    <span>{a.type}: <strong>{a.hours}h</strong></span>
                                </li>
                                ))}
                            </ul>
                            </div>
                        </>
                        )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
