import React from 'react';
import { motion, Reorder } from 'motion/react';
import { Clock, Pencil, Trash } from 'lucide-react';
import { startOfWeek, isSameDay } from 'date-fns';
import { cn } from '../../lib/utils';
import { formatDescription } from '../../utils/formatters';
import eyeIcon from '../../elements/eye.svg';
import { CalendarItem } from '../../types';

interface TasksViewProps {
  items: CalendarItem[];
  darkMode: boolean;
  isAdmin: boolean;
  onOpenAddModal: (date?: Date, item?: CalendarItem, type?: 'task' | 'event', category?: 'checklist') => void;
  onOpenFutureTasksModal: () => void;
  onConfirmDeleteItem: (id: string) => void;
  onReorder: (newOrder: CalendarItem[]) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  items,
  darkMode,
  isAdmin,
  onOpenAddModal,
  onOpenFutureTasksModal,
  onConfirmDeleteItem,
  onReorder,
}) => {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const activeTaskDate = currentWeekStart;

  const weekItems = items.filter(i => 
    i.type === 'task' && 
    isSameDay(startOfWeek(i.date, { weekStartsOn: 1 }), activeTaskDate)
  );

  const checklist = weekItems.filter(i => i.category === 'checklist');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="space-y-8"
    >
      <div className="max-w-xl mx-auto">
        {isAdmin && (
          <div className="flex justify-center items-center gap-3 mb-4">
            <button 
              onClick={() => onOpenAddModal(activeTaskDate, undefined, 'task', 'checklist')} 
              className={cn(
                "flex items-center h-[30px] rounded-full transition-all duration-200 hover:scale-105 cursor-pointer font-black text-[10px] sm:text-[11px] uppercase tracking-wider border border-border/40 shadow-inner px-4 gap-2",
                darkMode ? "bg-[#262626] text-primary" : "bg-[#E2E2E2] text-primary"
              )}
            >
              <div className="flex items-center justify-center h-full gap-2">
                <span className="text-sm font-bold">+</span>
                <span className="w-[1px] h-3.5 bg-primary/30" />
              </div>
              <span className="pt-[1px]">ADICIONAR TAREFA</span>
            </button>

            <button 
              onClick={onOpenFutureTasksModal}
              className={cn(
                "flex items-center justify-center w-[30px] h-[30px] rounded-full transition-all duration-200 hover:scale-105 cursor-pointer border border-border/40 shadow-inner text-primary p-0 shrink-0",
                darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]"
              )}
              title="Visualizar Tarefas Futuras"
            >
              <img src={eyeIcon} className="w-[16px] h-[16px] theme-icon-green" alt="Tarefas Futuras" />
            </button>
          </div>
        )}
        
        {checklist.length > 0 ? (
          <Reorder.Group axis="y" values={checklist} onReorder={onReorder} className="space-y-3 flex-1 flex flex-col">
            {checklist.map((item) => (
              <Reorder.Item 
                key={item.id} 
                value={item}
                className={cn(
                  "flex items-start justify-between group gap-4 border border-border rounded-3xl p-6 transition-colors select-none shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing",
                  darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-foreground">
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        {formatDescription(item)}
                      </span>
                    )}
                    {(item.startTime || item.endTime) && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{item.startTime}{item.startTime && item.endTime ? ' - ' : ''}{item.endTime}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 shrink-0 select-none">
                  {item.modalidade && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black bg-primary/10 text-primary tracking-wider whitespace-nowrap">
                      {item.modalidade}
                    </span>
                  )}
                  {isAdmin && (
                    <div 
                      className={cn(
                        "flex items-center gap-3 px-3 py-1.5 bg-transparent border-[0.5px] rounded-full cursor-default",
                        darkMode ? "border-zinc-600" : "border-zinc-500"
                      )}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddModal(item.date, item, 'task', 'checklist');
                        }} 
                        className="text-primary hover:opacity-80 transition-transform cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <div 
                        className={cn(
                          "h-3 w-[0.5px]",
                          darkMode ? "bg-zinc-600" : "bg-zinc-500"
                        )}
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirmDeleteItem(item.id);
                        }} 
                        className="text-destructive transition-transform cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          !isAdmin && (
            <div className={cn("border border-border rounded-3xl p-4 sm:p-6 shadow-sm text-center", darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]")}>
              <p className="text-[10px] sm:text-xs italic py-2 px-1 sm:px-2 whitespace-nowrap text-primary">
                Nenhuma atividade registrada para esta semana.
              </p>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
};
