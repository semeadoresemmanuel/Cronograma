export type ItemType = 'task' | 'event';

export interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  type: ItemType;
  category?: 'checklist' | 'responsavel' | 'orientacao';
  startTime?: string;
  endTime?: string;
  description?: string;
  modalidade?: string;
  completed?: boolean;
  order?: number;
  cover?: string;
}
