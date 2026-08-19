import React, { useState } from 'react';
import { Camera, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Trash2, BrainCircuit, ClipboardList } from 'lucide-react';
import { ChecklistItem } from '../types';
import { validateInstallationPhoto } from '../services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChecklistItemProps {
  item: ChecklistItem;
  onUpdate: (updates: Partial<ChecklistItem>) => void;
}

function compressImage(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800; 
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.src = base64;
  });
}

export const ChecklistItemCard: React.FC<ChecklistItemProps> = ({ item, onUpdate }) => {
  const [isValidating, setIsValidating] = useState(false);

  const isMaterialesFaltantes = false;
  const isLocked = item.status === 'Completed' || item.status === 'Reviewed';
  const needsPhoto = item.requiresPhoto && item.photos.length === 0;

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        onUpdate({ photos: [...item.photos, compressed] });
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...item.photos];
    newPhotos.splice(index, 1);
    onUpdate({ photos: newPhotos });
  };

  const handleAIValidation = async () => {
    if (item.photos.length === 0) return;
    setIsValidating(true);
    const lastPhoto = item.photos[item.photos.length - 1];
    const result = await validateInstallationPhoto(lastPhoto, item.label);
    onUpdate({ status: result.success ? 'Reviewed' : 'Error', aiFeedback: result.feedback });
    isValidating && setIsValidating(false);
  };

  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    Pending: { label: 'PENDIENTE', color: 'text-slate-500', icon: AlertCircle },
    Error: { label: 'ERROR', color: 'text-red-500', icon: AlertCircle },
    Reviewed: { label: 'CONFIRMADO', color: 'text-brand-gold', icon: CheckCircle2 },
    Completed: { label: 'CONFIRMADO', color: 'text-brand-gold', icon: CheckCircle2 }
  };

  const currentStatus = statusMap[item.status as keyof typeof statusMap] || statusMap.Pending;

  return (
    <div className={cn(
      "p-5 transition-all duration-300", 
      isLocked ? "bg-brand-green/10" : "bg-transparent",
      item.status === 'Error' && "bg-red-500/5"
    )}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isMaterialesFaltantes && <ClipboardList size={18} className="text-brand-gold" />}
            <h3 className="font-bold text-sm tracking-tight text-slate-100">
              {item.label}
            </h3>
          </div>
          {item.description && <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>}
        </div>
        
        <div className={cn("flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest shrink-0 px-2 py-1 rounded-md bg-black/20", currentStatus.color)}>
          <currentStatus.icon size={12} />
          {currentStatus.label}
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {item.photos.map((photo, idx) => (
              <div key={idx} className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <img src={photo} alt="Evidencia" className="w-full h-full object-cover" />
                {!isLocked && (
                  <button onClick={() => removePhoto(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} className="text-white" />
                  </button>
                )}
              </div>
            ))}
            
            {/* TRUCO HÍBRIDO: DOS BOTONES DE ENTRADA INDEPENDIENTES */}
            {!isLocked && (
              <div className="flex gap-2">
                {/* 1. BOTÓN EXCLUSIVO CÁMARA EN VIVO */}
                <label className={cn(
                  "w-16 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shadow-inner",
                  needsPhoto ? "border-red-500/40 bg-red-500/5 animate-pulse" : "border-white/10 bg-white/5"
                )}>
                  <Camera size={20} className={needsPhoto ? "text-red-500" : "text-brand-gold"} />
                  <span className="text-[8px] font-black tracking-tighter text-white/50 mt-1 uppercase">Cámara</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handlePhotoCapture} 
                    className="hidden" 
                    id={`camera-upload-${item.id}`} 
                  />
                </label>

                {/* 2. BOTÓN EXCLUSIVO GALERÍA DE ARCHIVOS */}
                <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shadow-inner">
                  <ImageIcon size={20} className="text-brand-gold/70" />
                  <span className="text-[8px] font-black tracking-tighter text-white/50 mt-1 uppercase">Galería</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoCapture} 
                    className="hidden" 
                    id={`gallery-upload-${item.id}`} 
                  />
                </label>
              </div>
            )}
          </div>

          {item.requiresAIValidation && !isLocked && item.photos.length > 0 && (
            <button 
              onClick={handleAIValidation} 
              disabled={isValidating} 
              className="w-full py-3 bg-brand-gold text-brand-green-dark hover:bg-brand-gold-light disabled:bg-slate-700 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-gold/10"
            >
              {isValidating ? (
                <><Loader2 className="animate-spin" size={16} /><span>Analizando...</span></>
              ) : (
                <><BrainCircuit size={16} /><span>Validar con SprAI</span></>
              )}
            </button>
          )}
        </div>

        {item.aiFeedback && (
          <div className={cn(
            "p-4 rounded-2xl text-[11px] leading-relaxed border", 
            isLocked ? "bg-brand-gold/5 border-brand-gold/20 text-brand-gold/90" : "bg-red-500/5 border-red-500/20 text-red-400"
          )}>
            <p className="font-black mb-1.5 uppercase text-[9px] tracking-[0.2em] opacity-70">Auditoría SprAI:</p>
            {item.aiFeedback}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
            Observaciones técnicas
          </label>
          <textarea 
            value={item.observations} 
            onChange={(e) => onUpdate({ observations: e.target.value })} 
            disabled={isLocked} 
            placeholder="Escribe notas aquí..." 
            className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 text-slate-200 text-xs focus:ring-1 focus:ring-brand-gold/50 outline-none disabled:opacity-50 transition-all min-h-[80px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};
