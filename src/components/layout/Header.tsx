import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AdminIcon } from '../ui/AdminIcon';
import taskMode from '../../elements/task_mode.svg';
import timelineMode from '../../elements/timeline_mode.svg';

interface HeaderProps {
  activeTab: 'cronograma' | 'tarefas';
  setActiveTab: (tab: 'cronograma' | 'tarefas') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  setIsAuthModalOpen: (val: boolean) => void;
  setAdminPassword: (val: string) => void;
  setAuthError: (val: boolean) => void;
}

export const Header = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  isAdmin,
  setIsAdmin,
  setIsAuthModalOpen,
  setAdminPassword,
  setAuthError,
}: HeaderProps) => {
  return (
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
  );
};
