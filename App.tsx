import React, { useState, useMemo } from 'react';
import Calendar from './components/Calendar';
import AbsenceTracker from './components/AbsenceTracker';
import DayDetailView from './components/DayDetailView';
import { useAbsences } from './hooks/useAbsences';
import { useHourBank } from './hooks/useHourBank';
import { formatDate, getWorkingHoursForDate } from './utils/dateUtils';
import ReportModal from './components/ReportModal';
import { Absence, AbsenceType, DayNote, HourBank } from './types';
import { ABSENCE_TYPE_DISPLAY_ORDER, ANNUAL_ACCRUAL_HOURS } from './constants';
import MultiDayAddPanel from './components/MultiDayAddPanel';
import { useNotes } from './hooks/useNotes';
import { usePassword } from './hooks/usePassword';
import PasswordProtection from './components/PasswordProtection';
import LoadingSpinner from './components/LoadingSpinner';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';


export interface AbsenceStats {
  monteOre: number;
  goduto: number;
  pianificato: number;
  residuo: number;
  saldo: number;
  isAccrued: boolean;
  residuoAP: number;
  maturato: number;
}

const ReportIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const CalendarDaysIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008zm-3 0h.008v.008H9v-.008zm6 0h.008v.008h-.008v-.008zm-3 3h.008v.008H12v-.008zm-3 0h.008v.008H9v-.008zm6 0h.008v.008h-.008v-.008z" />
    </svg>
);

const ChartBarIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const CloudDownIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l3-3m-3 3-3-3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);

const CloudUpIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);


const TrashIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.91 2.75 6 3.664 6 4.834v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const useAbsenceStats = (absences: Absence[], hourBank: HourBank, currentCalendarDate: Date) => {
    return useMemo(() => {
        const today = formatDate(new Date());
        const result: { [key in AbsenceType]?: AbsenceStats } = {};

        for (const type of ABSENCE_TYPE_DISPLAY_ORDER) {
            const absencesForType = absences.filter(a => a.type === type);
            
            const goduto = absencesForType
                .filter(a => a.date <= today)
                .reduce((sum, a) => sum + a.hours, 0);
            
            const pianificato = absencesForType
                .filter(a => a.date > today)
                .reduce((sum, a) => sum + a.hours, 0);

            if (type === AbsenceType.SMART_WORKING_MANAGER || type === AbsenceType.PRESENZA_UFFICIO) {
                result[type] = { monteOre: 0, goduto, pianificato, residuo: 0, saldo: 0, isAccrued: false, residuoAP: 0, maturato: 0 };
                continue;
            }

            let monteOre = 0;
            let isAccrued = false;
            let residuoAP = 0;
            let maturato = 0;

            const annualHours = ANNUAL_ACCRUAL_HOURS[type];
            if (annualHours) {
                const currentMonth = currentCalendarDate.getMonth() + 1; // 1-12
                residuoAP = hourBank[type] || 0;
                
                if (type === AbsenceType.FERIE || type === AbsenceType.RU) {
                    maturato = annualHours;
                } else { // For other potential monthly accruing types
                    maturato = (annualHours / 12) * currentMonth;
                }
                
                monteOre = residuoAP + maturato;
                isAccrued = true;
            } else {
                monteOre = hourBank[type] || 0;
            }
            
            const residuo = monteOre - goduto;
            const saldo = monteOre - goduto - pianificato;

            result[type] = { monteOre, goduto, pianificato, residuo, saldo, isAccrued, residuoAP, maturato };
        }
        return result;
    }, [absences, hourBank, currentCalendarDate]);
};


const App: React.FC = () => {
  const { isAuthenticated, isPasswordSet, isLoading: isAuthLoading, login, setPassword } = usePassword();
  const { absences, addAbsence, removeAbsence, addAbsencesBatch, clearAllAbsences, replaceAllAbsences } = useAbsences();
  const { hourBank, updateHourBank, replaceAllHourBank } = useHourBank();
  const { notes, updateNote, replaceAllNotes } = useNotes();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRangeSelectionMode, setIsRangeSelectionMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [currentPage, setCurrentPage] = useState<'calendar' | 'summary'>('calendar');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  
  const absenceStats = useAbsenceStats(absences, hourBank, currentCalendarDate);

  const handleBackToCalendar = () => {
    setSelectedDate(null);
  };
  
  const clearSelection = () => {
    setSelectedDays([]);
  };

  const handleCalendarDayClick = (date: Date) => {
    if (isRangeSelectionMode) {
      const formattedDate = formatDate(date);
      const isAlreadySelected = selectedDays.some(d => formatDate(d) === formattedDate);

      if (isAlreadySelected) {
        setSelectedDays(prev => prev.filter(d => formatDate(d) !== formattedDate));
      } else {
        setSelectedDays(prev => [...prev, date].sort((a, b) => a.getTime() - b.getTime()));
      }
    } else {
      setSelectedDate(date);
    }
  };

  const addAbsencesForSelectedDays = (type: AbsenceType) => {
    if (selectedDays.length === 0) return;

    const absencesToAdd = selectedDays.map(day => ({
      date: day,
      type,
      hours: getWorkingHoursForDate(day)
    })).filter(absence => absence.hours > 0);
    
    if (absencesToAdd.length > 0) {
      addAbsencesBatch(absencesToAdd);
    }

    clearSelection();
  };

  const toggleRangeSelectionMode = () => {
    const newMode = !isRangeSelectionMode;
    setIsRangeSelectionMode(newMode);
    setSelectedDate(null);
    clearSelection();
    if (newMode) {
        setCurrentPage('calendar');
    }
  };
  
  const showSyncMessage = (message: string, duration: number = 3000) => {
    setSyncMessage(message);
    setTimeout(() => setSyncMessage(''), duration);
  };

  const handleSaveToCloud = async () => {
    if (isSyncing) return;
    if (!absences.length && !notes.length && Object.values(hourBank).every(v => !v || v === 0)) {
      alert("Nessun dato locale da salvare.");
      return;
    }

    setIsSyncing(true);
    setSyncMessage('Salvataggio nel cloud...');

    try {
      const dataToSave = {
        absences,
        notes,
        hourBank,
        lastUpdated: Timestamp.now()
      };

      // Using a fixed document ID. For a multi-user app, this should be dynamic (e.g., user UID).
      const dataDocRef = doc(db, "userData", "mainData");
      await setDoc(dataDocRef, dataToSave);
      showSyncMessage('Dati salvati con successo nel cloud!', 3000);
    } catch (error) {
      console.error("Errore durante il salvataggio su Firebase:", error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto.';
      showSyncMessage(`Errore di salvataggio: ${errorMessage}`, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (isSyncing) return;
    if (!window.confirm("Sei sicuro di voler caricare i dati dal cloud? Tutti i dati locali non salvati verranno SOVRASCRITTI. Questa azione è irreversibile.")) {
      return;
    }

    setIsSyncing(true);
    setSyncMessage('Caricamento dati dal cloud...');

    try {
      const dataDocRef = doc(db, "userData", "mainData");
      const docSnap = await getDoc(dataDocRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data();

        // Basic validation
        if (cloudData && 'absences' in cloudData && 'notes' in cloudData && 'hourBank' in cloudData) {
          replaceAllAbsences(cloudData.absences || []);
          replaceAllNotes(cloudData.notes || []);
          replaceAllHourBank(cloudData.hourBank || {});
          showSyncMessage('Dati caricati con successo dal cloud!', 3000);
          setCurrentCalendarDate(new Date()); // Refresh calendar
        } else {
          throw new Error("Il formato dei dati nel cloud non è valido.");
        }
      } else {
        showSyncMessage('Nessun dato trovato nel cloud. Salva prima i tuoi dati.', 4000);
      }
    } catch (error) {
      console.error("Errore durante il caricamento da Firebase:", error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto.';
      showSyncMessage(`Errore di caricamento: ${errorMessage}`, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  
  const handleClearAllAbsences = () => {
      if (window.confirm("Sei sicuro di voler cancellare tutti i giustificativi e le ore inserite? L'azione è irreversibile.")) {
          clearAllAbsences();
      }
  }

  if (isAuthLoading) {
      return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
      return (
          <PasswordProtection 
              isPasswordSet={isPasswordSet}
              onLogin={login}
              onSetPassword={setPassword}
          />
      );
  }

  return (
    <>
      <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {currentPage === 'calendar' ? 'Gestore Calendario' : 'Riepilogo Ore'}
                </h1>
                
                {!selectedDate && (
                    <div className="flex items-center space-x-2">
                        {currentPage === 'calendar' ? (
                          <>
                            <button
                                onClick={() => { setCurrentPage('summary'); setSelectedDate(null); }}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                            >
                                <ChartBarIcon className="w-5 h-5"/>
                                <span className="hidden md:inline">Vedi il Riepilogo Annuale</span>
                            </button>
                            <button
                                onClick={toggleRangeSelectionMode}
                                className={`flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm ${
                                    isRangeSelectionMode 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <CalendarDaysIcon className="w-5 h-5"/>
                                <span className="hidden md:inline">Selezione Multipla Giorni</span>
                            </button>
                             <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <ReportIcon className="w-5 h-5"/>
                                <span className="hidden md:inline">Report Mensile</span>
                            </button>

                             <div className="flex items-center space-x-2 border-2 border-gray-900 rounded-lg p-1.5 relative">
                                {(isSyncing || syncMessage) && (
                                    <div className="absolute inset-0 bg-gray-900 bg-opacity-80 rounded-md flex items-center justify-center z-10 p-2 transition-opacity duration-300">
                                        <p className="text-white text-sm font-semibold text-center">{syncMessage}</p>
                                    </div>
                                )}
                                <button
                                    onClick={handleLoadFromCloud}
                                    disabled={isSyncing}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-md disabled:bg-emerald-400 disabled:cursor-wait"
                                >
                                    <CloudDownIcon className="w-5 h-5"/>
                                    <span className="hidden md:inline">Carica dal Cloud</span>
                                </button>
                                <button
                                    onClick={handleSaveToCloud}
                                    disabled={isSyncing}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors rounded-md disabled:bg-sky-400 disabled:cursor-wait"
                                >
                                    <CloudUpIcon className="w-5 h-5"/>
                                    <span className="hidden md:inline">Salva nel Cloud</span>
                                </button>
                                <button
                                    onClick={handleClearAllAbsences}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-amber-900 rounded-md hover:bg-amber-950 transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                    <span>Elimina i dati</span>
                                </button>
                            </div>
                          </>
                        ) : (
                             <button
                                onClick={() => { setCurrentPage('calendar'); setSelectedDate(null); }}
                                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <CalendarDaysIcon className="w-5 h-5 mr-2"/>
                                <span>Torna al Calendario</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
          </header>

          <main>
            {selectedDate ? (
              <DayDetailView 
                date={selectedDate}
                absences={absences.filter(a => a.date === formatDate(selectedDate))}
                addAbsence={addAbsence}
                removeAbsence={removeAbsence}
                onBack={handleBackToCalendar}
                absenceStats={absenceStats}
                notes={notes}
                updateNote={updateNote}
              />
            ) : currentPage === 'calendar' ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Calendar 
                      absences={absences}
                      notes={notes}
                      onDayClick={handleCalendarDayClick}
                      currentDate={currentCalendarDate}
                      setCurrentDate={setCurrentCalendarDate}
                      selectedDays={selectedDays}
                    />
                  </div>
                  <div className="lg:col-span-1">
                      {isRangeSelectionMode && (
                          <MultiDayAddPanel
                              selectedDays={selectedDays}
                              onAdd={addAbsencesForSelectedDays}
                              onClear={clearSelection}
                          />
                      )}
                  </div>
                </div>
              </>
            ) : (
                <>
                  <div className="max-w-7xl mx-auto">
                      <AbsenceTracker 
                          hourBank={hourBank}
                          updateHourBank={updateHourBank}
                          absenceStats={absenceStats}
                      />
                  </div>
              </>
            )}
          </main>
        </div>
      </div>
      
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        date={currentCalendarDate}
        absences={absences}
      />
    </>
  );
};

export default App;