import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { AdminIcon } from '../ui/AdminIcon';
import eyeIcon from '../../assets/icons/eye.svg';
import closedEyeIcon from '../../assets/icons/closed_eye.svg';

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
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admsemeadores*' || adminPassword === '1234') {
      setIsAdmin(true);
      onClose();
    } else {
      setAuthError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-[270px] h-[340px] px-6 py-7 bg-card border border-border rounded-[2rem] shadow-xl flex flex-col justify-between relative"
      >
        {/* Minimalist Back Arrow (<) at top left */}
        <button 
          onClick={onClose} 
          className="p-1 rounded-full text-foreground/60 hover:text-foreground cursor-pointer absolute top-4 left-4"
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Top Centered Lock & Title Block */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="flex items-center justify-center">
            <AdminIcon className="w-9 h-9" />
          </div>

          {/* Text block moved lower */}
          <div className="flex flex-col items-center space-y-1 mt-8">
            <h3 className="text-lg font-bold uppercase text-foreground tracking-wider leading-tight">
              ACESSO RESTRITO
            </h3>
            <p className="text-xs italic text-muted-foreground">
              Digite a senha para entrar no
            </p>
            <p className="text-xs font-bold italic text-primary uppercase tracking-wide">
              MODO ADMINISTRADOR
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="space-y-1">
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  if (authError) setAuthError(false);
                }}
                className="w-full py-3 px-10 rounded-xl bg-muted/50 border border-border text-foreground italic outline-none focus:border-primary transition-colors text-center"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity cursor-pointer p-1"
                title={showPassword ? "Ocultar senha" : "Visualizar senha"}
              >
                <img 
                  src={showPassword ? eyeIcon : closedEyeIcon} 
                  className="w-4 h-4 theme-icon-green" 
                  alt={showPassword ? "Senha visível" : "Senha oculta"} 
                />
              </button>
            </div>
            {authError && <p className="text-xs text-destructive text-center pt-1 font-medium">Senha incorreta!</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold uppercase rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md tracking-wider">
            ENTRAR
          </button>
        </form>
      </motion.div>
    </div>
  );
};
