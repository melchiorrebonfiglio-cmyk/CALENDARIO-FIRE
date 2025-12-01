import { useState, useEffect, useCallback } from 'react';
import { DayNote } from '../types';
import { formatDate } from '../utils/dateUtils';

const NOTES_KEY = 'work-calendar-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<DayNote[]>([]);

  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(NOTES_KEY);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
  }, []);

  const persistNotes = (updatedNotes: DayNote[]) => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  };

  const updateNote = useCallback((date: Date, text: string) => {
    const formattedDate = formatDate(date);
    
    setNotes(prevNotes => {
      const noteExists = prevNotes.some(n => n.date === formattedDate);
      const trimmedText = text.trim();
      let updatedNotes;

      if (trimmedText === '') {
        // If text is empty, remove the note if it exists
        updatedNotes = prevNotes.filter(n => n.date !== formattedDate);
      } else if (noteExists) {
        // If note exists, update it
        updatedNotes = prevNotes.map(n => 
          n.date === formattedDate ? { ...n, text: text } : n
        );
      } else {
        // If note doesn't exist, add it
        updatedNotes = [...prevNotes, { date: formattedDate, text: text }];
      }
      
      // Persist changes synchronously
      persistNotes(updatedNotes);
      return updatedNotes;
    });
  }, []);

  const importNotes = useCallback((notesToImport: DayNote[]) => {
    if (notesToImport.length === 0) return;

    setNotes(prevNotes => {
        const notesMap = new Map<string, string>();
        
        prevNotes.forEach(note => notesMap.set(note.date, note.text));
        
        notesToImport.forEach(note => {
            const trimmedText = note.text ? note.text.trim() : '';
            if (trimmedText !== '') {
                notesMap.set(note.date, trimmedText);
            } else {
                notesMap.delete(note.date);
            }
        });

        const updatedNotes: DayNote[] = Array.from(notesMap, ([date, text]) => ({ date, text }));
        persistNotes(updatedNotes);
        return updatedNotes;
    });
  }, []);

  const replaceAllNotes = useCallback((newNotes: DayNote[]) => {
    setNotes(newNotes);
    persistNotes(newNotes);
  }, []);

  return { notes, updateNote, importNotes, replaceAllNotes };
};
