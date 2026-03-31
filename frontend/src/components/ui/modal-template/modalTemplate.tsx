import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = "4xl" }) => {
  if (!open) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full ${maxWidthClass} max-h-[95vh] mx-4 bg-[#f5f5f5] border border-[#c1c1c1]/20 rounded-3xl shadow-2xl p-6 animate-scaleIn transition-transform duration-300 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
        <div className="text-[#1e2923] overflow-y-auto flex-1 pr-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
