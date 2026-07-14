import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarItem } from '../types';

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const MEMBER_BIRTHDAYS = [
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

export const generateNotificationBanner = (title: string, subtitle: string): string => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const gradient = ctx.createLinearGradient(0, 0, 600, 300);
  gradient.addColorStop(0, '#00e600'); 
  gradient.addColorStop(0.5, '#00aa00'); 
  gradient.addColorStop(1, '#005500'); 
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 300);

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

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(85, 80, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.rect(73, 70, 24, 22);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(79, 66); ctx.lineTo(79, 70);
  ctx.moveTo(91, 66); ctx.lineTo(91, 70);
  ctx.stroke();
  
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(73, 77); ctx.lineTo(97, 77);
  ctx.moveTo(81, 83); ctx.lineTo(81, 89);
  ctx.moveTo(89, 83); ctx.lineTo(89, 89);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 16px "Space Grotesk", sans-serif';
  ctx.fillText('CRONOGRAMA SEMEADORES', 135, 75);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(135, 90);
  ctx.lineTo(540, 90);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Space Grotesk", sans-serif';
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

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '500 18px "Space Grotesk", sans-serif';
  ctx.fillText(subtitle, 135, titleLine2 ? 210 : 185);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  
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

export const sendNotification = (item: CalendarItem) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const trigger = () => {
    const isTask = item.type === 'task';
    const title = isTask ? 'Nova Tarefa Adicionada' : 'Novo Evento Adicionado';
    const dateFormatted = format(item.date, "dd/MM/yyyy", { locale: ptBR });
    const timeRange = item.startTime || item.endTime 
      ? ` (${item.startTime}${item.startTime && item.endTime ? ' - ' : ''}${item.endTime})`
      : '';
    const body = `${item.title}\n📅 Data: ${dateFormatted}${timeRange}\n${item.description || ''}`;
    
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

export const getModalidadeColor = (modalidade?: string): string => {
  switch (modalidade) {
    case 'Abertura':
    case 'Encerramento':
    case 'Especial':
    case 'O Livro dos Espíritos':
    case 'Prática':
    case 'Reforma Íntima':
      return 'var(--primary)';
    case 'Ponto Facultativo':
      return '#FF8C00ff';
    case 'Feriado':
      return '#FF0000ff';
    default:
      return 'var(--primary)';
  }
};

export const isLocalhost = (hostname: string): boolean => {
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
