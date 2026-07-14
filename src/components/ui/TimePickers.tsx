import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ClockPickerWidgetProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
}

export const ClockPickerWidget = ({ value, onChange, label }: ClockPickerWidgetProps) => {
  const [hour, minute] = (value || "00:00").split(":");
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);

  useEffect(() => {
    setTempHour(hour);
  }, [hour]);

  useEffect(() => {
    setTempMinute(minute);
  }, [minute]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(-2);
    setTempHour(val);
    if (val.length === 2) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 23) {
        onChange(`${num.toString().padStart(2, '0')}:${minute}`);
      }
    }
  };

  const handleHourBlur = () => {
    let num = parseInt(tempHour, 10);
    if (isNaN(num) || num < 0 || num > 23) num = 0;
    const formatted = num.toString().padStart(2, '0');
    setTempHour(formatted);
    onChange(`${formatted}:${minute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(-2);
    setTempMinute(val);
    if (val.length === 2) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 59) {
        onChange(`${hour}:${num.toString().padStart(2, '0')}`);
      }
    }
  };

  const handleMinuteBlur = () => {
    let num = parseInt(tempMinute, 10);
    if (isNaN(num) || num < 0 || num > 59) num = 0;
    const formatted = num.toString().padStart(2, '0');
    setTempMinute(formatted);
    onChange(`${hour}:${formatted}`);
  };

  const handleHourIncrement = () => {
    const currentHour = parseInt(hour, 10);
    const nextHour = (currentHour + 1) % 24;
    onChange(`${nextHour.toString().padStart(2, '0')}:${minute}`);
  };

  const handleHourDecrement = () => {
    const currentHour = parseInt(hour, 10);
    const prevHour = (currentHour - 1 + 24) % 24;
    onChange(`${prevHour.toString().padStart(2, '0')}:${minute}`);
  };

  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  
  const handleMinuteIncrement = () => {
    const currentIdx = minutesList.indexOf(minute);
    let nextIdx = 0;
    if (currentIdx !== -1) {
      nextIdx = (currentIdx + 1) % minutesList.length;
    } else {
      const minVal = parseInt(minute, 10);
      nextIdx = minutesList.findIndex(m => parseInt(m, 10) > minVal);
      if (nextIdx === -1) nextIdx = 0;
    }
    onChange(`${hour}:${minutesList[nextIdx]}`);
  };

  const handleMinuteDecrement = () => {
    const currentIdx = minutesList.indexOf(minute);
    let prevIdx = minutesList.length - 1;
    if (currentIdx !== -1) {
      prevIdx = (currentIdx - 1 + minutesList.length) % minutesList.length;
    } else {
      const minVal = parseInt(minute, 10);
      prevIdx = minutesList.findIndex(m => parseInt(m, 10) >= minVal) - 1;
      if (prevIdx < 0) prevIdx = minutesList.length - 1;
    }
    onChange(`${hour}:${minutesList[prevIdx]}`);
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2 bg-muted/20 border border-border p-3.5 rounded-2xl w-[170px] justify-center">
        {/* Hours Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 select-none">Hora</span>
          <button
            type="button"
            onClick={handleHourIncrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronUp className="w-5 h-5 text-primary" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={tempHour}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            onFocus={(e) => {
              const target = e.target;
              setTimeout(() => {
                target.select();
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-14 h-12 text-center bg-muted/50 border border-border rounded-xl text-3xl font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <button
            type="button"
            onClick={handleHourDecrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronDown className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Separator */}
        <div className="text-3xl font-bold text-foreground/50 self-center mt-3 select-none">:</div>

        {/* Minutes Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 select-none">Minuto</span>
          <button
            type="button"
            onClick={handleMinuteIncrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronUp className="w-5 h-5 text-primary" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={tempMinute}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            onFocus={(e) => {
              const target = e.target;
              setTimeout(() => {
                target.select();
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-14 h-12 text-center bg-muted/50 border border-border rounded-xl text-3xl font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <button
            type="button"
            onClick={handleMinuteDecrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronDown className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export interface TimeRangePickerProps {
  startTime: string;
  onChangeStartTime: (val: string) => void;
  endTime: string;
  onChangeEndTime: (val: string) => void;
  disabled?: boolean;
}

export const TimeRangePickerDropdown = ({ startTime, onChangeStartTime, endTime, onChangeEndTime, disabled }: TimeRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-2.5 flex items-center rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center gap-2",
          isOpen && "border-primary ring-1 ring-primary/20",
          !(startTime && endTime) && "text-muted-foreground/60 italic"
        )}
      >
        <span className={cn("flex-1 text-center", startTime && endTime ? "font-bold" : "font-normal")}>
          {startTime && endTime ? `${startTime} - ${endTime}` : 'Selecionar'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[240] bg-black/40 backdrop-blur-[4px]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[250] bg-card border border-border rounded-[2rem] shadow-2xl p-6 flex flex-col items-center gap-6 w-[90%] max-w-[480px]"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
                <ClockPickerWidget value={startTime} onChange={onChangeStartTime} label="Início" />
                <ClockPickerWidget value={endTime} onChange={onChangeEndTime} label="Término" />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!startTime) onChangeStartTime("00:00");
                  if (!endTime) onChangeEndTime("00:00");
                  setIsOpen(false);
                }}
                className={cn(
                  "w-[170px] py-2.5 rounded-xl font-bold transition-all uppercase text-xs tracking-wider cursor-pointer mt-2",
                  startTime && endTime 
                    ? "bg-primary text-primary-foreground hover:opacity-90" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Definir
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
