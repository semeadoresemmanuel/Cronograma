import { CalendarItem } from '../types';

export const formatDescription = (item: CalendarItem) => {
  if (!item.description) return "";
  if (item.type === 'task') {
    const names = item.description.split(',').map(n => n.trim()).filter(Boolean);
    if (names.length === 1) {
      return names[0];
    }
    if (names.length === 2) {
      return `${names[0]} e ${names[1]}`;
    }
    if (names.length > 2) {
      const last = names.pop();
      return `${names.join(', ')} e ${last}`;
    }
    return item.description;
  }
  return item.description;
};
