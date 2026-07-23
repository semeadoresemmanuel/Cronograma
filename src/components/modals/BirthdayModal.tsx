import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { MEMBER_BIRTHDAYS } from '../../constants/birthdays';
import { ViewMode } from '../../types';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  selectedMonthInYearView: Date | null;
  currentDate: Date;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({
  isOpen,
  onClose,
  viewMode,
  selectedMonthInYearView,
  currentDate,
}) => {
  if (!isOpen) return null;

  const targetDate = (viewMode === 'YEAR' && selectedMonthInYearView) ? selectedMonthInYearView : currentDate;
  const targetMonth = targetDate.getMonth();
  const filtered = MEMBER_BIRTHDAYS.filter(b => b.month === targetMonth).sort((a, b) => a.day - b.day);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bottom-sheet-overlay pointer-events-auto" 
      />
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="w-full sm:max-w-md bg-background sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl relative z-10 pointer-events-auto max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="sticky top-0 bg-background z-20 pt-5 pb-3 px-6 flex items-center justify-center border-b border-border">
          <div className="w-12 h-1.5 bg-muted rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />
          <h2 className="text-lg font-bold uppercase text-primary">
            ANIVERSARIANTE(S) DO MÊS
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors absolute right-4 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {format(targetDate, 'MMMM', { locale: ptBR })}
            </span>
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
              Parabéns aos Celebrados!
            </h3>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground italic">
                Nenhum aniversariante neste mês.
              </div>
            ) : (
              filtered.map(birthday => {
                const isToday = birthday.day === new Date().getDate() && birthday.month === new Date().getMonth();
                return (
                  <div 
                    key={birthday.name} 
                    className={cn(
                      "mx-auto w-fit min-w-[200px] max-w-full px-8 py-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 border border-primary/30 bg-transparent transition-all duration-300",
                      isToday && "shadow-sm shadow-primary/20"
                    )}
                  >
                    <p className="font-bold text-foreground text-center">{birthday.name}</p>
                    <p className="font-bold text-primary text-lg text-center">
                      {String(birthday.day).padStart(2, '0')}/{String(birthday.month + 1).padStart(2, '0')}
                    </p>
                    {isToday && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full block mt-1">
                        HOJE!
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
