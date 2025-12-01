import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Absence, AbsenceType, DayNote } from '../types';
import { ABSENCE_TYPE_COLORS, ABSENCE_TYPE_DISPLAY_ORDER, ABSENCE_TYPE_BORDERS, ABSENCE_TYPE_CARD_BG_COLORS, ABSENCE_TYPE_TEXT_COLORS } from '../constants';
import { getWorkingHoursForDate, isHoliday, getHolidayName, formatDate } from '../utils/dateUtils';
import { AbsenceStats } from '../App';

interface DayDetailViewProps {
  date: Date;
  absences: Absence[];
  notes: DayNote[];
  addAbsence: (date: Date, type: AbsenceType, hours: number) => void;
  removeAbsence: (absenceId: string) => void;
  updateNote: (date: Date, text: string) => void;
  onBack: () => void;
  absenceStats: { [key in AbsenceType]?: AbsenceStats };
}

const BackIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const TrashIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.91 2.75 6 3.664 6 4.834v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const InfoIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);


const DayDetailView: React.FC<DayDetailViewProps> = ({ date, absences, notes, addAbsence, removeAbsence, updateNote, onBack, absenceStats }) => {
  const maxHoursForDay = getWorkingHoursForDate(date);
  
  const remainingHoursToday = useMemo(() => {
    const hoursOnDate = absences.reduce((sum, a) => sum + a.hours, 0);
    return maxHoursForDay - hoursOnDate;
  }, [absences, maxHoursForDay]);

  const [hours, setHours] = useState(remainingHoursToday);
  
  const noteForDay = useMemo(() => notes.find(n => n.date === formatDate(date)), [notes, date]);
  const [noteText, setNoteText] = useState('');
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    setHours(remainingHoursToday);
  }, [remainingHoursToday]);
  
  useEffect(() => {
    setNoteText(noteForDay?.text || '');
  }, [noteForDay]);

  const handleAdd = (type: AbsenceType) => {
    const numericHours = Number(hours);
    if (numericHours <= 0 || numericHours > remainingHoursToday) {
      alert(`Puoi aggiungere da 0.01 a ${remainingHoursToday} ore per questo giorno.`);
      return;
    }
    
    // La validazione del saldo è stata rimossa per consentire valori negativi
    addAbsence(date, type, numericHours);
  };
  
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNoteText(newText);

    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
        updateNote(date, newText);
    }, 500); // 500ms debounce
  };

  useEffect(() => {
    return () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    };
  }, []);

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isHolidayDay = isHoliday(date);
  const holidayName = isHolidayDay ? getHolidayName(date) : null;
  const isFriday = !isWeekend && !isHolidayDay && date.getDay() === 5;

  const buttonColors: {[key in AbsenceType]: string} = {
      [AbsenceType.SMART_WORKING]: "bg-sky-500 hover:bg-sky-600 text-white",
      [AbsenceType.RU]: "bg-emerald-500 hover:bg-emerald-600 text-white",
      [AbsenceType.FERIE]: "bg-amber-500 hover:bg-amber-600 text-white",
      [AbsenceType.VISITA_MEDICA]: "bg-purple-500 hover:bg-purple-600 text-white",
      [AbsenceType.SMART_WORKING_MANAGER]: "bg-teal-500 hover:bg-teal-600 text-white",
      [AbsenceType.PRESENZA_UFFICIO]: "bg-slate-500 hover:bg-slate-600 text-white",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 mr-4 text-gray-500 rounded-full hover:bg-gray-100">
                    <BackIcon className="w-6 h-6"/>
                </button>
                <div>
                     <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h2>
                    {isFriday && <p className="text-sm text-indigo-600 font-semibold">Orario lavorativo per Venerdì: 6 ore</p>}
                    {isWeekend && <p className="text-amber-600 font-semibold">Weekend</p>}
                    {isHolidayDay && <p className="text-red-600 font-semibold">Giorno Festivo: {holidayName}</p>}
                </div>
            </div>
            
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Giustificativi del Giorno</h3>
                {absences.length > 0 ? (
                    <div className="space-y-2">
                        {absences.map(absence => (
                             <div key={absence.id} className={`rounded-lg p-3 flex justify-between items-center text-gray-800 ${ABSENCE_TYPE_COLORS[absence.type]}`}>
                                <div>
                                    <span className="font-bold">{absence.type}</span>
                                    <span className="ml-2 text-sm opacity-90">({absence.hours} ore)</span>
                                </div>
                                <button onClick={() => removeAbsence(absence.id)} className="opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                             </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Nessun giustificativo per oggi.</p>
                )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Note / Promemoria del Giorno</h3>
                <textarea
                    value={noteText}
                    onChange={handleNoteChange}
                    placeholder="Aggiungi un promemoria per questo giorno..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    rows={4}
                    aria-label="Note del giorno"
                />
                <p className="text-xs text-right text-gray-500 mt-1 italic">Le note vengono salvate automaticamente.</p>
            </div>


            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Riepilogo Monte Ore</h3>
               <div className="space-y-4">
                {ABSENCE_TYPE_DISPLAY_ORDER.map(type => {
                    const stats = absenceStats[type];
                    if (!stats) return null;

                    if (type === AbsenceType.SMART_WORKING_MANAGER) {
                      return (
                        <div key={type} className={`p-3 rounded-lg ${ABSENCE_TYPE_CARD_BG_COLORS[type]} border-l-4 ${ABSENCE_TYPE_BORDERS[type]}`}>
                            <h4 className={`font-bold text-md mb-2 ${ABSENCE_TYPE_TEXT_COLORS[type]}`}>{type}</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
                               <span className="font-medium">Godute:</span>
                               <span className="font-semibold text-right">{stats.goduto.toFixed(2)}h</span>
                               <span className="font-medium">Pianificate:</span>
                               <span className="font-semibold text-right">{stats.pianificato.toFixed(2)}h</span>
                            </div>
                        </div>
                      );
                    }

                    return (
                        <div key={type} className={`p-3 rounded-lg ${ABSENCE_TYPE_CARD_BG_COLORS[type]} border-l-4 ${ABSENCE_TYPE_BORDERS[type]}`}>
                            <h4 className={`font-bold text-md mb-2 ${ABSENCE_TYPE_TEXT_COLORS[type]}`}>{type}</h4>
                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-xs text-gray-700">
                                <span className="font-medium">Goduto:</span>
                                <span className="font-semibold text-right">{stats.goduto.toFixed(2)}h</span>
                                <span className="font-medium">Pianificato:</span>
                                <span className="font-semibold text-right">{stats.pianificato.toFixed(2)}h</span>
                                <div className="col-span-2 border-t border-gray-200 my-1"></div>
                                <span className="font-bold text-emerald-700">
                                    {type === AbsenceType.FERIE ? 'Saldo Fine Anno:' : 'Saldo:'}
                                </span>
                                <span className={`font-extrabold text-right ${stats.saldo < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{stats.saldo.toFixed(2)}h</span>
                                 <div className="col-span-2 border-t border-gray-200 my-1"></div>
                                {stats.isAccrued ? (
                                <>
                                    <span className="font-medium text-gray-500">Residuo AP:</span>
                                    <span className="font-semibold text-right text-gray-500">{stats.residuoAP.toFixed(2)}h</span>
                                    <span className="font-medium text-gray-500">{type === AbsenceType.FERIE || type === AbsenceType.RU ? 'Spettanza Annuale:' : 'Spettanti:'}</span>
                                    <span className="font-semibold text-right text-gray-500">{stats.maturato.toFixed(2)}h</span>
                                    <div className="col-span-2 border-t border-gray-300 my-1"></div>
                                    <span className="font-medium">Totale Disponibile:</span>
                                    <span className="font-bold text-right">{stats.monteOre.toFixed(2)}h</span>
                                </>
                                ) : (
                                    <>
                                        <span className="font-medium">Monte Ore:</span>
                                        <span className="font-bold text-right">{stats.monteOre.toFixed(2)}h</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>
        </div>
        
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Aggiungi Giustificativo</h3>
            
            {isWeekend ? <p className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">Non è possibile aggiungere giustificativi nel weekend.</p> :
            isHolidayDay ? <p className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">Non è possibile aggiungere giustificativi in un giorno festivo.</p> :
            remainingHoursToday > 0 ? (
                <>
                    <div className="mb-4">
                      <label htmlFor="hours-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Ore (rimanenti per oggi: {remainingHoursToday})
                      </label>
                      <input
                        id="hours-input"
                        type="number"
                        step="0.01"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        min="0.01"
                        max={remainingHoursToday}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-3">
                        {ABSENCE_TYPE_DISPLAY_ORDER.map((type) => {
                            const stats = absenceStats[type];
                            if (!stats) return null;
                            
                            return (
                                <div key={type} className="relative">
                                    <button
                                      onClick={() => handleAdd(type)}
                                      className={`w-full text-left p-4 rounded-lg font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColors[type]}`}
                                    >
                                      Aggiungi {type}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                 <p className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">Non ci sono ore rimanenti per questo giorno.</p>
            )}
        </div>
    </div>
  );
};

export default DayDetailView;