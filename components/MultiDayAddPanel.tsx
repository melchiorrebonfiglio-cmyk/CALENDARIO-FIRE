import React from 'react';
import { AbsenceType } from '../types';
import { ABSENCE_TYPE_DISPLAY_ORDER } from '../constants';

interface MultiDayAddPanelProps {
  selectedDays: Date[];
  onAdd: (type: AbsenceType) => void;
  onClear: () => void;
}

const MultiDayAddPanel: React.FC<MultiDayAddPanelProps> = ({ selectedDays, onAdd, onClear }) => {
  const canAdd = selectedDays.length > 0;

  const buttonColors: {[key in AbsenceType]: string} = {
      [AbsenceType.SMART_WORKING]: "bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300",
      [AbsenceType.RU]: "bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300",
      [AbsenceType.FERIE]: "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300",
      [AbsenceType.VISITA_MEDICA]: "bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300",
      [AbsenceType.SMART_WORKING_MANAGER]: "bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300",
      [AbsenceType.PRESENZA_UFFICIO]: "bg-slate-500 hover:bg-slate-600 disabled:bg-slate-300",
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800">Aggiungi Giustificativo Multiplo</h2>
      <p className="mt-2 text-sm text-gray-600">Clicca sui singoli giorni nel calendario per selezionarli. Puoi selezionare anche giorni non consecutivi.</p>
      
      <div className="my-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
        <p className="font-semibold text-indigo-800 text-lg">
          {selectedDays.length > 0
            ? `${selectedDays.length} ${selectedDays.length === 1 ? 'giorno selezionato' : 'giorni selezionati'}`
            : 'Nessun giorno selezionato'
          }
        </p>
      </div>
      
      <div className="space-y-3 flex-grow">
        <p className="text-sm font-medium text-gray-700 mb-2">Aggiungi per i giorni lavorativi selezionati:</p>
        {ABSENCE_TYPE_DISPLAY_ORDER.map((type) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            disabled={!canAdd}
            className={`w-full p-3 rounded-lg font-semibold text-white transition-colors ${buttonColors[type]} disabled:cursor-not-allowed`}
          >
            Aggiungi {type}
          </button>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <button 
            onClick={onClear} 
            className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
            Annulla Selezione
        </button>
      </div>
    </div>
  );
};

export default MultiDayAddPanel;
