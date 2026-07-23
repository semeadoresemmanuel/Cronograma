import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  eachDayOfInterval, 
  eachMonthOfInterval, 
  isMonday, 
  parseISO,
  startOfDay,
  endOfDay,
  isAfter
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { cn } from './lib/utils';
import { generateUUID, isLocalhost, sendNotification } from './utils/helpers';
import { CalendarItem, ItemType, Tab, ViewMode } from './types';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/modals/AuthModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { BirthdayModal } from './components/modals/BirthdayModal';
import { ImageViewerModal } from './components/modals/ImageViewerModal';
import { ItemFormModal } from './components/modals/ItemFormModal';
import { FutureTasksModal } from './components/modals/FutureTasksModal';
import { YearView } from './components/views/YearView';
import { MonthDayView } from './components/views/MonthDayView';
import { TasksView } from './components/views/TasksView';
import birthdayIcon from './elements/birthday_cake.svg';
import { MEMBER_BIRTHDAYS } from './constants/birthdays';

export default function App() {
  // Navigation & Preferences State
  const [activeTab, setActiveTab] = useState<Tab>('cronograma');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smd_view');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return 'DAY'; }
      }
    }
    return 'DAY';
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smd_theme');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return false; }
      }
    }
    return false;
  });

  // Admin Access State
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return isLocalhost(window.location.hostname);
    }
    return false;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Data & Modal States
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [selectedMonthInYearView, setSelectedMonthInYearView] = useState<Date | null>(null);
  const [currentDate] = useState(() => {
    const today = new Date();
    const monthEnd = endOfMonth(today);
    const mondays = eachDayOfInterval({ start: startOfMonth(today), end: monthEnd }).filter(d => isMonday(d));
    if (mondays.length === 0) return today;
    const lastMonday = mondays[mondays.length - 1];
    return isAfter(today, endOfDay(lastMonday)) ? startOfMonth(addMonths(today, 1)) : today;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [isFutureTasksModalOpen, setIsFutureTasksModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  // Form State
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedModalidade, setSelectedModalidade] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formType, setFormType] = useState<ItemType>('event');
  const [formCategory, setFormCategory] = useState<'checklist' | 'responsavel' | 'orientacao' | undefined>(undefined);
  const [formContext, setFormContext] = useState<'encontro' | 'recesso' | undefined>(undefined);
  const [formCover, setFormCover] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<string>('');
  const [formEndTime, setFormEndTime] = useState<string>('');

  // Sync Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
      const fetchedItems: CalendarItem[] = [];
      const todayStart = startOfDay(new Date());

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.date) {
          const itemDate = parseISO(data.date);
          const isOutdatedTask = data.type === 'task' && data.category === 'checklist' && itemDate < todayStart;
          if (isOutdatedTask) {
            deleteDoc(doc(db, 'items', docSnap.id)).catch(() => {});
          } else {
            fetchedItems.push({
              id: docSnap.id,
              title: data.title || '',
              date: itemDate,
              type: data.type || 'event',
              category: data.category,
              startTime: data.startTime || '',
              endTime: data.endTime || '',
              description: data.description || '',
              modalidade: data.modalidade || '',
              completed: data.completed || false,
              order: data.order ?? 0,
              cover: data.cover
            });
          }
        }
      });
      setItems(fetchedItems);
    });

    return () => unsubscribe();
  }, []);

  // Theme & View Preferences Persistence
  useEffect(() => { 
    localStorage.setItem('smd_theme', JSON.stringify(darkMode)); 
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => { 
    localStorage.setItem('smd_view', JSON.stringify(viewMode)); 
  }, [viewMode]);

  // Lock body scroll on modal open
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

  // Derived Date Collections
  const displayDates = useMemo(() => {
    try {
      const today = currentDate;
      const monthEnd = endOfMonth(today);
      const mondays = eachDayOfInterval({ start: startOfMonth(today), end: monthEnd }).filter(d => isMonday(d));
      const lastMonday = mondays[mondays.length - 1] || today;
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
        return [new Date()];
      }
    } catch (e) { return []; }
    return [];
  }, [viewMode, selectedMonthInYearView, activeTab, currentDate]);

  const yearMonths = useMemo(() => {
    return eachMonthOfInterval({
      start: startOfYear(currentDate),
      end: endOfYear(currentDate)
    });
  }, [currentDate]);

  // Form Modal Handler
  const openAddModal = useCallback((date: Date = new Date(), item?: CalendarItem, type: ItemType = 'event', category?: 'checklist' | 'responsavel' | 'orientacao') => {
    const initialDate = item ? item.date : (type === 'task' ? date : date);
    setSelectedDate(initialDate);
    setSelectedDay(initialDate ? initialDate.getDate() : null);
    setSelectedMonth(initialDate ? initialDate.getMonth() : null);
    setSelectedModalidade(item?.modalidade || '');
    setFormTitle(item?.title || '');
    setFormType(type);
    setFormCategory(category || item?.category);

    if (item) {
      if (['Feriado', 'Ponto Facultativo'].includes(item.modalidade || '')) {
        setFormContext('recesso');
      } else {
        setFormContext('encontro');
      }
    } else {
      setFormContext(type === 'event' ? 'encontro' : undefined);
    }

    setEditingItem(item || null);
    setFormCover(item?.cover || null);
    setSelectedMember(item?.category === 'checklist' ? (item.description || '') : '');
    setFormStartTime(item?.startTime || '');
    setFormEndTime(item?.endTime || '');
    setIsModalOpen(true);
  }, []);

  const handleSaveItem = useCallback((e: React.FormEvent<HTMLFormElement>) => {
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
      setItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      const docData = { ...updatedItem, date: updatedItem.date.toISOString() };
      const cleanDocData = Object.fromEntries(
        Object.entries(docData).filter(([_, v]) => v !== undefined)
      );
      setDoc(doc(db, 'items', updatedItem.id), cleanDocData).catch(() => {});
    } else {
      const newItem = { id: generateUUID(), ...itemData };
      setItems(prev => [...prev, newItem]);
      const docData = { ...newItem, date: newItem.date.toISOString() };
      const cleanDocData = Object.fromEntries(
        Object.entries(docData).filter(([_, v]) => v !== undefined)
      );
      setDoc(doc(db, 'items', newItem.id), cleanDocData).catch(() => {});
      sendNotification(newItem);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  }, [selectedDate, formType, formCategory, formCover, editingItem]);

  const handleConfirmDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    deleteDoc(doc(db, 'items', id)).catch(() => {});
    setItemToDelete(null);
    setIsDeleteConfirmOpen(false);
  }, []);

  const handleReorder = useCallback((newOrder: CalendarItem[]) => {
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
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans pb-12 select-none">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        setIsAuthModalOpen={setIsAuthModalOpen}
        setAdminPassword={setAdminPassword}
        setAuthError={setAuthError}
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-[16.5px] flex flex-col items-center w-full">
        {/* Secondary Navigation - Cronograma Controls */}
        {activeTab === 'cronograma' && (
          <div className="w-full mb-6 space-y-4 flex flex-col items-center">
            {/* View Selector Tabs: DIA / MÊS / ANO */}
            <div className="flex justify-center w-full">
              <div className={cn(
                "p-[3px] flex items-center gap-0.5 border border-border/40 shadow-inner rounded-full h-[30px]",
                darkMode ? "bg-[#262626]" : "bg-[#E2E2E2]"
              )}>
                {(['DAY', 'MONTH', 'YEAR'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      if (mode === 'YEAR') setSelectedMonthInYearView(null);
                    }}
                    className={cn(
                      "px-4 h-full text-[10px] sm:text-[11px] font-black rounded-full transition-all relative cursor-pointer select-none uppercase tracking-wider flex items-center justify-center",
                      viewMode === mode 
                        ? "text-primary" 
                        : (darkMode ? "text-white hover:text-white/80" : "text-black hover:text-black/80")
                    )}
                  >
                    {viewMode === mode && (
                      <motion.div
                        layoutId="activeViewTab"
                        className={cn(
                          "absolute inset-0 rounded-full shadow-sm",
                          darkMode ? "bg-[#121212]" : "bg-white"
                        )}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 pt-[1px]">
                      {mode === 'DAY' ? 'Dia' : mode === 'MONTH' ? 'Mês' : 'Ano'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Birthdays Badge in Month or Year View */}
            {(viewMode === 'MONTH' || (viewMode === 'YEAR' && selectedMonthInYearView)) && (
              <div className="relative w-full flex flex-col items-center justify-center mb-4 pb-2 border-b border-border">
                {MEMBER_BIRTHDAYS.some(b => b.month === ((viewMode === 'YEAR' && selectedMonthInYearView) ? selectedMonthInYearView : currentDate).getMonth()) && (
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
                      className="p-1 rounded-full text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <span className="text-xl md:text-2xl font-black font-display text-primary uppercase tracking-tight">
                    {format((viewMode === 'YEAR' && selectedMonthInYearView) ? selectedMonthInYearView : currentDate, 'MMMM', { locale: ptBR })}
                  </span>
                  {viewMode === 'YEAR' && (
                    <button 
                      onClick={() => {
                        if (selectedMonthInYearView) {
                          setSelectedMonthInYearView(addMonths(selectedMonthInYearView, 1));
                        }
                      }} 
                      className="p-1 rounded-full text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                  {format(viewMode === 'YEAR' ? selectedMonthInYearView! : currentDate, 'yyyy')}
                </span>
              </div>
            )}

            {/* Year View Component */}
            {viewMode === 'YEAR' && !selectedMonthInYearView && (
              <YearView
                yearMonths={yearMonths}
                items={items}
                darkMode={darkMode}
                onSelectMonth={(month) => setSelectedMonthInYearView(month)}
              />
            )}

            {/* Month / Day Timeline View Component */}
            {(viewMode !== 'YEAR' || selectedMonthInYearView) && (
              <MonthDayView
                displayDates={displayDates}
                items={items}
                viewMode={viewMode}
                darkMode={darkMode}
                isAdmin={isAdmin}
                onOpenAddModal={openAddModal}
                onSelectModalidade={setSelectedModalidade}
                onSetFormContext={setFormContext}
                onSetSelectedImage={setSelectedImage}
                onConfirmDeleteItem={(id) => {
                  setItemToDelete(id);
                  setIsDeleteConfirmOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* Tasks Tab Component */}
        {activeTab === 'tarefas' && (
          <TasksView
            items={items}
            darkMode={darkMode}
            isAdmin={isAdmin}
            onOpenAddModal={openAddModal}
            onOpenFutureTasksModal={() => setIsFutureTasksModalOpen(true)}
            onConfirmDeleteItem={(id) => {
              setItemToDelete(id);
              setIsDeleteConfirmOpen(true);
            }}
            onReorder={handleReorder}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <AnimatePresence>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          authError={authError}
          setAuthError={setAuthError}
          setIsAdmin={setIsAdmin}
        />

        <DeleteConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          itemToDeleteId={itemToDelete}
          items={items}
          onConfirmDelete={handleConfirmDelete}
        />

        <BirthdayModal
          isOpen={isBirthdayModalOpen}
          onClose={() => setIsBirthdayModalOpen(false)}
          viewMode={viewMode}
          selectedMonthInYearView={selectedMonthInYearView}
          currentDate={currentDate}
        />

        <ImageViewerModal
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
        />

        <FutureTasksModal
          isOpen={isFutureTasksModalOpen}
          onClose={() => setIsFutureTasksModalOpen(false)}
          isAdmin={isAdmin}
          items={items}
          darkMode={darkMode}
          onOpenAddModal={openAddModal}
          onConfirmDeleteItem={(id) => {
            setItemToDelete(id);
            setIsDeleteConfirmOpen(true);
          }}
        />

        <ItemFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formType={formType}
          setFormType={setFormType}
          formCategory={formCategory}
          setFormCategory={setFormCategory}
          formContext={formContext}
          setFormContext={setFormContext}
          selectedModalidade={selectedModalidade}
          setSelectedModalidade={setSelectedModalidade}
          formCover={formCover}
          setFormCover={setFormCover}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          formStartTime={formStartTime}
          setFormStartTime={setFormStartTime}
          formEndTime={formEndTime}
          setFormEndTime={setFormEndTime}
          viewMode={viewMode}
          onSave={handleSaveItem}
        />
      </AnimatePresence>
    </div>
  );
}
