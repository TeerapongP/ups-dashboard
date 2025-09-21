import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface BeautifulDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  dateFormat?: string;  // 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd' | 'dd-MM-yyyy'
  minDate?: Date;
  maxDate?: Date;
  isClearable?: boolean;
}

// ---------- Utilities (ทำงานแบบ local time ล้วน) ----------
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const clampToDay = (d: Date | undefined | null) => (d ? startOfDay(d) : undefined);

const formatLocalDate = (date: Date | null, fmt: string) => {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  switch (fmt) {
    case 'MM/dd/yyyy': return `${mm}/${dd}/${yyyy}`;
    case 'yyyy-MM-dd': return `${yyyy}-${mm}-${dd}`;
    case 'dd-MM-yyyy': return `${dd}-${mm}-${yyyy}`;
    default:           return `${dd}/${mm}/${yyyy}`; // 'dd/MM/yyyy'
  }
};

export const BeautifulDatePicker: React.FC<BeautifulDatePickerProps> = ({
  selectedDate,
  onChange,
  placeholder = 'เลือกวันที่',
  className = '',
  disabled = false,
  dateFormat = 'dd/MM/yyyy',
  minDate,
  maxDate,
  isClearable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // เก็บเดือน/ปีปัจจุบันของปฏิทิน โดย normalize เป็น startOfDay
  const initial = selectedDate ? startOfDay(selectedDate) : startOfDay(new Date());
  const [currentMonth, setCurrentMonth] = useState<number>(initial.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(initial.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
  ];
  const daysOfWeek = ['อา','จ','อ','พ','พฤ','ศ','ส'];

  // close เมื่อคลิกนอก
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // sync เดือน/ปี เมื่อ parent เปลี่ยน selectedDate ภายหลัง
  useEffect(() => {
    if (selectedDate) {
      const s = startOfDay(selectedDate);
      setCurrentMonth(s.getMonth());
      setCurrentYear(s.getFullYear());
    }
  }, [selectedDate]);

  // helpers for calendar
  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

  const fmt = (date: Date | null) => formatLocalDate(date, dateFormat);

  const minD = clampToDay(minDate) || undefined;
  const maxD = clampToDay(maxDate) || undefined;

  const isDateDisabled = (d: Date) => {
    const sd = startOfDay(d);
    if (minD && sd < minD) return true;
    if (maxD && sd > maxD) return true;
    return false;
  };

  const handleDateSelect = (day: number) => {
    const picked = new Date(currentYear, currentMonth, day); // local, 00:00
    if (isDateDisabled(picked)) return;
    // ส่งค่าแบบ local start-of-day (ไม่มีการใช้ toISOString ป้องกันโดนเลื่อนวัน)
    onChange(startOfDay(picked));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  const canNavigatePrev = () => {
    if (!minD) return true;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear  = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastDayPrev = new Date(prevYear, prevMonth + 1, 0);
    return startOfDay(lastDayPrev) >= minD;
    // ถ้าอยาก strict ว่า “ทั้งเดือนก่อนหน้าตัดทิ้ง” ให้เทียบ firstDayPrev กับ minD
  };

  const canNavigateNext = () => {
    if (!maxD) return true;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear  = currentMonth === 11 ? currentYear + 1 : currentYear;
    const firstDayNext = new Date(nextYear, nextMonth, 1);
    return startOfDay(firstDayNext) <= maxD;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const items: React.ReactNode[] = [];

    // ช่องว่างก่อนวันแรกของเดือน
    for (let i = 0; i < firstDay; i++) {
      items.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // วันที่ของเดือน
    const today = startOfDay(new Date());
    const sel = selectedDate ? startOfDay(selectedDate) : null;

    for (let day = 1; day <= daysInMonth; day++) {
      const cur = new Date(currentYear, currentMonth, day);
      const isSel = sel ? isSameDay(sel, cur) : false;
      const isTod = isSameDay(today, cur);
      const disabledDay = isDateDisabled(cur);

      items.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={disabledDay}
          className={`
            p-2 text-sm rounded-lg transition-all duration-200 
            ${!disabledDay && 'hover:scale-110 hover:shadow-md cursor-pointer'}
            ${isSel 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
              : isTod 
                ? 'bg-blue-100 text-blue-600 font-semibold' 
                : disabledDay
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
            }
          `}
        >
          {day}
        </button>
      );
    }
    return items;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Calendar
          className={`
            pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 
            transition-colors duration-200
            ${disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-blue-500'}
          `}
        />
        <input
          type="text"
          value={fmt(selectedDate ? startOfDay(selectedDate) : null)}
          readOnly
          placeholder={placeholder}
          disabled={disabled}
          className={`
            pl-12 pr-6 py-4 w-full
            border-2 border-gray-200 rounded-2xl
            focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400
            bg-gradient-to-r from-gray-50 to-white
            text-gray-700 placeholder-gray-400
            shadow-sm transition-all duration-300
            cursor-pointer
            ${!disabled && 'hover:shadow-md group-hover:border-blue-300 group-hover:shadow-lg group-hover:shadow-blue-100/50'}
            ${disabled && 'bg-gray-100 cursor-not-allowed'}
            ${selectedDate && isClearable ? 'pr-12' : 'pr-6'}
          `}
        />
        {selectedDate && isClearable && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 text-xl font-light"
            aria-label="Clear date"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                disabled={!canNavigatePrev()}
                className={`
                  p-2 rounded-full transition-all duration-200 text-xl font-bold
                  ${canNavigatePrev() ? 'hover:bg-white/20 hover:scale-110 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                `}
                aria-label="Previous month"
              >
                ‹
              </button>
              <h3 className="font-semibold text-lg">
                {months[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                disabled={!canNavigateNext()}
                className={`
                  p-2 rounded-full transition-all duration-200 text-xl font-bold
                  ${canNavigateNext() ? 'hover:bg-white/20 hover:scale-110 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                `}
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((d) => (
                <div key={d} className="text-center text-sm font-medium text-gray-500 p-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
