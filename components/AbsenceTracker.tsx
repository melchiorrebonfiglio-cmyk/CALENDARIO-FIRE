import React, { useState, useEffect, useMemo } from 'react';
import { AbsenceType, HourBank } from '../types';
import { ABSENCE_TYPE_DISPLAY_ORDER, ABSENCE_TYPE_BORDERS, ANNUAL_ACCRUAL_HOURS, ABSENCE_TYPE_CARD_BG_COLORS, ABSENCE_TYPE_TEXT_COLORS, AVERAGE_WORK_HOURS_PER_DAY } from '../constants';
import { AbsenceStats } from '../App';
import { getRemainingWorkingDaysInYear } from '../utils/dateUtils';

interface AbsenceTrackerProps {
  hourBank: HourBank;
  updateHourBank: (newBank: HourBank) => void;
  absenceStats: { [key in AbsenceType]?: AbsenceStats };
}

const EditIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const InfoIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);


const AbsenceTracker: React.FC<AbsenceTrackerProps> = ({ hourBank, updateHourBank, absenceStats }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableBank, setEditableBank] = useState<HourBank>(hourBank);
  const remainingWorkingDays = useMemo(() => getRemainingWorkingDaysInYear(new Date()), []);

  useEffect(() => {
    setEditableBank(hourBank);
  }, [hourBank]);
  
  const handleSave = () => {
    updateHourBank(editableBank);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
      setEditableBank(hourBank);
      setIsEditing(false);
  }

  const handleBankChange = (type: AbsenceType, value: string) => {
      if (value === "" || value === "-") {
        setEditableBank(prev => ({ ...prev, [type]: value === "-" ? "-" : 0 }));
        return;
      }
      const hours = parseFloat(value);
      if (!isNaN(hours)) {
          setEditableBank(prev => ({...prev, [type]: hours}));
      }
  };
  
  const MONTE_ORE_TYPES_EDITABLE = ABSENCE_TYPE_DISPLAY_ORDER.filter(t => 
    t !== AbsenceType.SMART_WORKING_MANAGER && t !== AbsenceType.PRESENZA_UFFICIO && !ANNUAL_ACCRUAL_HOURS[t]
  );
  
  const RESIDUO_AP_TYPES = ABSENCE_TYPE_DISPLAY_ORDER.filter(t => ANNUAL_ACCRUAL_HOURS[t]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">Riepilogo Ore</h2>
             <div className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full border border-slate-200">
                Giorni Lavorativi Mancanti: <span className="font-bold text-slate-900">{remainingWorkingDays}</span>
            </div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="text-gray-500 hover:text-indigo-600 transition-colors">
            <EditIcon className="w-6 h-6"/>
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Residuo Anno Precedente</h3>
                <div className="space-y-4">
                    {RESIDUO_AP_TYPES.map(type => (
                         <div key={type}>
                            <label htmlFor={`hours-${type}`} className="block text-sm font-medium text-gray-700">{type}</label>
                            <input
                                type="number"
                                id={`hours-${type}`}
                                step="0.01"
                                value={editableBank[type] || ''}
                                onChange={(e) => handleBankChange(type, e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                         </div>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Monte Ore</h3>
                <div className="space-y-4">
                    {MONTE_ORE_TYPES_EDITABLE.map(type => (
                         <div key={type}>
                            <label htmlFor={`hours-${type}`} className="block text-sm font-medium text-gray-700">{type}</label>
                            <input
                                type="number"
                                id={`hours-${type}`}
                                step="0.01"
                                value={editableBank[type] || ''}
                                onChange={(e) => handleBankChange(type, e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                         </div>
                    ))}
                </div>
            </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Annulla</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Salva</button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ABSENCE_TYPE_DISPLAY_ORDER.map(type => {
            const stats = absenceStats[type];
            if (!stats) return null;

            if (type === AbsenceType.SMART_WORKING_MANAGER || type === AbsenceType.PRESENZA_UFFICIO) {
              return (
                <div key={type} className={`p-4 rounded-lg shadow-sm ${ABSENCE_TYPE_CARD_BG_COLORS[type]} border-l-4 ${ABSENCE_TYPE_BORDERS[type]}`}>
                    <h3 className={`font-bold text-lg mb-2 ${ABSENCE_TYPE_TEXT_COLORS[type]}`}>{type}</h3>
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
                <div key={type} className={`p-4 rounded-lg shadow-sm ${ABSENCE_TYPE_CARD_BG_COLORS[type]} border-l-4 ${ABSENCE_TYPE_BORDERS[type]}`}>
                    <h3 className={`font-bold text-lg mb-3 ${ABSENCE_TYPE_TEXT_COLORS[type]}`}>{type}</h3>
                    <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 text-sm text-gray-700">
                        {/* Goduto / Pianificato */}
                        <span className="font-medium">Goduto:</span>
                        <span className="font-semibold text-right">{stats.goduto.toFixed(2)}h</span>
                        <span className="font-medium">Pianificato:</span>
                        <span className="font-semibold text-right">{stats.pianificato.toFixed(2)}h</span>
                        
                        <div className="col-span-2 border-t border-gray-200 my-2"></div>

                        {/* Residuo / Saldo */}
                        <div className="flex items-center space-x-1 relative group">
                            <span className="font-medium">Residuo:</span>
                            <InfoIcon className="w-4 h-4 text-gray-400"/>
                             <div className="absolute bottom-full left-0 mb-2 w-56 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {stats.isAccrued ? 'Totale Disponibile' : 'Monte Ore'} - Goduto
                            </div>
                        </div>
                        <span className="font-semibold text-right">{stats.residuo.toFixed(2)}h</span>
                        
                        <div className="flex items-center space-x-1 relative group">
                            <span className="font-bold text-emerald-700">
                                {type === AbsenceType.FERIE ? 'Saldo Fine Anno:' : 'Saldo:'}
                            </span>
                             <InfoIcon className="w-4 h-4 text-gray-400"/>
                             <div className="absolute bottom-full left-0 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {type === AbsenceType.FERIE
                                  ? 'Residuo AP + Spettanza Annuale (176h) - Goduto - Pianificato'
                                  : 'Residuo - Pianificato. Il tuo saldo effettivo per nuove pianificazioni.'}
                            </div>
                        </div>
                        <span className={`font-extrabold text-right ${stats.saldo < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{stats.saldo.toFixed(2)}h</span>
                        
                        <span className="font-bold text-indigo-700">Saldo (Giorni):</span>
                        <span className={`font-extrabold text-right ${stats.saldo < 0 ? 'text-red-600' : 'text-indigo-700'}`}>
                            {(stats.saldo / AVERAGE_WORK_HOURS_PER_DAY).toFixed(2)} gg
                        </span>

                        <div className="col-span-2 border-t border-gray-200 my-2"></div>
                        
                        {/* Monte Ore / Maturato Breakdown */}
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
       )}
    </div>
  );
};

export default AbsenceTracker;