import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, ChevronDown, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { TimeRangePickerDropdown } from '../ui/TimePickers';
import { CalendarItem, ItemType } from '../../types';
import { 
  TASK_DEPARTMENTS, 
  RECESSO_MODALIDADES, 
  ENCONTRO_MODALIDADES, 
  ALL_EVENT_MODALIDADES 
} from '../../constants/modalidades';
import { TEAM_MEMBERS } from '../../constants/members';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: CalendarItem | null;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
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
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  selectedDate,
  setSelectedDate,
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
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDaySelectOpen, setIsDaySelectOpen] = useState(false);
  const [isModalidadeSelectOpen, setIsModalidadeSelectOpen] = useState(false);
  const [isMemberSelectOpen, setIsMemberSelectOpen] = useState(false);
  const [isDeleteCoverConfirmOpen, setIsDeleteCoverConfirmOpen] = useState(false);

  // Local state for Day/Month task picker dialog
  const [tempDay, setTempDay] = useState<number | null>(selectedDate ? selectedDate.getDate() : null);
  const [tempMonth, setTempMonth] = useState<number | null>(selectedDate ? selectedDate.getMonth() : null);

  useEffect(() => {
    if (selectedDate) {
      setTempDay(selectedDate.getDate());
      setTempMonth(selectedDate.getMonth());
    } else {
      setTempDay(null);
      setTempMonth(null);
    }
  }, [selectedDate, isOpen]);

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

  // Process image with client-side canvas compression
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let curCanvas = document.createElement('canvas');
        curCanvas.width = img.width;
        curCanvas.height = img.height;
        const curCtx = curCanvas.getContext('2d');
        if (curCtx) {
          curCtx.drawImage(img, 0, 0);
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
              stepCtx.drawImage(curCanvas, 0, 0, stepCanvas.width, stepCanvas.height);
            }
            curCanvas = stepCanvas;
            curWidth = curCanvas.width;
            curHeight = curCanvas.height;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(curCanvas, 0, 0, width, height);
        } else {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        setFormCover(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

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
              {/* 1. Departamento */}
              <div className="space-y-1 relative w-full">
                <label className="block text-center text-sm font-medium text-foreground">Departamento</label>
                <button
                  type="button"
                  onClick={() => setIsModalidadeSelectOpen(!isModalidadeSelectOpen)}
                  className={cn(
                    "w-full p-2.5 flex items-center justify-between rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer",
                    isModalidadeSelectOpen && "border-primary ring-1 ring-primary/20",
                    !selectedModalidade && "text-muted-foreground/60 italic"
                  )}
                >
                  <span className={cn("flex-1 text-center", selectedModalidade ? "font-bold" : "font-normal")}>
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
                          {[...TASK_DEPARTMENTS].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSelectedModalidade(selectedModalidade === opt ? '' : opt);
                                setIsModalidadeSelectOpen(false);
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

              {/* 2. Tarefa(s) / Assunto */}
              <div className="space-y-1 w-full">
                <label className="block text-center text-sm font-medium text-foreground">
                  {formCategory === 'checklist' ? 'Tarefa(s)' : 'Assunto'}
                </label>
                <input 
                  name="title" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all" 
                />
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
                            {TEAM_MEMBERS.map(opt => {
                              const isSelected = selectedMember.split(', ').filter(Boolean).includes(opt);
                              const isTodosOption = opt === 'Todos os Membros';
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    const currentMembers = selectedMember ? selectedMember.split(', ').filter(Boolean) : [];
                                    let nextMembers: string[];
                                    if (opt === 'Todos os Membros') {
                                      nextMembers = currentMembers.includes('Todos os Membros') ? [] : ['Todos os Membros'];
                                    } else {
                                      const activeIndividual = currentMembers.filter(m => m !== 'Todos os Membros');
                                      nextMembers = activeIndividual.includes(opt) 
                                        ? activeIndividual.filter(m => m !== opt) 
                                        : [...activeIndividual, opt];
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
                    onClick={() => {
                      setTempDay(selectedDate ? selectedDate.getDate() : null);
                      setTempMonth(selectedDate ? selectedDate.getMonth() : null);
                      setIsDaySelectOpen(!isDaySelectOpen);
                    }}
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
                                  const maxDaysInSelectedMonth = tempMonth !== null ? new Date(new Date().getFullYear(), tempMonth + 1, 0).getDate() : 31;
                                  const isDisabled = d > maxDaysInSelectedMonth;
                                  const isSelected = tempDay === d;
                                  return (
                                    <button
                                      key={d}
                                      type="button"
                                      disabled={isDisabled}
                                      onClick={() => setTempDay(tempDay === d ? null : d)}
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
                                ].map(m => (
                                  <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setTempMonth(tempMonth === m.value ? null : m.value)}
                                    className={cn(
                                      "py-2 text-sm rounded-xl transition-colors text-center font-bold shrink-0 cursor-pointer",
                                      tempMonth === m.value 
                                        ? "bg-primary text-primary-foreground" 
                                        : "hover:bg-primary/10 text-foreground"
                                    )}
                                  >
                                    {m.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={tempDay === null || tempMonth === null}
                            onClick={() => {
                              if (tempDay !== null && tempMonth !== null) {
                                const year = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
                                setSelectedDate(new Date(year, tempMonth, tempDay));
                                setIsDaySelectOpen(false);
                              }
                            }}
                            className={cn(
                              "w-[170px] py-2.5 rounded-xl font-bold transition-all uppercase text-xs tracking-wider mt-2",
                              (tempDay !== null && tempMonth !== null) 
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
            // Event / Recesso form fields
            <>
              {/* Modalidade / Tipo Dropdown */}
              <div className="space-y-1 relative">
                <label className="block text-center text-sm font-medium text-foreground">
                  {formContext === 'recesso' ? 'Tipo' : 'Modalidade'}
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
                                if (prev === opt) {
                                  setSelectedModalidade('');
                                } else {
                                  setSelectedModalidade(opt);
                                }
                                setIsModalidadeSelectOpen(false);

                                if (['Ponto Facultativo', 'Feriado'].includes(opt)) {
                                  setFormCover(null);
                                }
                                if (opt === 'Ensaio Musical') {
                                  setFormTitle('');
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

              {/* Título / Tema */}
              {selectedModalidade !== 'Ensaio Musical' ? (
                <div className="space-y-1">
                  <label className="block text-center text-sm font-medium text-foreground">
                    {(formContext === 'recesso' || ['Ponto Facultativo', 'Feriado'].includes(selectedModalidade)) ? 'Título' : 'Tema'}
                  </label>
                  <input 
                    name="title" 
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all" 
                  />
                </div>
              ) : (
                <input type="hidden" name="title" value="" />
              )}

              {/* Horário (Event only) */}
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

              {/* Capa */}
              <div className="flex flex-col items-center space-y-1 w-full pt-1">
                <label className="block text-center text-sm font-medium text-foreground">Capa</label>
                <div className="relative">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {formCover ? (
                    <button
                      type="button"
                      onClick={() => setIsDeleteCoverConfirmOpen(true)}
                      className="group relative w-24 h-24 rounded-2xl border border-border overflow-hidden cursor-pointer"
                      title="Clique para remover a capa"
                    >
                      <img src={formCover} alt="Preview" className="w-full h-full object-cover" />
                      
                      {/* Overlay translúcido com X centralizado ao passar o mouse ou clicar */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                        <X className="w-8 h-8 text-white/90 stroke-[2.5]" />
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-2xl bg-transparent border border-border flex items-center justify-center hover:bg-muted transition-colors text-primary hover:opacity-80 overflow-hidden cursor-pointer"
                      title="Adicionar capa"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={!selectedDate}
              className={cn(
                "w-full py-3.5 bg-primary text-primary-foreground font-black text-sm uppercase rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md tracking-wider",
                !selectedDate && "opacity-50 cursor-not-allowed"
              )}
            >
              {editingItem ? 'SALVAR' : 'ADICIONAR'}
            </button>
          </div>
        </form>

        {/* Cover Delete Confirmation Dialog */}
        <AnimatePresence>
          {isDeleteCoverConfirmOpen && (
            <>
              <div 
                className="fixed inset-0 z-[240] bg-black/50 backdrop-blur-sm pointer-events-auto" 
                onClick={() => setIsDeleteCoverConfirmOpen(false)} 
              />
              <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-card border border-border w-full max-w-sm rounded-[2rem] p-6 sm:p-8 shadow-2xl text-center pointer-events-auto"
                >
                  <div className="flex items-center justify-center mx-auto mb-5">
                    <Trash className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-6 text-foreground uppercase tracking-wide">
                    REMOVER CAPA?
                  </h3>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsDeleteCoverConfirmOpen(false)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-destructive text-destructive-foreground hover:opacity-90 font-bold shadow-lg shadow-destructive/20 transition-all cursor-pointer"
                    >
                      NÃO
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setFormCover(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        setIsDeleteCoverConfirmOpen(false);
                      }}
                      className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer"
                    >
                      SIM
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
