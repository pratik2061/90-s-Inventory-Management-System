import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl mx-4 bg-[#f5f5f5] border border-[#c1c1c1]/20 rounded-3xl shadow-2xl p-6 animate-scaleIn transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title ? (
            <h2 className="text-lg font-black uppercase tracking-widest text-amber-600">
              {title}
            </h2>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6d7e74] hover:text-amber-600 hover:bg-[#f5f5f5]/10 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="text-[#1e2923]">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
