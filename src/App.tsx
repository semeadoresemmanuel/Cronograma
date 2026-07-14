import { Header } from './components/layout/Header';
// Refined visual theme and updated assets
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  isMonday, 
  addMonths, 
  startOfMonth, 
  endOfMonth,
  endOfDay,
  isSameDay,
  parseISO,
  isAfter,
  isBefore,
  nextMonday,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfWeek,
  isSameMonth,
  isSameWeek,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Trash,
  Pencil,
  X,
  Upload,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import { collection, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { CalendarItem, ItemType } from '@/src/types';

import birthdayIcon from '@/src/elements/birthday_cake.svg';
import eyeIcon from '@/src/elements/eye.svg';
import pdfDownloadIcon from '@/src/elements/pdf_download.svg';

import { generateUUID, MEMBER_BIRTHDAYS, sendNotification, getModalidadeColor, isLocalhost } from './utils/helpers';
import { formatDescription } from './utils/formatters';
import { AdminIcon } from './components/ui/AdminIcon';
import { TimeRangePickerDropdown } from './components/ui/TimePickers';
import { Tab, ViewMode } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('cronograma');
  const [formStartTime, setFormStartTime] = useState<string>("");
  const [formEndTime, setFormEndTime] = useState<string>("");

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const sendWelcome = () => {
        const welcomeSent = localStorage.getItem('smd_welcome_sent');
        if (!welcomeSent) {
          const welcomeItem: CalendarItem = {
            id: 'welcome',
            title: 'Notificações Ativas! 🎉',
            date: new Date(),
            type: 'event',
            description: 'Você receberá avisos importantes sobre as tarefas e encontros diretamente na barra de notificações do seu celular.'
          };
          sendNotification(welcomeItem);
          localStorage.setItem('smd_welcome_sent', 'true');
        }
      };

      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            sendWelcome();
          }
        });
      } else if (Notification.permission === 'granted') {
        sendWelcome();
      }
    }
  }, []);


  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('smd_theme');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('DAY');

  const [selectedMonthInYearView, setSelectedMonthInYearView] = useState<Date | null>(null);



  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [items, setItems] = useState<CalendarItem[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
      const fetchedItems: CalendarItem[] = [];
      const todayStart = startOfDay(new Date());
      snapshot.forEach((docSnap) => {
        try {
          const data = docSnap.data();
          if (data && data.date) {
            const itemDate = parseISO(data.date);
            const isOutdatedTask = data.type === 'task' && isBefore(startOfDay(itemDate), todayStart);
            if (isOutdatedTask) {
              // Delete outdated task from Firestore in background
              deleteDoc(doc(db, 'items', docSnap.id)).catch(err => {
                console.error("Error deleting outdated task:", docSnap.id, err);
              });
            } else {
              fetchedItems.push({
                ...data,
                id: docSnap.id,
                date: itemDate,
              } as CalendarItem);
            }
          }
        } catch (e) {
          console.warn('Skipping malformed item', docSnap.id, e);
        }
      });
      setItems(fetchedItems);
    }, () => {
      // Erro tratado silenciosamente em produção
    });

    return () => unsubscribe();
  }, []);

  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return isLocalhost(window.location.hostname);
    }
    return false;
  });
  const [currentDate] = useState(() => {
    const today = new Date();
    const monthEnd = endOfMonth(today);
    const mondays = eachDayOfInterval({ start: startOfMonth(today), end: monthEnd }).filter(d => isMonday(d));
    if (mondays.length === 0) return today;
    const lastMonday = mondays[mondays.length - 1];
    // If the last meeting of the month has passed, start showing the next month
    return isAfter(today, endOfDay(lastMonday)) ? startOfMonth(addMonths(today, 1)) : today;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [isFutureTasksModalOpen, setIsFutureTasksModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  const [selectedModalidade, setSelectedModalidade] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formType, setFormType] = useState<ItemType>('event');
  const [formCategory, setFormCategory] = useState<'checklist' | 'responsavel' | 'orientacao' | undefined>(undefined);
  const [formContext, setFormContext] = useState<'encontro' | 'recesso' | undefined>(undefined);
  const [formCover, setFormCover] = useState<string | null>(null);
  const [isDaySelectOpen, setIsDaySelectOpen] = useState(false);
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [isModalidadeSelectOpen, setIsModalidadeSelectOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [isMemberSelectOpen, setIsMemberSelectOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabOpenDate, setFabOpenDate] = useState<string | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);

  const handleReorder = (newOrder: CalendarItem[]) => {
    setItems(prev => {
      const next = [...prev];
      const indices = newOrder.map(item => prev.findIndex(i => i.id === item.id)).sort((a, b) => a - b);
      indices.forEach((globalIndex, i) => {
        if (globalIndex !== -1) {
          next[globalIndex] = newOrder[i];
          const updatedItem = newOrder[i];
          setDoc(doc(db, 'items', updatedItem.id), { ...updatedItem, date: updatedItem.date.toISOString() });
        }
      });
      return next;
    });
  };



  useEffect(() => { 
    localStorage.setItem('smd_theme', JSON.stringify(darkMode)); 
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => { localStorage.setItem('smd_view', JSON.stringify(viewMode)); }, [viewMode]);

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isBirthdayModalOpen || isFutureTasksModalOpen || isAuthModalOpen || isDeleteConfirmOpen || !!selectedImage;
    if (isAnyModalOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isBirthdayModalOpen, isFutureTasksModalOpen, isAuthModalOpen, isDeleteConfirmOpen, selectedImage]);
  
  const displayDates = useMemo(() => {
    try {
      const today = currentDate;
      const monthEnd = endOfMonth(today);
      const mondays = eachDayOfInterval({ start: startOfMonth(today), end: monthEnd }).filter(d => isMonday(d));
      const lastMonday = mondays[mondays.length - 1] || today;
      // Use startOfMonth when advancing to ensure we don't skip to the end of the next month
      const effectiveMonthDate = isAfter(today, endOfDay(lastMonday)) ? startOfMonth(addMonths(today, 1)) : today;
      
      if (viewMode === 'YEAR' && selectedMonthInYearView) {
        const interval = eachDayOfInterval({ 
          start: startOfMonth(selectedMonthInYearView), 
          end: endOfMonth(selectedMonthInYearView) 
        });
        return activeTab === 'cronograma' ? interval.filter(d => isMonday(d)) : interval;
      } else if (viewMode === 'MONTH') {
        const interval = eachDayOfInterval({ 
          start: startOfMonth(effectiveMonthDate), 
          end: endOfMonth(effectiveMonthDate) 
        });
        return activeTab === 'cronograma' ? interval.filter(d => isMonday(d)) : interval;
      } else if (viewMode === 'DAY') {
        if (activeTab === 'cronograma') {
          return [isMonday(today) ? today : nextMonday(today)];
        }
        return [today];
      }
    } catch (e) { return []; }
    return [];
  }, [viewMode, selectedMonthInYearView, activeTab]);

  const yearMonths = useMemo(() => {
    return eachMonthOfInterval({
      start: startOfYear(currentDate),
      end: endOfYear(currentDate)
    });
  }, [currentDate]);





  const saveItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      title: formData.get('title') as string,
      date: selectedDate || new Date(),
      type: formType,
      category: formCategory,
      startTime: (formData.get('startTime') as string) || "",
      endTime: (formData.get('endTime') as string) || "",
      description: (formData.get('description') as string) || "",
      modalidade: formData.get('modalidade') as string,
      cover: formCover || undefined,
      completed: editingItem ? editingItem.completed : false,
      order: editingItem?.order ?? Date.now()
    };

    if (editingItem) {
      const updatedItem = { ...editingItem, ...itemData };
      setItems(items.map(item => item.id === editingItem.id ? updatedItem : item));
      const docData = { ...updatedItem, date: updatedItem.date.toISOString() };
      const cleanDocData = Object.fromEntries(
        Object.entries(docData).filter(([_, v]) => v !== undefined)
      );
      setDoc(doc(db, 'items', updatedItem.id), cleanDocData).catch(() => {});
    } else {
      const newItem = { id: generateUUID(), ...itemData };
      setItems([...items, newItem]);
      const docData = { ...newItem, date: newItem.date.toISOString() };
      const cleanDocData = Object.fromEntries(
        Object.entries(docData).filter(([_, v]) => v !== undefined)
      );
      setDoc(doc(db, 'items', newItem.id), cleanDocData).catch(() => {});
      sendNotification(newItem);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const openAddModal = (date: Date = new Date(), item?: CalendarItem, type: ItemType = 'event', category?: 'checklist' | 'responsavel' | 'orientacao') => {
    const initialDate = item ? item.date : (type === 'task' ? null : date);
    setSelectedDate(initialDate);
    setSelectedDay(initialDate ? initialDate.getDate() : null);
    setSelectedMonth(initialDate ? initialDate.getMonth() : null);
    setEditingItem(item || null);
    setSelectedModalidade(item?.modalidade || '');
    setSelectedMember(item?.description || '');
    setIsMemberSelectOpen(false);
    setIsDaySelectOpen(false);
    setIsMonthSelectOpen(false);
    setFormTitle(item?.title || '');
    setFormType(item?.type || type);
    setFormCategory(item?.category || category);
    setFormCover(item?.cover || null);
    if (item) {
      setFormStartTime(item.startTime || "00:00");
      setFormEndTime(item.endTime || "00:00");
      if (item.type === 'event' && ['Ponto Facultativo', 'Feriado'].includes(item.modalidade || '')) {
        setFormContext('recesso');
      } else if (item.type === 'event') {
        setFormContext('encontro');
      } else {
        setFormContext(undefined);
      }
    } else {
      setFormStartTime("");
      setFormEndTime("");
    }
    
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24 md:pb-0 font-sans selection:bg-primary/20 transition-colors duration-300">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} setDarkMode={setDarkMode} isAdmin={isAdmin} setIsAdmin={setIsAdmin} setIsAuthModalOpen={setIsAuthModalOpen} setAdminPassword={setAdminPassword} setAuthError={setAuthError} />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-6 min-h-[calc(100vh-160px)]">
        
        {/* TAB 1: CRONOGRAMA (HIG + Material 3) */}
        {activeTab === 'cronograma' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex justify-center w-full mb-6 -mt-2">
                <div className={cn("flex p-1 rounded-full flex-shrink-0 relative w-[190px] sm:w-[220px] h-[30px]", darkMode ? "bg-[#262626ff]" : "bg-[#E2E2E2]")}>
                    {(['DAY', 'MONTH', 'YEAR'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          setViewMode(mode);
                          if (mode === 'YEAR') setSelectedMonthInYearView(null);
                        }}
                        className={cn(
                          "flex-1 flex items-center justify-center rounded-full text-xs font-display font-bold uppercase tracking-wider transition-colors relative",
                          viewMode === mode ? "text-primary" : (darkMode ? "text-[#f7f7f7ff] hover:text-primary/80" : "text-[#121212ff] hover:text-primary/80")
                        )}
                      >
                        {viewMode === mode && (
                          <motion.div
                            layoutId="activeViewModeBody"
                            className="absolute inset-0 bg-background shadow-sm rounded-full"
                            transition={{ type: "tween", duration: 0.2 }}
                          />
                        )}
                        <span className="relative z-10">
                          {mode === 'DAY' ? 'Dia' : mode === 'MONTH' ? 'Mês' : 'Ano'}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
              {(viewMode === 'MONTH' || (viewMode === 'YEAR' && selectedMonthInYearView)) && (
                <div className="relative w-full flex flex-col items-center justify-center mb-4 pb-2 border-b border-border">
                  {(viewMode === 'MONTH' || (viewMode === 'YEAR' && selectedMonthInYearView)) && 
                   MEMBER_BIRTHDAYS.some(b => b.month === ((viewMode === 'YEAR' && selectedMonthInYearView) ? selectedMonthInYearView : currentDate).getMonth()) && (
                    <button 
                      onClick={() => setIsBirthdayModalOpen(true)}
                      className="absolute right-2 md:right-4 top-1.5 p-1 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center hover:bg-card"
                      title="Aniversariantes do Mês"
                    >
                      <img 
                        src={birthdayIcon} 
                        className="w-7 h-7 theme-icon-green object-contain" 
                        alt="Aniversariantes" 
                      />
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    {viewMode === 'YEAR' && (
                      <button 
                        onClick={() => {
                          if (selectedMonthInYearView) {
                            setSelectedMonthInYearView(addMonths(selectedMonthInYearView, -1));
                          }
                        }}
                        className="p-1 transition-colors text-primary hover:opacity-70"
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </button>
                    )}
                    
                    <h2 className="text-3xl font-black tracking-tight text-foreground uppercase font-display text-center">
                      {(() => {
                        if (viewMode === 'MONTH') {
                          return format(currentDate, 'MMMM', { locale: ptBR });
                        }
                        return format(selectedMonthInYearView!, 'MMMM', { locale: ptBR });
                      })()}
                    </h2>

                    {viewMode === 'YEAR' && (
                      <button 
                        onClick={() => {
                          if (selectedMonthInYearView) {
                            setSelectedMonthInYearView(addMonths(selectedMonthInYearView, 1));
                          }
                        }}
                        className="p-1 transition-colors text-primary hover:opacity-70"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </button>
                    )}
                  </div>
                  
                  <span className="text-sm font-bold uppercase tracking-widest text-primary -mt-1">
                    {format(viewMode === 'YEAR' ? selectedMonthInYearView! : currentDate, 'yyyy')}
                  </span>
                </div>
              )}

              {viewMode === 'YEAR' && !selectedMonthInYearView && (
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
                          onClick={() => setSelectedMonthInYearView(month)}
                          className={cn(
                            "p-6 lg:p-5 rounded-3xl border transition-all text-left group relative overflow-hidden",
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
                                  <span className="font-bold text-primary shrink-0">
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
              )}

              {(viewMode !== 'YEAR' || selectedMonthInYearView) && (
                <div className="space-y-8">
                {displayDates.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">Nenhum evento neste período.</div>
                ) : (
                  displayDates.map((date) => {
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
                                      {/* Connection lines */}
                                      <div className="absolute right-full w-2.5 h-[1px] bg-primary/25 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      <div className="absolute left-0 w-[1px] h-[34px] bg-primary/25 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      <div className="absolute left-0 w-2.5 h-[1px] bg-primary/25 top-[22%] pointer-events-none" />
                                      <div className="absolute left-0 w-2.5 h-[1px] bg-primary/25 top-[78%] pointer-events-none" />

                                      <button
                                        onClick={() => {
                                          openAddModal(date, undefined, 'event');
                                          setSelectedModalidade('');
                                          setFormContext('encontro');
                                          setFabOpenDate(null);
                                        }}
                                        className="px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border-0 shadow-md whitespace-nowrap cursor-pointer"
                                      >
                                        Adicionar Encontro
                                      </button>
                                      <button
                                        onClick={() => {
                                          openAddModal(date, undefined, 'event');
                                          setSelectedModalidade('');
                                          setFormContext('recesso');
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
                                {/* Topo - Modalidade centralizada no alto, e abaixo o Tema */}
                                <div className="w-full flex flex-col items-center gap-2">
                                  {item.modalidade && (
                                    <span 
                                      className="text-sm font-display font-bold uppercase tracking-widest text-center"
                                      style={{ color: getModalidadeColor(item.modalidade) }}
                                    >
                                      {item.modalidade}
                                    </span>
                                  )}
                                  <h4 className="text-base font-display font-normal italic text-foreground tracking-tight text-center leading-tight">
                                    {item.title}
                                  </h4>
                                </div>

                                {/* Meio - Capa e Descrição (centralizados) */}
                                {(item.type !== 'task' || item.description) && (
                                  <div className="flex flex-col items-center gap-3 py-1 w-full">
                                    {item.type !== 'task' && (
                                      <div className={cn(
                                        "p-1.5 border-[0.5px] rounded-[1.5rem] shrink-0 w-full max-w-[252px]",
                                        darkMode ? "border-zinc-600" : "border-zinc-500"
                                      )}>
                                        <div 
                                          onClick={() => item.cover && setSelectedImage({url: item.cover, title: item.title})}
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

                                {/* Base - Horário (centralizado) e Botões de Admin (Canto inferior direito) */}
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
                                      <button onClick={() => openAddModal(item.date, item)} className="p-1 rounded-full transition-colors text-primary/70 hover:text-primary hover:bg-primary/10">
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <div 
                                        className={cn(
                                          "h-4 mx-1 w-[0.5px]",
                                          darkMode ? "bg-zinc-600" : "bg-zinc-500"
                                        )}
                                      />
                                      <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); setIsDeleteConfirmOpen(true); }} className="p-1 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                                        <Trash className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ));
                          })()}
                          {(() => {
                            if (viewMode !== 'DAY') return null;
                            const weekBirthdays = MEMBER_BIRTHDAYS.filter(birthday => {
                              const bdayDate = new Date(date.getFullYear(), birthday.month, birthday.day);
                              return isSameWeek(bdayDate, date, { weekStartsOn: 1 });
                            });
                            if (weekBirthdays.length === 0) return null;
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
                                  {weekBirthdays.map(birthday => {
                                    const isToday = birthday.day === date.getDate() && birthday.month === date.getMonth();
                                    return (
                                      <div 
                                        key={birthday.name} 
                                        className={cn(
                                          "mx-auto w-fit min-w-[200px] max-w-full px-8 py-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 border border-primary/30 bg-transparent transition-all duration-300",
                                          isToday && "shadow-sm shadow-primary/20"
                                        )}
                                      >
                                        <p className="font-bold text-foreground text-center text-sm">{birthday.name}</p>
                                        <p className="font-bold text-primary text-base text-center">
                                          {String(birthday.day).padStart(2, '0')}/{String(birthday.month + 1).padStart(2, '0')}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'tarefas' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            {(() => {
              // Current week for user view
              const today = new Date();
              const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
              
              const activeTaskDate = currentWeekStart;

              // 3. MAIN DASHBOARD (User or Admin specific week)
              if (activeTaskDate) {
                const weekItems = items.filter(i => 
                  i.type === 'task' && 
                  isSameDay(startOfWeek(i.date, { weekStartsOn: 1 }), activeTaskDate)
                );

                const checklist = weekItems.filter(i => i.category === 'checklist');

                return (
                  <div className="max-w-xl mx-auto">
                    {isAdmin && (
                      <div className="flex justify-center items-center gap-3 -mt-2 mb-4">
                        <button 
                          onClick={() => openAddModal(activeTaskDate, undefined, 'task', 'checklist')} 
                          className="flex items-center w-[150px] sm:w-[180px] h-[30px] rounded-full transition-all duration-200 hover:scale-105 cursor-pointer font-bold text-[9px] sm:text-xs uppercase tracking-wider border-0 bg-card text-primary px-0"
                        >
                          <div className="flex items-center justify-center w-10 h-full gap-2.5 pl-1.5">
                            <span className="text-sm font-light">+</span>
                            <span className="w-[1px] h-3.5 bg-primary/20" />
                          </div>
                          <div className="flex-1 flex items-center justify-center pr-2">
                            <span className="pt-[1px]">ADICIONAR TAREFA</span>
                          </div>
                        </button>

                        <button 
                          onClick={() => setIsFutureTasksModalOpen(true)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-full transition-all duration-200 hover:scale-105 cursor-pointer border-0 bg-card text-primary p-0 shrink-0"
                          title="Visualizar Tarefas Futuras"
                        >
                          <img src={eyeIcon} className="w-[16px] h-[16px] theme-icon-green" alt="Tarefas Futuras" />
                        </button>
                      </div>
                    )}
                    
                    {checklist.length > 0 ? (
                      <Reorder.Group axis="y" values={checklist} onReorder={handleReorder} className="space-y-3 flex-1 flex flex-col">
                        {checklist.map((item) => {
                                  return (
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
                                                openAddModal(item.date, item, 'task', 'checklist');
                                              }} 
                                              className="text-primary hover:opacity-80 transition-transform"
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
                                                setItemToDelete(item.id);
                                                setIsDeleteConfirmOpen(true);
                                              }} 
                                              className="text-destructive transition-transform"
                                            >
                                              <Trash className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </Reorder.Item>
                                  );
                                })}
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
                );
              }

              return null;
            })()}
          </motion.div>
        )}




        {/* Configurações removidas e movidas para Menu FAB */}
      </main>



      {/* Material 3 Bottom Sheet / Modal for Adding Event */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div 
              onClick={() => { setIsModalOpen(false); setEditingItem(null); setIsMemberSelectOpen(false); }} 
              className="absolute inset-0 bottom-sheet-overlay pointer-events-auto" 
            />
            <div 
              className={cn(
                "w-full bg-background sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl relative z-10 pointer-events-auto max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300",
                (formType === 'task' && formCategory === 'checklist') ? "sm:max-w-4xl" : "sm:max-w-md",
                isMemberSelectOpen ? "h-[85vh] sm:h-[650px]" : "h-auto"
              )}
            >
              <div className="sticky top-0 bg-background z-20 pt-5 pb-3 px-6 flex items-center justify-center border-b border-border">
                <div className="w-12 h-1.5 bg-muted rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />
                <h2 className="text-lg font-bold uppercase text-primary">
                  {formCategory === 'responsavel' 
                    ? (editingItem ? 'Editar Responsáveis' : 'Selecionar Responsáveis')
                    : (editingItem ? 'Editar ' : 'Adicionar ') + (formCategory === 'orientacao' ? 'Orientação' : (formType === 'task' ? 'Tarefa' : (formContext === 'recesso' ? 'Recesso' : 'Encontro')))}
                </h2>
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingItem(null); setIsMemberSelectOpen(false); }} className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors absolute right-4">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form key={editingItem?.id || 'new'} onSubmit={saveItem} className="p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
                {formType === 'task' && formCategory === 'checklist' ? (
                  // New single line layout for task
                  <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_1fr_2fr] gap-4 items-start w-full">
                    {/* 1. Tarefa */}
                    <div className="space-y-1 w-full">
                      <label className="block text-center text-sm font-medium text-foreground">Tarefa</label>
                      <input 
                        name="title" 
                        value={formTitle} 
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                        placeholder="DESCREVA A TAREFA"
                        className="w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all placeholder:italic placeholder:text-xs" 
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
                                  {['Música', 'Recepção', 'Som'].map((opt, index) => {
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
                                <div className="w-full flex flex-col gap-0.5 pr-1">
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

                    {/* 4. Data e Horário (Lado a Lado) */}
                    <div className="grid grid-cols-2 gap-4 w-full md:col-span-1">
                      {/* Data */}
                      <div className="space-y-1 relative w-full">
                        <label className="block text-center text-sm font-medium text-foreground">Data</label>
                        <button
                          type="button"
                          onClick={() => {
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
                                  {/* Left: Days (Scrollable) */}
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

                                  {/* Right: Months (Scrollable) */}
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
                  // Original form fields
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
                                                  "p-1.5 text-xs rounded-lg transition-colors text-center font-medium",
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
                                                const currentMondayIdx = currentMondays.findIndex(d => isSameDay(d, selectedDate));
                                                
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
                                              "p-1.5 text-xs rounded-lg transition-colors text-center capitalize font-medium",
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
                                  {(formType === 'task' 
                                    ? ['Música', 'Recepção', 'Som']
                                    : (formContext === 'recesso'
                                        ? ['Feriado', 'Ponto Facultativo']
                                        : (formContext === 'encontro'
                                            ? ['Abertura', 'Encerramento', 'Especial', 'O Livro dos Espíritos', 'Prática', 'Reforma Intima']
                                            : ['Abertura', 'Encerramento', 'Especial', 'Feriado', 'O Livro dos Espíritos', 'Ponto Facultativo', 'Prática', 'Reforma Intima']
                                          )
                                      )
                                  ).map(opt => (
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
                                        "px-4 py-2 text-sm text-center rounded-lg transition-colors font-medium",
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
                        {formType === 'task' && formCategory === 'checklist' && (
                          <div className="space-y-1">
                            <label className="block text-center text-sm font-medium text-foreground">Membro(s)</label>
                            <button
                              type="button"
                              onClick={() => setIsMemberSelectOpen(!isMemberSelectOpen)}
                              className={cn(
                                "w-full p-2.5 flex items-center justify-between rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer",
                                isMemberSelectOpen && "border-primary ring-1 ring-primary/20",
                                !selectedMember && "text-muted-foreground/60 italic"
                              )}
                            >
                              <span className="flex-1 text-center font-bold">
                                {selectedMember || 'Selecionar'}
                              </span>
                              <ChevronDown className={cn("w-4 h-4 text-foreground/50 transition-transform", isMemberSelectOpen && "rotate-180")} />
                            </button>

                            <input type="hidden" name="description" value={selectedMember} />

                            <AnimatePresence>
                              {isMemberSelectOpen && (
                                <>
                                  <div className="absolute inset-0 z-30 bg-background/60 backdrop-blur-sm" onClick={() => setIsMemberSelectOpen(false)} />
                                  <div className="absolute inset-0 z-40 flex items-center justify-center p-5 pointer-events-none">
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto no-scrollbar pointer-events-auto"
                                    >
                                      <div className="p-1 flex flex-col gap-1">
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
                                          'Wallace'
                                        ].map(opt => {
                                          const isSelected = selectedMember.split(', ').filter(Boolean).includes(opt);
                                          return (
                                            <button
                                              key={opt}
                                              type="button"
                                              onClick={() => {
                                                const currentMembers = selectedMember ? selectedMember.split(', ').filter(Boolean) : [];
                                                let nextMembers;
                                                if (currentMembers.includes(opt)) {
                                                  nextMembers = currentMembers.filter(m => m !== opt);
                                                } else {
                                                  nextMembers = [...currentMembers, opt];
                                                }
                                                nextMembers.sort();
                                                setSelectedMember(nextMembers.join(', '));
                                              }}
                                              className={cn(
                                                "px-4 py-2 text-sm text-center rounded-lg transition-colors font-medium",
                                                isSelected 
                                                  ? "bg-primary text-primary-foreground font-bold" 
                                                  : "hover:bg-primary/10 text-foreground"
                                              )}
                                            >
                                              {opt}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  </div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
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
                          {formContext !== 'recesso' && !['Ponto Facultativo', 'Feriado'].includes(selectedModalidade) && (
                            <div className="flex-1 flex flex-col space-y-1">
                              <label className="block text-center text-sm font-medium text-foreground">Chamada</label>
                              <textarea name="description" defaultValue={editingItem?.description || ""} rows={2} className="flex-1 w-full p-2.5 text-center rounded-xl bg-transparent border border-border focus:border-primary outline-none transition-all resize-none" />
                            </div>
                          )}
                          
                          <div className={cn(
                            "flex flex-col space-y-1",
                            (formContext === 'recesso' || ['Ponto Facultativo', 'Feriado'].includes(selectedModalidade)) ? "w-24 mx-auto items-center" : "w-14 shrink-0"
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
                                "rounded-xl bg-transparent border border-border flex items-center justify-center hover:bg-muted transition-colors text-primary hover:opacity-80 overflow-hidden",
                                (formContext === 'recesso' || ['Ponto Facultativo', 'Feriado'].includes(selectedModalidade)) ? "w-24 h-24" : "flex-1 w-full"
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

                    {formType === 'task' && (
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
                  </>
                )}
                
                <div className="pt-1 flex justify-center">
                  <button type="submit" className="px-8 py-2.5 rounded-xl bg-primary text-[#F7F7F7] dark:text-[#121212] font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity uppercase text-sm">
                    {editingItem ? 'Alterar' : 'Implementar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* Birthday Modal */}
      <AnimatePresence>
        {isBirthdayModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div 
              onClick={() => setIsBirthdayModalOpen(false)} 
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
                  onClick={() => setIsBirthdayModalOpen(false)} 
                  className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors absolute right-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {format((viewMode === 'YEAR' && selectedMonthInYearView) ? selectedMonthInYearView : currentDate, 'MMMM', { locale: ptBR })}
                  </span>
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
                    Parabéns aos Celebrados!
                  </h3>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const targetMonth = ((viewMode === 'YEAR' && selectedMonthInYearView) ? selectedMonthInYearView : currentDate).getMonth();
                    const filtered = MEMBER_BIRTHDAYS.filter(b => b.month === targetMonth)
                      .sort((a, b) => a.day - b.day);
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground italic">
                          Nenhum aniversariante neste mês.
                        </div>
                      );
                    }
                    return filtered.map(birthday => {
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
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Future Tasks Modal */}
      <AnimatePresence>
        {isFutureTasksModalOpen && isAdmin && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div 
              onClick={() => setIsFutureTasksModalOpen(false)} 
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
                  onClick={() => setIsFutureTasksModalOpen(false)} 
                  className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors absolute right-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">
                <div className="space-y-4">
                  {(() => {
                    const todayStart = startOfDay(new Date());
                    const filteredTasks = items
                      .filter(item => 
                        item.type === 'task' && 
                        item.category === 'checklist' && 
                        isAfter(startOfDay(item.date), todayStart)
                      )
                      .sort((a, b) => a.date.getTime() - b.date.getTime());

                    if (filteredTasks.length === 0) {
                      return (
                        <div className="text-center py-12 text-muted-foreground italic">
                          Nenhuma tarefa futura agendada.
                        </div>
                      );
                    }

                    return filteredTasks.map(item => (
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
                                  setIsFutureTasksModalOpen(false);
                                  openAddModal(item.date, item, 'task', 'checklist');
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
                                onClick={() => {
                                  setItemToDelete(item.id);
                                  setIsDeleteConfirmOpen(true);
                                }} 
                                className="text-destructive hover:opacity-80 transition-transform cursor-pointer"
                                title="Excluir"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Auth Modal (Custom In-App Password Area) */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-start p-4 pt-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-[300px] bg-card border border-border p-4 pt-6 rounded-[40px] shadow-2xl text-center"
            >
              {/* Back Button */}
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className={cn(
                  "absolute top-6 left-6 p-1 transition-colors hover:text-primary",
                  darkMode ? "text-[#f7f7f7ff]" : "text-[#09090B]"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-primary mb-5 flex justify-center">
                <AdminIcon className="w-9 h-9" unlocked={isAdmin} />
              </div>
              <h2 className="text-xl font-display font-bold uppercase tracking-widest text-foreground mb-1">Acesso Restrito</h2>
              <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed">
                Digite a senha para entrar no<br />
                <strong className="italic">MODO ADMINISTRADOR</strong>
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    autoFocus
                    placeholder=""
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAuthError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (adminPassword === 'admsemeadores*') {
                          setIsAdmin(true);
                          setIsAuthModalOpen(false);
                        } else {
                          setAuthError(true);
                        }
                      }
                    }}
                    className={cn(
                      "w-full border-[0.5px] rounded-2xl px-12 py-4 text-center text-lg tracking-widest italic focus:outline-none transition-all text-primary",
                      darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]",
                      authError ? "border-destructive ring-1 ring-destructive" : (darkMode ? "border-[#F7F7F7]/30" : "border-[#121212]/30")
                    )}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary z-10"
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {authError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive font-bold mt-2 uppercase tracking-tighter"
                    >
                      Senha Incorreta! Tente novamente.
                    </motion.p>
                  )}
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      if (adminPassword === 'admsemeadores*') {
                        setIsAdmin(true);
                        setIsAuthModalOpen(false);
                      } else {
                        setAuthError(true);
                      }
                    }}
                    className="w-full bg-primary text-[#f7f7f7ff] font-display font-bold uppercase py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all"
                  >
                    Acessar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* Custom Deletion Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative bg-card border border-border w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="flex items-center justify-center mx-auto mb-6">
                <Trash className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-8">
                {items.find(i => i.id === itemToDelete)?.type === 'task' ? 'EXCLUIR TAREFA?' : 'EXCLUIR EVENTO?'}
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-muted hover:bg-muted-foreground/10 font-bold transition-all"
                >
                  NÃO
                </button>
                <button 
                  onClick={() => {
                    if (itemToDelete) {
                      const deletedId = itemToDelete;
                      setItems(prev => prev.filter(i => i.id !== itemToDelete));
                      deleteDoc(doc(db, 'items', deletedId));
                      setItemToDelete(null);
                      setIsDeleteConfirmOpen(false);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-destructive text-destructive-foreground hover:opacity-90 font-bold shadow-lg shadow-destructive/20 transition-all"
                >
                  SIM
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            />
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="relative z-10 mb-2 md:mb-6 p-2 text-[#f7f7f7ff]"
              title="Fechar"
            >
              <X className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" />
            </motion.button>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative z-10 w-full max-w-5xl max-h-[70vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img src={selectedImage.url} alt="Preview" className="max-w-full max-h-full object-contain" />
            </motion.div>
            <motion.a 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              href={selectedImage.url} 
              download={`${selectedImage.title.toLowerCase().replace(/\s+/g, '')}.png`}
              onClick={() => setSelectedImage(null)}
              className="relative z-10 mt-2 md:mt-6 p-2 text-[#f7f7f7ff]"
              title="Baixar Imagem (PNG)"
            >
              <Download className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" />
            </motion.a>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}





