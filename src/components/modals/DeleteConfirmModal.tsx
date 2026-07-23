import React from 'react';
import { motion } from 'motion/react';
import { Trash } from 'lucide-react';
import { CalendarItem } from '../../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToDeleteId: string | null;
  items: CalendarItem[];
  onConfirmDelete: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  itemToDeleteId,
  items,
  onConfirmDelete,
}) => {
  if (!isOpen || !itemToDeleteId) return null;

  const item = items.find(i => i.id === itemToDeleteId);
  const isTask = item?.type === 'task';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative bg-card border border-border w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center"
      >
        <div className="flex items-center justify-center mx-auto mb-6">
          <Trash className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold mb-8">
          {isTask ? 'EXCLUIR TAREFA?' : 'EXCLUIR EVENTO?'}
        </h3>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-muted hover:bg-muted-foreground/10 font-bold transition-all cursor-pointer"
          >
            NÃO
          </button>
          <button 
            type="button"
            onClick={() => onConfirmDelete(itemToDeleteId)}
            className="flex-1 py-3 px-4 rounded-2xl bg-destructive text-destructive-foreground hover:opacity-90 font-bold shadow-lg shadow-destructive/20 transition-all cursor-pointer"
          >
            SIM
          </button>
        </div>
      </motion.div>
    </div>
  );
};
