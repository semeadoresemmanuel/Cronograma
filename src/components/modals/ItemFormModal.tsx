import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isMonday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { TimeRangePickerDropdown } from '../ui/TimePickers';
import { CalendarItem, ItemType, ViewMode } from '../../types';
import { 
  TASK_DEPARTMENTS, 
  RECESSO_MODALIDADES, 
  ENCONTRO_MODALIDADES, 
  ALL_EVENT_MODALIDADES,
  NO_CHAMADA_MODALIDADES 
} from '../../constants/modalidades';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: CalendarItem | null;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  selectedMonth: number | null;
  setSelectedMonth: (month: number | null) => void;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formType: ItemType;
  setFormType: (type: ItemType) => void;
  formCategory: 'checklist' | 'responsavel' | 'orientacao' | undefined;
  setFormCategory: (cat: 'checklist' | 'responsavel' | 'orientacao' | undefined) => void;
  formContext: 'encontro' | 'recesso' | undefined;
  setFormContext: (ctx: 'encontro' | 'recesso' | undefined) => void;
  selectedModalidade: string;
  setSelectedModalidade: (m: string) => void;
  formCover: string | null;
  setFormCover: (c: string | null) => void;
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  formStartTime: string;
  setFormStartTime: (time: string) => void;
  formEndTime: string;
  setFormEndTime: (time: string) => void;
  viewMode: ViewMode;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  selectedDate,
  setSelectedDate,
  selectedDay,
  setSelectedDay,
  selectedMonth,
  setSelectedMonth,
  formTitle,
  setFormTitle,
  formType,
  formCategory,
  formContext,
  selectedModalidade,
  setSelectedModalidade,
  formCover,
  setFormCover,
  selectedMember,
  setSelectedMember,
  formStartTime,
  setFormStartTime,
  formEndTime,
  setFormEndTime,
  viewMode,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDaySelectOpen, setIsDaySelectOpen] = useState(false);
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [isModalidadeSelectOpen, setIsModalidadeSelectOpen] = useState(false);
  const [isMemberSelectOpen, setIsMemberSelectOpen] = useState(false);

  if (!isOpen) return null;

  const isTaskForm = formType === 'task' && (formCategory === 'checklist' || formCategory === 'orientacao' || formCategory === 'responsavel');
  const modalTitle = editingItem 
    ? (formType === 'task' ? 'EDITAR TAREFA' : 'EDITAR ENCONTRO') 
    : (formType === 'task' 
        ? (formCategory === 'checklist' ? 'NOVA TAREFA' : formCategory === 'responsavel' ? 'NOVO RESPONSÁVEL' : 'NOVA ORIENTAÇÃO')
        : (formContext === 'recesso' ? 'NOVO RECESSO' : 'NOVO ENCONTRO')
      );

  const availableModalidades = formType === 'task' 
    ? TASK_DEPARTMENTS 
    : (formContext === 'recesso' 
        ? RECESSO_MODALIDADES 
        : (formContext === 'encontro' ? ENCONTRO_MODALIDADES : ALL_EVENT_MODALIDADES)
      );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bottom-sheet-overlay pointer-events-auto" 
      />
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="w-full sm:max-w-xl bg-background sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl relative z-10 pointer-events-auto max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background z-20 pt-5 pb-3 px-6 flex items-center justify-center border-b border-border">
          <div className="w-12 h-1.5 bg-muted rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />
          <h2 className="text-lg font-bold uppercase text-primary">
            {modalTitle}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors absolute right-4 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSave} className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {isTaskForm ? (
            <div className="flex flex-col gap-4">
              {/* 1. Tarefa / Assunto */}
              <div className="space-y-1 w-full">
                <label className="block text-center text-sm font-medium text-foreground">
                  {formCategory === 'checklist' ? 'Tarefa' : 'Assunto'}
                </label>
                <input 
                  name="title" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all" 
                />
              </div>

              {/* 2. Departamento */}
              <div className="space-y-1 relative w-full">
                <label className="block text-center text-sm font-medium text-foreground">Departamento</label>
                <button
                  type="button"
                  onClick={() => setIsModalidadeSelectOpen(!isModalidadeSelectOpen)}
                  className={cn(
                    "w-full p-2.5 flex items-center justify-center rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer",
                    isModalidadeSelectOpen && "border-primary ring-1 ring-primary/20",
                    !selectedModalidade && "text-muted-foreground/60 italic"
                  )}
                >
                  <span className={cn("flex-1 text-center", selectedModalidade ? "font-bold" : "font-normal")}>
                    {selectedModalidade || 'Selecionar'}
                  </span>
                </button>
                <input type="hidden" name="modalidade" value={selectedModalidade} />
                <AnimatePresence>
                  {isModalidadeSelectOpen && (
                    <>
                      <div className="fixed inset-0 z-[240] bg-black/40 backdrop-blur-[4px]" onClick={() => setIsModalidadeSelectOpen(false)} />
                      <div className="fixed inset-0 z-[250] flex items-center justify-center p-5 pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-[90%] max-w-[360px] bg-card border border-border rounded-[2rem] shadow-2xl p-6 flex flex-col items-center gap-6 pointer-events-auto"
                        >
                          <div className="flex items-center justify-center gap-4 py-2 select-none">
                            {TASK_DEPARTMENTS.map((opt, index) => {
                              const isSelected = selectedModalidade === opt;
                              return (
                                <React.Fragment key={opt}>
                                  {index > 0 && <span className="text-border select-none">|</span>}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (selectedModalidade === opt) {
                                        setSelectedModalidade('');
                                      } else {
                                        setSelectedModalidade(opt);
                                      }
                                      setIsModalidadeSelectOpen(false);
                                    }}
                                    className={cn(
                                      "text-sm font-bold uppercase transition-all duration-200 cursor-pointer",
                                      isSelected 
                                        ? "text-primary scale-110 font-black" 
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </motion.div>
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Membro(s) */}
              <div className="space-y-1 w-full">
                <label className="block text-center text-sm font-medium text-foreground">Membro(s)</label>
                <button
                  type="button"
                  onClick={() => setIsMemberSelectOpen(!isMemberSelectOpen)}
                  className={cn(
                    "w-full p-2.5 flex items-center justify-center rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer",
                    isMemberSelectOpen && "border-primary ring-1 ring-primary/20",
                    !selectedMember && "text-muted-foreground/60 italic"
                  )}
                >
                  <span className={cn("flex-1 text-center", selectedMember ? "font-bold" : "font-normal")}>
                    {selectedMember || 'Selecionar'}
                  </span>
                </button>
                <input type="hidden" name="description" value={selectedMember} />
                <AnimatePresence>
                  {isMemberSelectOpen && (
                    <>
                      <div className="fixed inset-0 z-[240] bg-black/40 backdrop-blur-[4px]" onClick={() => setIsMemberSelectOpen(false)} />
                      <div className="fixed inset-0 z-[250] flex items-center justify-center p-5 pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-[90%] max-w-[360px] bg-card border border-border rounded-[2rem] shadow-2xl p-6 flex flex-col items-center gap-6 pointer-events-auto"
                        >
                          <div className="w-full flex flex-col gap-0.5 pr-1 max-h-64 overflow-y-auto no-scrollbar">
                            {[
                              'Alexandre',
                              'Amanda',
                              'Carla',
                              'Carlos Henrique',
                              'Eder',
                              'Gilberto',
                              'Jean',
                              'Laura',
                              'Maria de Lourdes',
                              'Ruth',
                              'Thainá',
                              'Wallace',
                              'Todos os Membros'
                            ].map(opt => {
                              const isSelected = selectedMember.split(', ').filter(Boolean).includes(opt);
                              const isTodosOption = opt === 'Todos os Membros';
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    const currentMembers = selectedMember ? selectedMember.split(', ').filter(Boolean) : [];
                                    let nextMembers;
                                    if (opt === 'Todos os Membros') {
                                      if (currentMembers.includes('Todos os Membros')) {
                                        nextMembers = [];
                                      } else {
                                        nextMembers = ['Todos os Membros'];
                                      }
                                    } else {
                                      const activeIndividual = currentMembers.filter(m => m !== 'Todos os Membros');
                                      if (activeIndividual.includes(opt)) {
                                        nextMembers = activeIndividual.filter(m => m !== opt);
                                      } else {
                                        nextMembers = [...activeIndividual, opt];
                                      }
                                    }
                                    nextMembers.sort();
                                    setSelectedMember(nextMembers.join(', '));
                                  }}
                                  className={cn(
                                    "w-full h-8 flex items-center justify-center text-sm rounded-md transition-colors font-medium shrink-0 cursor-pointer",
                                    isSelected 
                                      ? "bg-primary text-primary-foreground font-bold" 
                                      : isTodosOption 
                                        ? "text-primary hover:bg-primary/10 font-bold" 
                                        : "hover:bg-primary/10 text-foreground"
                                  )}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsMemberSelectOpen(false)}
                            className={cn(
                              "w-[170px] py-2.5 rounded-xl font-bold transition-all uppercase text-xs tracking-wider cursor-pointer mt-2",
                              selectedMember 
                                ? "bg-primary text-primary-foreground hover:opacity-90" 
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            Definir
                          </button>
                        </motion.div>
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Data e Horário */}
              <div className="grid grid-cols-2 gap-4 w-full md:col-span-1">
                {/* Data */}
                <div className="space-y-1 relative w-full">
                  <label className="block text-center text-sm font-medium text-foreground">Data</label>
                  <button
                    type="button"
                    onClick={() => setIsDaySelectOpen(!isDaySelectOpen)}
                    className={cn(
                      "w-full p-2.5 flex items-center justify-center rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer",
                      isDaySelectOpen && "border-primary ring-1 ring-primary/20",
                      !selectedDate && "text-muted-foreground/60 italic"
                    )}
                  >
                    <span className={cn("flex-1 text-center capitalize", selectedDate ? "font-bold" : "font-normal")}>
                      {selectedDate ? format(selectedDate, "dd 'de' MMM", { locale: ptBR }) : 'Selecionar'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isDaySelectOpen && (
                      <>
                        <div className="fixed inset-0 z-[240] bg-black/40 backdrop-blur-[4px]" onClick={() => setIsDaySelectOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[250] bg-card border border-border rounded-[2rem] shadow-2xl p-6 flex flex-col items-center gap-6 w-[90%] max-w-[360px]"
                        >
                          <div className="flex gap-4 w-full justify-center h-64">
                            {/* Days */}
                            <div className="flex-1 flex flex-col items-center border-r-2 border-border/80 pr-3">
                              <span className="text-sm font-bold text-primary mb-1 uppercase tracking-wider select-none">DIA</span>
                              <div className="w-full overflow-y-auto no-scrollbar flex flex-col gap-1 h-56">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                                  const maxDaysInSelectedMonth = selectedMonth !== null ? new Date(new Date().getFullYear(), selectedMonth + 1, 0).getDate() : 31;
                                  const isDisabled = d > maxDaysInSelectedMonth;
                                  const isSelected = selectedDay === d;
                                  return (
                                    <button
                                      key={d}
                                      type="button"
                                      disabled={isDisabled}
                                      onClick={() => {
                                        if (selectedDay === d) {
                                          setSelectedDay(null);
                                        } else {
                                          setSelectedDay(d);
                                        }
                                      }}
                                      className={cn(
                                        "py-2 text-sm rounded-xl transition-colors text-center font-bold shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
                                        isSelected 
                                          ? "bg-primary text-primary-foreground" 
                                          : "hover:bg-primary/10 text-foreground"
                                      )}
                                    >
                                      {d.toString().padStart(2, '0')}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Months */}
                            <div className="flex-1 flex flex-col items-center">
                              <span className="text-sm font-bold text-primary mb-1 uppercase tracking-wider select-none">MÊS</span>
                              <div className="w-full overflow-y-auto no-scrollbar flex flex-col gap-1 h-56">
                                {[
                                  { value: 0, label: 'Janeiro' },
                                  { value: 1, label: 'Fevereiro' },
                                  { value: 2, label: 'Março' },
                                  { value: 3, label: 'Abril' },
                                  { value: 4, label: 'Maio' },
                                  { value: 5, label: 'Junho' },
                                  { value: 6, label: 'Julho' },
                                  { value: 7, label: 'Agosto' },
                                  { value: 8, label: 'Setembro' },
                                  { value: 9, label: 'Outubro' },
                                  { value: 10, label: 'Novembro' },
                                  { value: 11, label: 'Dezembro' }
                                ].map(m => {
                                  const isSelected = selectedMonth === m.value;
                                  return (
                                    <button
                                      key={m.value}
                                      type="button"
                                      onClick={() => {
                                        if (selectedMonth === m.value) {
                                          setSelectedMonth(null);
                                        } else {
                                          setSelectedMonth(m.value);
                                        }
                                      }}
                                      className={cn(
                                        "py-2 text-sm rounded-xl transition-colors text-center font-bold shrink-0 cursor-pointer",
                                        isSelected 
                                          ? "bg-primary text-primary-foreground" 
                                          : "hover:bg-primary/10 text-foreground"
                                      )}
                                    >
                                      {m.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={selectedDay === null || selectedMonth === null}
                            onClick={() => {
                              if (selectedDay !== null && selectedMonth !== null) {
                                const year = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
                                setSelectedDate(new Date(year, selectedMonth, selectedDay));
                                setIsDaySelectOpen(false);
                              }
                            }}
                            className={cn(
                              "w-[170px] py-2.5 rounded-xl font-bold transition-all uppercase text-xs tracking-wider mt-2",
                              (selectedDay !== null && selectedMonth !== null) 
                                ? "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer" 
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            )}
                          >
                            Definir
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Horário */}
                <div className="space-y-1 w-full">
                  <label className="block text-center text-sm font-medium text-foreground">Horário</label>
                  <TimeRangePickerDropdown 
                    startTime={formStartTime}
                    onChangeStartTime={setFormStartTime}
                    endTime={formEndTime}
                    onChangeEndTime={setFormEndTime}
                  />
                  <input type="hidden" name="startTime" value={formStartTime} />
                  <input type="hidden" name="endTime" value={formEndTime} />
                </div>
              </div>
            </div>
          ) : (
            // Original form fields for Event/Recesso
            <>
              <div className={cn("grid gap-4", (formCategory !== 'orientacao' && formCategory !== 'responsavel' && formType === 'task') ? "grid-cols-[145px_1fr]" : "grid-cols-1")}>
                {formCategory !== 'orientacao' && formCategory !== 'responsavel' && formType === 'task' && (
                  <div className="space-y-1 relative">
                    <label className="block text-center text-sm font-medium text-foreground">Data</label>
                    <div className="flex gap-1.5">
                      {/* Day Selector */}
                      <div className="relative flex-[1]">
                        <button
                          type="button"
                          disabled={viewMode === 'DAY' && formType !== 'task'}
                          onClick={() => {
                            setIsDaySelectOpen(!isDaySelectOpen);
                            setIsMonthSelectOpen(false);
                          }}
                          className={cn(
                            "w-full p-2 flex items-center justify-between rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-[42px]",
                            isDaySelectOpen && "border-primary ring-1 ring-primary/20"
                          )}
                        >
                          <span className="flex-1 text-center font-bold">
                            {selectedDate ? selectedDate.getDate().toString().padStart(2, '0') : '01'}
                          </span>
                          <ChevronDown className={cn("w-3.5 h-3.5 text-foreground/50 transition-transform", isDaySelectOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                          {isDaySelectOpen && (!['DAY'].includes(viewMode) || formType === 'task') && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setIsDaySelectOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 right-0 z-40 mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-48 overflow-y-auto min-w-[55px]"
                              >
                                <div className="p-1 flex flex-col gap-1">
                                  {(() => {
                                    if (!selectedDate) return null;
                                    const mondays = eachDayOfInterval({
                                      start: startOfMonth(selectedDate),
                                      end: endOfMonth(selectedDate)
                                    }).filter(d => isMonday(d));
                                    
                                    return mondays.map(date => {
                                      const d = date.getDate();
                                      return (
                                        <button
                                          key={d}
                                          type="button"
                                          onClick={() => {
                                            setSelectedDate(date);
                                            setIsDaySelectOpen(false);
                                          }}
                                          className={cn(
                                            "p-1.5 text-xs rounded-lg transition-colors text-center font-medium cursor-pointer",
                                            selectedDate?.getDate() === d 
                                              ? "bg-primary text-primary-foreground font-bold" 
                                              : "hover:bg-primary/10 text-foreground"
                                          )}
                                        >
                                          {d.toString().padStart(2, '0')}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Month Selector */}
                      <div className="relative flex-[1.3]">
                        <button
                          type="button"
                          disabled={viewMode === 'DAY' && formType !== 'task'}
                          onClick={() => {
                            setIsMonthSelectOpen(!isMonthSelectOpen);
                            setIsDaySelectOpen(false);
                          }}
                          className={cn(
                            "w-full p-2 flex items-center justify-between rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-[42px]",
                            isMonthSelectOpen && "border-primary ring-1 ring-primary/20"
                          )}
                        >
                          <span className="flex-1 text-center font-bold capitalize">
                            {selectedDate ? format(selectedDate, 'MMM', { locale: ptBR }) : 'Jan'}
                          </span>
                          <ChevronDown className={cn("w-3.5 h-3.5 text-foreground/50 transition-transform", isMonthSelectOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                          {isMonthSelectOpen && (!['DAY'].includes(viewMode) || formType === 'task') && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setIsMonthSelectOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 right-0 z-40 mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-48 overflow-y-auto min-w-[70px]"
                              >
                                <div className="p-1 flex flex-col gap-1">
                                  {[
                                    { value: 0, label: 'Jan' },
                                    { value: 1, label: 'Fev' },
                                    { value: 2, label: 'Mar' },
                                    { value: 3, label: 'Abr' },
                                    { value: 4, label: 'Mai' },
                                    { value: 5, label: 'Jun' },
                                    { value: 6, label: 'Jul' },
                                    { value: 7, label: 'Ago' },
                                    { value: 8, label: 'Set' },
                                    { value: 9, label: 'Out' },
                                    { value: 10, label: 'Nov' },
                                    { value: 11, label: 'Dez' }
                                  ].map(m => (
                                    <button
                                      key={m.value}
                                      type="button"
                                      onClick={() => {
                                        if (selectedDate) {
                                          const currentMondays = eachDayOfInterval({
                                            start: startOfMonth(selectedDate),
                                            end: endOfMonth(selectedDate)
                                          }).filter(d => isMonday(d));
                                          const currentMondayIdx = currentMondays.findIndex(d => format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));
                                          
                                          const newMonthStart = new Date(selectedDate.getFullYear(), m.value, 1);
                                          const newMondays = eachDayOfInterval({
                                            start: startOfMonth(newMonthStart),
                                            end: endOfMonth(newMonthStart)
                                          }).filter(d => isMonday(d));
                                          
                                          const targetIdx = currentMondayIdx !== -1 ? currentMondayIdx : 0;
                                          const nextDate = newMondays[targetIdx] || newMondays[newMondays.length - 1] || newMonthStart;
                                          setSelectedDate(nextDate);
                                        }
                                        setIsMonthSelectOpen(false);
                                      }}
                                      className={cn(
                                        "p-1.5 text-xs rounded-lg transition-colors text-center font-medium cursor-pointer",
                                        selectedDate?.getMonth() === m.value 
                                          ? "bg-primary text-primary-foreground font-bold" 
                                          : "hover:bg-primary/10 text-foreground"
                                      )}
                                    >
                                      {m.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1 relative">
                  <label className="block text-center text-sm font-medium text-foreground">
                    {formType === 'task' ? 'Departamento' : 'Modalidade'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsModalidadeSelectOpen(!isModalidadeSelectOpen)}
                    className={cn(
                      "w-full p-2.5 flex items-center justify-between rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer",
                      isModalidadeSelectOpen && "border-primary ring-1 ring-primary/20",
                      !selectedModalidade && "text-muted-foreground/60 italic"
                    )}
                  >
                    <span className={cn("flex-1 text-center", selectedModalidade ? "font-bold" : "font-normal italic")}>
                      {selectedModalidade || 'Selecionar'}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-foreground/50 transition-transform", isModalidadeSelectOpen && "rotate-180")} />
                  </button>

                  <input type="hidden" name="modalidade" value={selectedModalidade} />

                  <AnimatePresence>
                    {isModalidadeSelectOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsModalidadeSelectOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 right-0 z-40 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
                        >
                          <div className="p-1 flex flex-col gap-1">
                            {availableModalidades.map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const prev = selectedModalidade;
                                  if (opt === prev) {
                                    setSelectedModalidade('');
                                  } else {
                                    setSelectedModalidade(opt);
                                  }
                                  setIsModalidadeSelectOpen(false);
                                  
                                  if (formType === 'event') {
                                    if (opt === 'Prática') {
                                      setFormTitle('Atividades no Centro');
                                    } else if (prev === 'Prática' && formTitle === 'Atividades no Centro') {
                                      setFormTitle('');
                                    }
                                    if (['Ponto Facultativo', 'Feriado'].includes(opt)) {
                                      setFormCover(null);
                                    }
                                  }
                                }}
                                className={cn(
                                  "px-4 py-2 text-sm text-center rounded-lg transition-colors font-medium cursor-pointer",
                                  selectedModalidade === opt 
                                    ? "bg-primary text-primary-foreground font-bold" 
                                    : "hover:bg-primary/10 text-foreground"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {formCategory === 'responsavel' && (
                <div className="space-y-1">
                  <label className="block text-center text-sm font-medium text-foreground">Nome</label>
                  <input 
                    name="title" 
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all" 
                  />
                </div>
              )}

              {(formCategory !== 'orientacao' && formCategory !== 'responsavel') ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-center text-sm font-medium text-foreground">
                      {formType === 'task' 
                        ? (formCategory === 'checklist' ? 'Tarefa' : 'Assunto')
                        : ((formContext === 'recesso' || ['Ponto Facultativo', 'Feriado'].includes(selectedModalidade)) ? 'Título' : 'Tema')}
                    </label>
                    <input 
                      name="title" 
                      value={formTitle} 
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      className="w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all" 
                    />
                  </div>
                </>
              ) : (
                formCategory === 'orientacao' && <input type="hidden" name="title" value="Orientação" />
              )}
              
              {formType === 'event' ? (
                <>
                  {formContext !== 'recesso' && !['Ponto Facultativo', 'Feriado'].includes(selectedModalidade) && (
                    <div className="space-y-1">
                      <label className="block text-center text-sm font-medium text-foreground">Horário</label>
                      <TimeRangePickerDropdown 
                        startTime={formStartTime}
                        onChangeStartTime={setFormStartTime}
                        endTime={formEndTime}
                        onChangeEndTime={setFormEndTime}
                      />
                      <input type="hidden" name="startTime" value={formStartTime} />
                      <input type="hidden" name="endTime" value={formEndTime} />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {formContext !== 'recesso' && !NO_CHAMADA_MODALIDADES.includes(selectedModalidade as any) && (
                      <div className="flex-1 flex flex-col space-y-1">
                        <label className="block text-center text-sm font-medium text-foreground">Chamada</label>
                        <textarea name="description" defaultValue={editingItem?.description || ""} rows={2} className="flex-1 w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all resize-none" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex flex-col space-y-1",
                      (formContext === 'recesso' || NO_CHAMADA_MODALIDADES.includes(selectedModalidade as any)) ? "w-24 mx-auto items-center" : "w-14 shrink-0"
                    )}>
                      <label className="block text-center text-sm font-medium text-foreground">Capa</label>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_SIZE = 1600;
                                let width = img.width;
                                let height = img.height;
                                if (width > height) {
                                  if (width > MAX_SIZE) {
                                    height *= MAX_SIZE / width;
                                    width = MAX_SIZE;
                                  }
                                } else {
                                  if (height > MAX_SIZE) {
                                    width *= MAX_SIZE / height;
                                    height = MAX_SIZE;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  let sourceCanvas = document.createElement('canvas');
                                  sourceCanvas.width = img.width;
                                  sourceCanvas.height = img.height;
                                  const sourceCtx = sourceCanvas.getContext('2d');
                                  if (sourceCtx) {
                                    sourceCtx.drawImage(img, 0, 0);
                                    let curWidth = img.width;
                                    let curHeight = img.height;
                                    while (curWidth * 0.5 > width) {
                                      const stepCanvas = document.createElement('canvas');
                                      stepCanvas.width = Math.round(curWidth * 0.5);
                                      stepCanvas.height = Math.round(curHeight * 0.5);
                                      const stepCtx = stepCanvas.getContext('2d');
                                      if (stepCtx) {
                                        stepCtx.imageSmoothingEnabled = true;
                                        stepCtx.imageSmoothingQuality = 'high';
                                        stepCtx.drawImage(sourceCanvas, 0, 0, stepCanvas.width, stepCanvas.height);
                                      }
                                      sourceCanvas = stepCanvas;
                                      curWidth = stepCanvas.width;
                                      curHeight = stepCanvas.height;
                                    }
                                    ctx.imageSmoothingEnabled = true;
                                    ctx.imageSmoothingQuality = 'high';
                                    ctx.drawImage(sourceCanvas, 0, 0, width, height);
                                  } else {
                                    ctx.imageSmoothingEnabled = true;
                                    ctx.imageSmoothingQuality = 'high';
                                    ctx.drawImage(img, 0, 0, width, height);
                                  }
                                }
                                setFormCover(canvas.toDataURL('image/jpeg', 0.85));
                              };
                              img.src = reader.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "rounded-xl bg-transparent border border-border flex items-center justify-center hover:bg-muted transition-colors text-primary hover:opacity-80 overflow-hidden cursor-pointer",
                          (formContext === 'recesso' || NO_CHAMADA_MODALIDADES.includes(selectedModalidade as any)) ? "w-24 h-24" : "flex-1 w-full"
                        )}
                      >
                        {formCover ? (
                          <img src={formCover} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                (formCategory !== 'checklist') ? (
                  <div className="space-y-1">
                    <label className="block text-center text-sm font-medium text-foreground">
                      {formCategory === 'responsavel' ? 'Designação' : 'Orientação'}
                    </label>
                    <textarea 
                      name="description" 
                      defaultValue={editingItem?.description || ""} 
                      rows={formCategory === 'orientacao' ? 4 : 2} 
                      required={formCategory === 'orientacao'}
                      className="w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all resize-none" 
                    />
                  </div>
                ) : null
              )}
            </>
          )}

          <div className="pt-2 flex justify-center">
            <button 
              type="submit"
              className="w-2/3 max-w-[240px] py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity uppercase tracking-wider text-sm shadow-md cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
