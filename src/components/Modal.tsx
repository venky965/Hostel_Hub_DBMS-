import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-lg bg-white dark:bg-card-bg rounded-xl shadow-2xl overflow-hidden border dark:border-border"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-border">
            <h2 className="text-lg font-bold">Hostel Hub: {title}</h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-8 overflow-y-auto max-h-[80vh]">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
