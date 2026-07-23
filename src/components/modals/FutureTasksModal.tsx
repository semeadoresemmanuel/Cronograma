import React from 'react';
import { motion } from 'motion/react';
import { X, Clock, Pencil, Trash } from 'lucide-react';
import { format, startOfDay, isAfter } from 'date-fns';
import { cn } from '../../lib/utils';
import { formatDescription } from '../../utils/formatters';
import { CalendarItem } from '../../types';

interface FutureTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  items: CalendarItem[];
  darkMode: boolean;
  onOpenAddModal: (date?: Date, item?: CalendarItem, type?: 'task' | 'event', category?: 'checklist') => void;
  onConfirmDeleteItem: (id: string) => void;
}

export const FutureTasksModal: React.FC<FutureTasksModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  items,
  darkMode,
  onOpenAddModal,
  onConfirmDeleteItem,
}) => {
  if (!isOpen || !isAdmin) return null;

  const todayStart = startOfDay(new Date());
  const filteredTasks = items
    .filter(item => 
      item.type === 'task' && 
      item.category === 'checklist' && 
      isAfter(startOfDay(item.date), todayStart)
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

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
            TAREFAS FUTURAS
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors absolute right-4 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic">
                Nenhuma tarefa futura agendada.
              </div>
            ) : (
              filteredTasks.map(item => (
                <div 
                  key={item.id} 
                  className={cn(
                    "p-4 border border-border rounded-2xl flex flex-col gap-2 transition-all",
                    darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]"
                  )}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-primary">
                        {format(item.date, "dd/MM")}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDescription(item)}
                        </span>
                      )}
                      {(item.startTime || item.endTime) && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{item.startTime}{item.startTime && item.endTime ? ' - ' : ''}{item.endTime}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0 select-none">
                      {item.modalidade && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black bg-primary/10 text-primary tracking-wider whitespace-nowrap">
                          {item.modalidade}
                        </span>
                      )}
                      <div 
                        className={cn(
                          "flex items-center gap-3 px-3 py-1.5 bg-transparent border-[0.5px] rounded-full cursor-default mt-1",
                          darkMode ? "border-zinc-600" : "border-zinc-500"
                        )}
                      >
                        <button 
                          onClick={() => {
                            onClose();
                            onOpenAddModal(item.date, item, 'task', 'checklist');
                          }} 
                          className="text-primary hover:opacity-80 transition-transform cursor-pointer"
                          title="Editar"
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
                          onClick={() => onConfirmDeleteItem(item.id)} 
                          className="text-destructive hover:opacity-80 transition-transform cursor-pointer"
                          title="Excluir"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
