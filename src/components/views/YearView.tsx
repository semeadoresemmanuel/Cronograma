import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isMonday, isAfter, endOfDay, addMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { getModalidadeColor } from '../../utils/helpers';
import { downloadCalendarPdf } from '../../utils/pdfGenerator';
import pdfDownloadIcon from '../../assets/icons/pdf_download.svg';
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
  const currentYear = yearMonths[0] ? format(yearMonths[0], 'yyyy') : '2026';
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await downloadCalendarPdf({
        mode: darkMode ? 'dark' : 'light',
        year: currentYear,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF do calendário:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center w-full mb-6">
        <div className={cn(
          "px-6 h-[30px] rounded-full border border-border/40 shadow-inner flex items-center justify-center",
          darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]"
        )}>
          <span className="text-xs sm:text-sm font-display font-bold text-primary tracking-widest uppercase leading-none relative top-[-1px]">
            {currentYear}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 w-full">
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
                "p-6 lg:p-5 rounded-3xl border transition-all group relative overflow-hidden cursor-pointer flex flex-col justify-start",
                darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]",
                "border-border hover:border-primary/50 hover:shadow-md",
                yearMonths.length % 3 === 1 && index === yearMonths.length - 1 && "lg:col-start-2"
              )}
            >
              {isCurrentMonth && (
                <div className="absolute inset-0 bg-primary/25 pointer-events-none" />
              )}
              <div className="flex justify-center items-center mb-4 lg:mb-3 w-full">
                <h3 className="text-xl font-display font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors text-center">
                  {format(month, 'MMMM', { locale: ptBR })}
                </h3>
              </div>
              
              <div className="space-y-1.5 w-full">
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
                      <span className="truncate">{item.title || item.modalidade}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-primary italic text-center py-2">Férias</p>
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
        <button 
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="group flex flex-col items-center gap-3 cursor-pointer w-fit mx-auto disabled:opacity-60 transition-opacity"
          title="Baixar Calendário 2026 em PDF"
        >
          <img 
            src={pdfDownloadIcon} 
            alt="Download PDF" 
            className="w-8 h-8 theme-icon-green transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--primary)] group-active:drop-shadow-[0_0_8px_var(--primary)]" 
          />
          <div 
            className="flex items-center justify-center px-6 py-2.5 bg-transparent border border-primary rounded-full transition-all duration-300 group-hover:shadow-[0_0_15px_var(--primary)] group-active:shadow-[0_0_15px_var(--primary)] group-hover:bg-primary/10"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {isGeneratingPdf ? 'GERANDO PDF...' : 'BAIXAR CALENDÁRIO'}
            </span>
          </div>
        </button>
      </div>
    </>
  );
};
