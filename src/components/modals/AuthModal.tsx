import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  authError: boolean;
  setAuthError: (val: boolean) => void;
  setIsAdmin: (val: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  adminPassword,
  setAdminPassword,
  authError,
  setAuthError,
  setIsAdmin,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '1234') {
      setIsAdmin(true);
      onClose();
    } else {
      setAuthError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm p-6 bg-card border border-border rounded-3xl shadow-xl space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Acesso Administrador</h3>
          <button onClick={onClose} className="p-1 rounded-full text-foreground/60 hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <input 
              type="password" 
              placeholder="Digite a senha..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-muted/50 border border-border text-foreground outline-none focus:border-primary"
              autoFocus
            />
            {authError && <p className="text-xs text-destructive">Senha incorreta!</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
            Entrar
          </button>
        </form>
      </motion.div>
    </div>
  );
};
