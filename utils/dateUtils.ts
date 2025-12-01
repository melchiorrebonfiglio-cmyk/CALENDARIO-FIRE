

export const getEasterDates = (year: number): Date[] => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easterSunday = new Date(year, month - 1, day);
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);
  return [easterSunday, easterMonday];
};

const HOLIDAY_NAMES: { [key: string]: string } = {
    '01-01': 'Capodanno',
    '01-06': 'Epifania',
    '04-25': 'Festa della Liberazione',
    '05-01': 'Festa del Lavoro',
    '06-02': 'Festa della Repubblica',
    '06-29': 'SS. Pietro e Paolo',
    '08-15': 'Ferragosto',
    '11-01': 'Ognissanti',
    '12-08': 'Immacolata Concezione',
    '12-25': 'Natale',
    '12-26': 'Santo Stefano',
};

export const getHolidayName = (date: Date): string | null => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    if (year >= 2026 && month === 10 && day === 4) {
        return 'San Francesco';
    }

    const dateString = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (HOLIDAY_NAMES[dateString]) {
        return HOLIDAY_NAMES[dateString];
    }

    const [easterSunday, easterMonday] = getEasterDates(year);
    
    // Normalize dates to midnight UTC to avoid timezone issues
    const cleanDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const cleanEasterSunday = new Date(Date.UTC(easterSunday.getFullYear(), easterSunday.getMonth(), easterSunday.getDate()));
    const cleanEasterMonday = new Date(Date.UTC(easterMonday.getFullYear(), easterMonday.getMonth(), easterMonday.getDate()));

    if (cleanDate.getTime() === cleanEasterSunday.getTime()) {
        return 'Pasqua';
    }
    if (cleanDate.getTime() === cleanEasterMonday.getTime()) {
        return 'Lunedì dell\'Angelo';
    }

    return null;
};


export const isHoliday = (date: Date): boolean => {
    return getHolidayName(date) !== null;
};


export const getWorkingHoursForDate = (date: Date): number => {
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  
  if (isHoliday(date)) {
      return 0;
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      return 0;
  }

  if (dayOfWeek === 5) { // Friday
    return 6;
  }
  
  return 8; // Monday to Thursday
};

export const getWorkingDaysInMonth = (year: number, month: number): number => {
    const date = new Date(year, month, 1);
    let workingDays = 0;
    while (date.getMonth() === month) {
        if (getWorkingHoursForDate(date) > 0) {
            workingDays++;
        }
        date.setDate(date.getDate() + 1);
    }
    return workingDays;
};

export const getRemainingWorkingDaysInYear = (fromDate: Date): number => {
  const year = fromDate.getFullYear();
  const endDate = new Date(year, 11, 31); // December 31st
  let currentDate = new Date(fromDate);
  currentDate.setHours(0, 0, 0, 0);

  let remainingDays = 0;

  while (currentDate <= endDate) {
    if (getWorkingHoursForDate(currentDate) > 0) {
      remainingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return remainingDays;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMonthYearText = (date: Date): string => {
  return date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
};

export const getCalendarDays = (year: number, month: number): Date[] => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = [];
  
  // Start day of the week (0=Sun, 1=Mon, ..., 6=Sat)
  // We want Monday to be the first day, so we adjust.
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Days from previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    const day = new Date(firstDayOfMonth);
    day.setDate(day.getDate() - (startDayOfWeek - i));
    daysInMonth.push(day);
  }

  // Days in current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(year, month, i));
  }

  // Days from next month to fill the grid
  const endDayOfWeek = (lastDayOfMonth.getDay() + 6) % 7;
  const daysToAdd = 6 - endDayOfWeek;
  for (let i = 1; i <= daysToAdd; i++) {
    const day = new Date(lastDayOfMonth);
    day.setDate(day.getDate() + i);
    daysInMonth.push(day);
  }
  
  // Ensure the grid has 6 rows (42 days) if needed
  while (daysInMonth.length < 42) {
      const lastDay = daysInMonth[daysInMonth.length - 1];
      const nextDay = new Date(lastDay);
      nextDay.setDate(nextDay.getDate() + 1);
      daysInMonth.push(nextDay);
  }

  return daysInMonth;
};