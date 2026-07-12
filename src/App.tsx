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
  ChevronUp,
  Trash,
  Pencil,
  Moon,
  Sun,
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

import adminPadlock from '@/src/elements/admin_padlock.svg';
import adminPadlockUnlock from '@/src/elements/admin_padlock_unlock.svg';
import taskMode from '@/src/elements/task_mode.svg';
import timelineMode from '@/src/elements/timeline_mode.svg';
import birthdayIcon from '@/src/elements/birthday_cake.svg';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const MEMBER_BIRTHDAYS = [
  { name: 'Luana', day: 10, month: 0 },
  { name: 'Eder', day: 31, month: 0 },
  { name: 'Amanda', day: 17, month: 1 },
  { name: 'Jean', day: 23, month: 1 },
  { name: 'Gilberto', day: 6, month: 2 },
  { name: 'Vitória', day: 19, month: 2 },
  { name: 'Carlos Henrique', day: 22, month: 2 },
  { name: 'Vinicius', day: 29, month: 4 },
  { name: 'Camila', day: 16, month: 5 },
  { name: 'Alexandre', day: 4, month: 6 },
  { name: 'Alessandra', day: 21, month: 6 },
  { name: 'Elizangela', day: 5, month: 7 },
  { name: 'Carla', day: 17, month: 7 },
  { name: 'Caio', day: 4, month: 8 },
  { name: 'Ruth', day: 25, month: 9 },
  { name: 'Wallace', day: 12, month: 10 },
  { name: 'Maria de Lourdes', day: 14, month: 10 },
  { name: 'Clara', day: 27, month: 10 },
  { name: 'Humberto', day: 5, month: 11 },
  { name: 'Adrielly', day: 19, month: 11 }
];

type Tab = 'cronograma' | 'tarefas';
type ViewMode = 'DAY' | 'MONTH' | 'YEAR';



const AdminIcon = ({ className, unlocked }: { className?: string; unlocked?: boolean }) => {
  return (
    <img 
      src={unlocked ? adminPadlockUnlock : adminPadlock} 
      className={cn("theme-icon-green", className)} 
      alt={unlocked ? "Unlocked" : "Locked"} 
    />
  );
};

const generateNotificationBanner = (title: string, subtitle: string): string => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Create a beautiful green background gradient
  const gradient = ctx.createLinearGradient(0, 0, 600, 300);
  gradient.addColorStop(0, '#00e600'); // Vibrant green
  gradient.addColorStop(0.5, '#00aa00'); // Medium green
  gradient.addColorStop(1, '#005500'); // Deep forest green
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 300);

  // 2. Draw abstract decorative circles (glassmorphism/Google-style weather art)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(520, 60, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(80, 240, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(480, 220, 90, 0, Math.PI * 2);
  ctx.fill();

  // 3. Draw a modern glass panel card in the center
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  const x = 30, y = 30, w = 540, h = 240, r = 24;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Draw Icon Placeholder (Calendar Icon representation)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(85, 80, 30, 0, Math.PI * 2);
  ctx.fill();

  // Calendar symbol lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw outer calendar box in the circle
  ctx.beginPath();
  ctx.rect(73, 70, 24, 22);
  ctx.stroke();
  // Draw hanger tabs
  ctx.beginPath();
  ctx.moveTo(79, 66); ctx.lineTo(79, 70);
  ctx.moveTo(91, 66); ctx.lineTo(91, 70);
  ctx.stroke();
  // Draw grid lines
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(73, 77); ctx.lineTo(97, 77);
  ctx.moveTo(81, 83); ctx.lineTo(81, 89);
  ctx.moveTo(89, 83); ctx.lineTo(89, 89);
  ctx.stroke();

  // 5. Draw Text Details
  // Header text
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 16px "Space Grotesk", sans-serif';
  ctx.fillText('CRONOGRAMA SEMEADORES', 135, 75);

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(135, 90);
  ctx.lineTo(540, 90);
  ctx.stroke();

  // Event title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Space Grotesk", sans-serif';
  // Wrap event title if it's too long
  const maxTitleWidth = 390;
  let titleLine1 = title;
  let titleLine2 = '';
  if (ctx.measureText(title).width > maxTitleWidth) {
    const words = title.split(' ');
    let currentLine = '';
    for (let word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxTitleWidth) {
        titleLine2 = title.substring(currentLine.length).trim();
        titleLine1 = currentLine;
        break;
      }
      currentLine = testLine;
    }
  }

  ctx.fillText(titleLine1, 135, 130);
  if (titleLine2) {
    ctx.fillText(titleLine2, 135, 165);
  }

  // Event subtitle (date / time)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '500 18px "Space Grotesk", sans-serif';
  ctx.fillText(subtitle, 135, titleLine2 ? 210 : 185);

  // Status/Google Weather vibe tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  
  // Use a fallback for roundRect in older canvas contexts
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(135, titleLine2 ? 225 : 205, 140, 30, 15);
  } else {
    ctx.rect(135, titleLine2 ? 225 : 205, 140, 30);
  }
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AGENDA ATUALIZADA', 205, titleLine2 ? 244 : 224);
  
  return canvas.toDataURL('image/png');
};

const sendNotification = (item: CalendarItem) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const trigger = () => {
    const isTask = item.type === 'task';
    const title = isTask ? 'Nova Tarefa Adicionada' : 'Novo Evento Adicionado';
    const dateFormatted = format(item.date, "dd/MM/yyyy", { locale: ptBR });
    const timeRange = item.startTime || item.endTime 
      ? ` (${item.startTime}${item.startTime && item.endTime ? ' - ' : ''}${item.endTime})`
      : '';
    const body = `${item.title}\n📅 Data: ${dateFormatted}${timeRange}\n${item.description || ''}`;
    
    // Fallback to dynamic banner if no cover image
    const bannerUrl = item.cover || generateNotificationBanner(
      item.title, 
      `${isTask ? 'Tarefa' : 'Evento'} • ${dateFormatted}${timeRange}`
    );

    const options: any = {
      body: body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      image: bannerUrl,
      vibrate: [200, 100, 200],
      tag: `semeadores-item-${item.id}`,
      data: {
        url: window.location.origin
      },
      actions: [
        { action: 'open', title: 'Abrir Aplicativo' }
      ]
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      }).catch(() => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  };

  if (Notification.permission === 'granted') {
    trigger();
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        trigger();
      }
    });
  }
};

const getModalidadeColor = (modalidade?: string): string => {
  switch (modalidade) {
    case 'Abertura':
    case 'Encerramento':
    case 'Especial':
    case 'O Livro dos Espíritos':
    case 'Prática':
    case 'Reforma Íntima':
      return 'var(--primary)'; // Verde (#009C00 no Light, #00cc00 no Dark)
    case 'Ponto Facultativo':
      return '#FF8C00ff'; // Laranja
    case 'Feriado':
      return '#FF0000ff'; // Vermelho
    default:
      return 'var(--primary)'; // Default is green
  }
};

const isLocalhost = (hostname: string): boolean => {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local')
  );
};

interface ClockPickerWidgetProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
}

const ClockPickerWidget = ({ value, onChange, label }: ClockPickerWidgetProps) => {
  const [hour, minute] = (value || "00:00").split(":");
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);

  useEffect(() => {
    setTempHour(hour);
  }, [hour]);

  useEffect(() => {
    setTempMinute(minute);
  }, [minute]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(-2);
    setTempHour(val);
    if (val.length === 2) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 23) {
        onChange(`${num.toString().padStart(2, '0')}:${minute}`);
      }
    }
  };

  const handleHourBlur = () => {
    let num = parseInt(tempHour, 10);
    if (isNaN(num) || num < 0 || num > 23) num = 0;
    const formatted = num.toString().padStart(2, '0');
    setTempHour(formatted);
    onChange(`${formatted}:${minute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(-2);
    setTempMinute(val);
    if (val.length === 2) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 59) {
        onChange(`${hour}:${num.toString().padStart(2, '0')}`);
      }
    }
  };

  const handleMinuteBlur = () => {
    let num = parseInt(tempMinute, 10);
    if (isNaN(num) || num < 0 || num > 59) num = 0;
    const formatted = num.toString().padStart(2, '0');
    setTempMinute(formatted);
    onChange(`${hour}:${formatted}`);
  };

  const handleHourIncrement = () => {
    const currentHour = parseInt(hour, 10);
    const nextHour = (currentHour + 1) % 24;
    onChange(`${nextHour.toString().padStart(2, '0')}:${minute}`);
  };

  const handleHourDecrement = () => {
    const currentHour = parseInt(hour, 10);
    const prevHour = (currentHour - 1 + 24) % 24;
    onChange(`${prevHour.toString().padStart(2, '0')}:${minute}`);
  };

  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  
  const handleMinuteIncrement = () => {
    const currentIdx = minutesList.indexOf(minute);
    let nextIdx = 0;
    if (currentIdx !== -1) {
      nextIdx = (currentIdx + 1) % minutesList.length;
    } else {
      const minVal = parseInt(minute, 10);
      nextIdx = minutesList.findIndex(m => parseInt(m, 10) > minVal);
      if (nextIdx === -1) nextIdx = 0;
    }
    onChange(`${hour}:${minutesList[nextIdx]}`);
  };

  const handleMinuteDecrement = () => {
    const currentIdx = minutesList.indexOf(minute);
    let prevIdx = minutesList.length - 1;
    if (currentIdx !== -1) {
      prevIdx = (currentIdx - 1 + minutesList.length) % minutesList.length;
    } else {
      const minVal = parseInt(minute, 10);
      prevIdx = minutesList.findIndex(m => parseInt(m, 10) >= minVal) - 1;
      if (prevIdx < 0) prevIdx = minutesList.length - 1;
    }
    onChange(`${hour}:${minutesList[prevIdx]}`);
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2 bg-muted/20 border border-border p-3.5 rounded-2xl w-[170px] justify-center">
        {/* Hours Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 select-none">Hora</span>
          <button
            type="button"
            onClick={handleHourIncrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronUp className="w-5 h-5 text-primary" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={tempHour}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            onFocus={(e) => {
              const target = e.target;
              setTimeout(() => {
                target.select();
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-14 h-12 text-center bg-muted/50 border border-border rounded-xl text-3xl font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <button
            type="button"
            onClick={handleHourDecrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronDown className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Separator */}
        <div className="text-3xl font-bold text-foreground/50 self-center mt-3 select-none">:</div>

        {/* Minutes Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 select-none">Minuto</span>
          <button
            type="button"
            onClick={handleMinuteIncrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronUp className="w-5 h-5 text-primary" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={tempMinute}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            onFocus={(e) => {
              const target = e.target;
              setTimeout(() => {
                target.select();
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-14 h-12 text-center bg-muted/50 border border-border rounded-xl text-3xl font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <button
            type="button"
            onClick={handleMinuteDecrement}
            className="p-1 rounded-lg hover:bg-primary/10 text-foreground transition-colors cursor-pointer"
          >
            <ChevronDown className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};



interface TimeRangePickerProps {
  startTime: string;
  onChangeStartTime: (val: string) => void;
  endTime: string;
  onChangeEndTime: (val: string) => void;
  disabled?: boolean;
}

const TimeRangePickerDropdown = ({ startTime, onChangeStartTime, endTime, onChangeEndTime, disabled }: TimeRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-2.5 flex items-center rounded-xl bg-card text-foreground border border-border focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center gap-2",
          isOpen && "border-primary ring-1 ring-primary/20",
          !(startTime && endTime) && "text-muted-foreground/60 italic"
        )}
      >
        <span className={cn("flex-1 text-center", startTime && endTime ? "font-bold" : "font-normal")}>
          {startTime && endTime ? `${startTime} - ${endTime}` : 'Selecionar'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[240] bg-black/40 backdrop-blur-[4px]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[250] bg-card border border-border rounded-[2rem] shadow-2xl p-6 flex flex-col items-center gap-6 w-[90%] max-w-[480px]"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
                <ClockPickerWidget value={startTime} onChange={onChangeStartTime} label="Início" />
                <ClockPickerWidget value={endTime} onChange={onChangeEndTime} label="Término" />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!startTime) onChangeStartTime("00:00");
                  if (!endTime) onChangeEndTime("00:00");
                  setIsOpen(false);
                }}
                className={cn(
                  "w-[170px] py-2.5 rounded-xl font-bold transition-all uppercase text-xs tracking-wider cursor-pointer mt-2",
                  startTime && endTime 
                    ? "bg-primary text-primary-foreground hover:opacity-90" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Definir
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const formatDescription = (item: CalendarItem) => {
  if (!item.description) return "";
  if (item.type === 'task') {
    const names = item.description.split(',').map(n => n.trim()).filter(Boolean);
    if (names.length === 1) {
      return names[0];
    }
    if (names.length === 2) {
      return `${names[0]} e ${names[1]}`;
    }
    if (names.length >= 3) {
      const allButLast = names.slice(0, -1).join(', ');
      const last = names[names.length - 1];
      return `${allButLast} e ${last}`;
    }
  }
  return item.description;
};

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
    const isAnyModalOpen = isModalOpen || isBirthdayModalOpen || isAuthModalOpen || isDeleteConfirmOpen || !!selectedImage;
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
  }, [isModalOpen, isBirthdayModalOpen, isAuthModalOpen, isDeleteConfirmOpen, selectedImage]);
  
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
    const initialDate = item ? item.date : date;
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
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border transition-colors">
        <div className="max-w-5xl mx-auto px-2 md:px-6 h-16 flex items-center justify-center gap-4 md:gap-8">
          <motion.button 
            onClick={() => setActiveTab(activeTab === 'cronograma' ? 'tarefas' : 'cronograma')}
            whileHover={{ scale: 1 }}
            className="w-[36px] h-[36px] flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-transform duration-200"
            title={activeTab === 'cronograma' ? 'Ir para Modo Tarefa' : 'Ir para Modo Cronograma'}
          >
            <AnimatePresence initial={false}>
              <motion.img 
                key={activeTab}
                src={activeTab === 'tarefas' ? taskMode : timelineMode} 
                alt="Change App Mode" 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-[24px] h-[24px] absolute z-10 drop-shadow-none theme-icon-green"
              />
            </AnimatePresence>
          </motion.button>

          <div className={cn("px-6 rounded-full flex-shrink-0 relative flex items-center justify-center w-[190px] sm:w-[220px] h-[30px]", darkMode ? "bg-[#262626ff]" : "bg-[#E2E2E2]")}>
            <span className="text-xs font-display font-bold uppercase tracking-widest text-primary">
              {activeTab === 'cronograma' ? 'CRONOGRAMA' : 'TAREFAS'}
            </span>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={cn(
              "w-[56px] h-[30px] shrink-0 rounded-full shadow-inner relative flex items-center px-[3px] transition-colors duration-500 overflow-hidden",
              darkMode ? "bg-[#262626ff] border border-border/50" : "bg-[#e2e2e2]"
            )}
            style={{ boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)' }}
            title="Alternar Tema"
          >
            <div
              className={cn(
                "w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform",
                darkMode ? "bg-[#121212ff] translate-x-[26px] rotate-[360deg]" : "bg-white translate-x-0 rotate-0 shadow-md"
              )}
              style={{ 
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              {darkMode ? (
                <Moon stroke="none" className="w-[14px] h-[14px] text-primary" fill="currentColor" />
              ) : (
                <Sun strokeWidth={3} className="w-[14px] h-[14px] text-primary" fill="currentColor" />
              )}
            </div>
          </button>

          <motion.button 
            onClick={() => { 
              if (isAdmin) setIsAdmin(false);
              else {
                setAdminPassword('');
                setAuthError(false);
                setIsAuthModalOpen(true);
              }
            }}
            whileHover={{ scale: 1 }}
            className="w-[36px] h-[36px] flex items-center justify-center shrink-0 transition-transform duration-200"
            title="Modo Administrador"
          >
            <AdminIcon 
              className={cn(
                "w-[24px] h-[24px] transition-all duration-300 transform-gpu",
                isAdmin ? "opacity-100" : "opacity-40 hover:opacity-100"
              )} 
              unlocked={isAdmin} 
            />
          </motion.button>
        </div>
      </header>

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
                                      className="text-sm font-black uppercase tracking-widest italic text-center"
                                      style={{ color: getModalidadeColor(item.modalidade) }}
                                    >
                                      {item.modalidade}
                                    </span>
                                  )}
                                  <h4 className="text-base font-display font-black text-foreground tracking-tight text-center leading-tight">
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
                      <div className="flex justify-center -mt-2 mb-4">
                        <button 
                          onClick={() => openAddModal(today, undefined, 'task', 'checklist')} 
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

