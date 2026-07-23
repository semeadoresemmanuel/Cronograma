import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { getModalidadeColor } from '../../utils/helpers';
import { formatDescription } from '../../utils/formatters';
import { MEMBER_BIRTHDAYS } from '../../constants/birthdays';
import { CalendarItem, ViewMode } from '../../types';

interface MonthDayViewProps {
  displayDates: Date[];
  items: CalendarItem[];
  viewMode: ViewMode;
  darkMode: boolean;
  isAdmin: boolean;
  onOpenAddModal: (date?: Date, item?: CalendarItem, type?: 'task' | 'event') => void;
  onSelectModalidade: (m: string) => void;
  onSetFormContext: (ctx: 'encontro' | 'recesso') => void;
  onSetSelectedImage: (img: { url: string; title: string } | null) => void;
  onConfirmDeleteItem: (id: string) => void;
}

export const MonthDayView: React.FC<MonthDayViewProps> = ({
  displayDates,
  items,
  viewMode,
  darkMode,
  isAdmin,
  onOpenAddModal,
  onSelectModalidade,
  onSetFormContext,
  onSetSelectedImage,
  onConfirmDeleteItem,
}) => {
  const [fabOpenDate, setFabOpenDate] = useState<string | null>(null);

  if (displayDates.length === 0) {
    return <div className="py-20 text-center text-muted-foreground">Nenhum evento neste período.</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 flex flex-col">
      {displayDates.map((date) => {
        const dayItems = items
          .filter(i => isSameDay(i.date, date) && i.type !== 'task')
          .sort((a, b) => {
            const timeA = a.startTime || '00:00';
            const timeB = b.startTime || '00:00';
            return timeA.localeCompare(timeB);
          });
        const dateColor = 'var(--primary)';

        return (
          <div key={date.toISOString()} className={cn(
            "flex flex-col gap-6",
            viewMode === 'DAY' ? "items-center text-center w-full" : "md:flex-row items-start"
          )}>
            <div className={cn(
              "flex md:flex-col items-center gap-4 md:gap-1 shrink-0 mt-1",
              viewMode === 'DAY' ? "justify-center" : "md:items-start md:w-28"
            )}>
              <div className="flex items-baseline">
                {viewMode === 'DAY' ? (
                  <div className="text-5xl font-black tracking-tighter font-display flex items-baseline">
                    <span style={{ color: dateColor }}>{format(date, 'dd')}</span>
                    <span className={cn("text-2xl ml-1", darkMode ? "text-[#f7f7f7ff]" : "text-[#121212ff]")}>/{format(date, 'MM')}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-4xl font-black tracking-tighter font-display" style={{ color: dateColor }}>{format(date, 'dd')}</span>
                    <span className={cn("font-bold uppercase tracking-widest text-xs ml-0.5", darkMode ? "text-[#f7f7f7ff]" : "text-[#121212ff]")}>
                      /{format(date, 'MM')}
                    </span>
                  </>
                )}
              </div>
              {isAdmin && viewMode !== 'DAY' && (
                <div className="relative">
                  <button 
                    onClick={() => setFabOpenDate(fabOpenDate === date.toISOString() ? null : date.toISOString())}
                    className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Plus className={cn("w-5 h-5 transition-transform duration-200", fabOpenDate === date.toISOString() && "rotate-45")} />
                  </button>
                  
                  <AnimatePresence>
                    {fabOpenDate === date.toISOString() && (
                      <>
                        <div 
                          className="fixed inset-0 z-20 pointer-events-auto" 
                          onClick={() => setFabOpenDate(null)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, x: 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: 10 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30 pointer-events-auto pl-2.5"
                        >
                          <div className="absolute right-full w-2.5 h-[1px] bg-primary/25 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <div className="absolute left-0 w-[1px] h-[34px] bg-primary/25 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <div className="absolute left-0 w-2.5 h-[1px] bg-primary/25 top-[22%] pointer-events-none" />
                          <div className="absolute left-0 w-2.5 h-[1px] bg-primary/25 top-[78%] pointer-events-none" />

                          <button
                            onClick={() => {
                              onOpenAddModal(date, undefined, 'event');
                              onSelectModalidade('');
                              onSetFormContext('encontro');
                              setFabOpenDate(null);
                            }}
                            className="px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border-0 shadow-md whitespace-nowrap cursor-pointer"
                          >
                            Adicionar Encontro
                          </button>
                          <button
                            onClick={() => {
                              onOpenAddModal(date, undefined, 'event');
                              onSelectModalidade('');
                              onSetFormContext('recesso');
                              setFabOpenDate(null);
                            }}
                            className="px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border-0 shadow-md whitespace-nowrap cursor-pointer"
                          >
                            Adicionar Recesso
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              {(() => {
                if (dayItems.length === 0) {
                  return (
                    <div className={cn(
                      "p-6 rounded-2xl text-xs uppercase tracking-widest font-bold text-center",
                      darkMode ? "bg-[#262626] text-[#C5C5C5]" : "bg-[#e2e2e2] text-[#121212ff]"
                    )}>
                      Livre
                    </div>
                  );
                }
                return dayItems.map(item => (
                  <div key={item.id} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all flex flex-col gap-4 group">
                    {/* Top - Modalidade and Title */}
                    <div className="w-full flex flex-col items-center gap-2">
                      {item.modalidade && (
                        <span 
                          className="text-sm font-display font-bold uppercase tracking-widest text-center"
                          style={{ color: getModalidadeColor(item.modalidade) }}
                        >
                          {item.modalidade === 'Reforma Intima' ? 'Reforma Íntima' : item.modalidade}
                        </span>
                      )}
                      <h4 className="text-base font-display font-normal italic text-foreground tracking-tight text-center leading-tight">
                        {item.title}
                      </h4>
                    </div>

                    {/* Middle - Cover Image & Description */}
                    {(item.type !== 'task' || item.description) && (
                      <div className="flex flex-col items-center gap-3 py-1 w-full">
                        {item.type !== 'task' && (
                          <div className={cn(
                            "p-1.5 border-[0.5px] rounded-[1.5rem] shrink-0 w-full max-w-[252px]",
                            darkMode ? "border-zinc-600" : "border-zinc-500"
                          )}>
                            <div 
                              onClick={() => item.cover && onSetSelectedImage({url: item.cover, title: item.title})}
                              className={cn(
                                "w-full aspect-square border rounded-2xl overflow-hidden relative flex items-center justify-center bg-muted/20",
                                item.cover ? "cursor-zoom-in" : ""
                              )}
                            >
                              {item.cover ? (
                                <img 
                                  src={item.cover} 
                                  alt="Capa" 
                                  className="absolute inset-0 w-full h-full object-cover" 
                                />
                              ) : (
                                <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/20 text-center px-1">Sem Capa</span>
                              )}
                            </div>
                          </div>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-xl">{formatDescription(item)}</p>
                        )}
                      </div>
                    )}

                    {/* Bottom - Time Range & Admin Actions */}
                    <div className="w-full flex justify-center items-center relative min-h-8 mt-1">
                      {(item.startTime || item.endTime) && (
                        <div className={cn(
                          "flex items-center gap-2 px-3 h-8 rounded-full text-xs font-medium border-[0.5px] bg-transparent whitespace-nowrap",
                          darkMode ? "border-zinc-600 text-[#f7f7f7ff]" : "border-zinc-500 text-black"
                        )}>
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{item.startTime}{item.startTime && item.endTime ? ' - ' : ''}{item.endTime}</span>
                        </div>
                      )}

                      {isAdmin && (
                        <div 
                          className={cn(
                            "absolute right-0 flex items-center gap-0 border-[0.5px] rounded-full h-8 px-1 bg-transparent",
                            darkMode ? "border-zinc-600" : "border-zinc-500"
                          )}
                        >
                          <button onClick={() => onOpenAddModal(item.date, item)} className="p-1 rounded-full transition-colors text-primary/70 hover:text-primary hover:bg-primary/10 cursor-pointer">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <div 
                            className={cn(
                              "h-4 mx-1 w-[0.5px]",
                              darkMode ? "bg-zinc-600" : "bg-zinc-500"
                            )}
                          />
                          <button onClick={(e) => { e.stopPropagation(); onConfirmDeleteItem(item.id); }} className="p-1 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors cursor-pointer">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
              
              {/* Day View Birthdays Section */}
              {(() => {
                if (viewMode !== 'DAY') return null;
                const todayBirthdays = MEMBER_BIRTHDAYS.filter(birthday => {
                  return birthday.day === date.getDate() && birthday.month === date.getMonth();
                });
                if (todayBirthdays.length === 0) return null;
                return (
                  <div className="mt-6 w-full max-w-xl mx-auto p-6 bg-card/30 border border-border rounded-[2rem] flex flex-col items-center gap-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {format(date, 'MMMM', { locale: ptBR })}
                      </span>
                      <h3 className="text-sm font-black text-foreground uppercase tracking-wider select-none">
                        Aniversariante(s) do Mês
                      </h3>
                    </div>
                    <div className="w-full flex flex-col items-center gap-2">
                      {todayBirthdays.map(birthday => (
                        <div 
                          key={birthday.name} 
                          className="mx-auto w-fit min-w-[200px] max-w-full px-8 py-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 border border-primary/30 bg-transparent transition-all duration-300 shadow-sm shadow-primary/20"
                        >
                          <p className="font-bold text-foreground text-center text-sm">{birthday.name}</p>
                          <p className="font-bold text-primary text-base text-center">
                            {String(birthday.day).padStart(2, '0')}/{String(birthday.month + 1).padStart(2, '0')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
};
