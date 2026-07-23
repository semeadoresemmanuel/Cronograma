import React from 'react';
import { motion } from 'motion/react';
import { X, Download } from 'lucide-react';

interface ImageViewerModalProps {
  selectedImage: { url: string; title: string } | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  selectedImage,
  onClose,
}) => {
  if (!selectedImage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
      />
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="relative z-10 mb-2 md:mb-6 p-2 text-[#f7f7f7ff] cursor-pointer"
        title="Fechar"
      >
        <X className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" />
      </motion.button>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 w-full max-w-5xl max-h-[70vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      >
        <img src={selectedImage.url} alt="Preview" className="max-w-full max-h-full object-contain" />
      </motion.div>
      <motion.a 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        href={selectedImage.url} 
        download={`${selectedImage.title.toLowerCase().replace(/\s+/g, '')}.png`}
        onClick={onClose}
        className="relative z-10 mt-2 md:mt-6 p-2 text-[#f7f7f7ff] cursor-pointer"
        title="Baixar Imagem (PNG)"
      >
        <Download className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" />
      </motion.a>
    </div>
  );
};
