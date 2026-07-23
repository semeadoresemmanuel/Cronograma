import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isMonday, isAfter, endOfDay, addMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { getModalidadeColor } from '../../utils/helpers';
import pdfDownloadIcon from '../../elements/pdf_download.svg';
import { CalendarItem } from '../../types';

interface YearViewProps {
  yearMonths: Date[];
  items: CalendarItem[];
  darkMode: boolean;
  onSelectMonth: (month: Date) => void;
}

export const YearView: React.FC<YearViewProps> = ({
  yearMonths,
  items,
  darkMode,
  onSelectMonth,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {yearMonths.map((month, index) => {
          const itemsInMonth = items.filter(i => 
            i.date.getMonth() === month.getMonth() && 
            i.date.getFullYear() === month.getFullYear() &&
            i.type !== 'task'
          );
          const today = new Date();
          const monthEnd = endOfMonth(today);
          const mondays = eachDayOfInterval({ start: startOfMonth(today), end: monthEnd }).filter(d => isMonday(d));
          const lastMonday = mondays[mondays.length - 1];
          const effectiveMonthDate = isAfter(today, endOfDay(lastMonday)) ? addMonths(today, 1) : today;
          const isCurrentMonth = isSameMonth(month, effectiveMonthDate);
          
          return (
            <button
              key={month.toISOString()}
              onClick={() => onSelectMonth(month)}
              className={cn(
                "p-6 lg:p-5 rounded-3xl border transition-all text-left group relative overflow-hidden cursor-pointer",
                darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]",
                "border-border hover:border-primary/50 hover:shadow-md",
                yearMonths.length % 3 === 1 && index === yearMonths.length - 1 && "lg:col-start-2"
              )}
            >
              {isCurrentMonth && (
                <div className="absolute inset-0 bg-primary/25 pointer-events-none" />
              )}
              <div className="flex justify-between items-center mb-4 lg:mb-3 pr-20">
                <h3 className="text-xl font-display font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {format(month, 'MMMM', { locale: ptBR })}
                </h3>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-3 min-w-[80px]">
                <div className="w-[1px] h-12 bg-primary" />
                <span className="text-lg font-display font-bold text-primary">
                 {format(month, 'yyyy')}
                </span>
              </div>
              
              <div className="space-y-1.5 pr-20">
                {itemsInMonth.length > 0 ? (
                  itemsInMonth.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                      <div 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: getModalidadeColor(item.modalidade) }}
                      />
                      <span className="font-bold shrink-0" style={{ color: getModalidadeColor(item.modalidade) }}>
                        {format(item.date, 'dd')}:
                      </span>
                      <span className="truncate">{item.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-primary italic">Sem encontros</p>
                )}
                {itemsInMonth.length > 3 && (
                  <p className="text-[10px] text-primary font-bold mt-1">+ {itemsInMonth.length - 3} itens</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 mb-4 flex justify-center w-full">
        <a 
          href={darkMode ? "/calendario_2026_dark.pdf" : "/calendario_2026_light.pdf"} 
          download="Calendário 2026.pdf" 
          className="group flex flex-col items-center gap-3 cursor-pointer w-fit mx-auto"
        >
          <img 
            src={pdfDownloadIcon} 
            alt="Download PDF" 
            className="w-8 h-8 theme-icon-green transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--primary)] group-active:drop-shadow-[0_0_8px_var(--primary)]" 
          />
          <div 
            className="flex items-center justify-center px-6 py-2.5 bg-transparent border border-primary rounded-full transition-all duration-300 group-hover:shadow-[0_0_15px_var(--primary)] group-active:shadow-[0_0_15px_var(--primary)] group-hover:bg-primary/10"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">BAIXAR CALENDÁRIO</span>
          </div>
        </a>
      </div>
    </>
  );
};
