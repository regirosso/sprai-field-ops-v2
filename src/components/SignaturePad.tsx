import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  initialValue?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, initialValue }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasSignature, setHasSignature] = useState(!!initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initCanvas = () => {
    if (containerRef.current && sigCanvas.current) {
      try {
        const canvas = sigCanvas.current.getCanvas();
        canvas.width = containerRef.current.offsetWidth;
        canvas.height = containerRef.current.offsetHeight;
        
        if (initialValue) {
          sigCanvas.current.fromDataURL(initialValue);
        }
        setError(null);
      } catch (e) {
        setError("Error al inicializar: " + (e instanceof Error ? e.message : String(e)));
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(initCanvas, 200);
    window.addEventListener('resize', initCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  const clear = () => {
    sigCanvas.current?.clear();
    setHasSignature(false);
    onSave('');
    setError(null);
  };

  const handleSave = () => {
    if (!sigCanvas.current) {
      setError("Error: El panel de firma no está listo.");
      return;
    }

    try {
      setIsSaving(true);
      const canvas = sigCanvas.current.getCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      
      // Verificación básica de contenido (si el dataUrl es muy corto, está vacío)
      if (dataUrl.length < 1000) {
        // No bloqueamos, pero avisamos
        console.warn("Firma detectada como vacía");
      }

      onSave(dataUrl);
      setHasSignature(true);
      setError(null);
      
      setTimeout(() => setIsSaving(false), 500);
    } catch (e) {
      setError("Error al guardar: " + (e instanceof Error ? e.message : String(e)));
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative border-2 border-slate-700 rounded-lg bg-white overflow-hidden h-48">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-full cursor-crosshair',
          }}
          onBegin={() => {
            setHasSignature(false);
            setError(null);
          }}
          onEnd={handleSave}
        />
        {hasSignature && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg animate-in fade-in zoom-in">
            <CheckCircle2 size={12} />
            FIRMA REGISTRADA
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-red-500/90 text-white p-4 flex flex-col items-center justify-center text-center z-10">
            <AlertCircle size={32} className="mb-2" />
            <p className="text-xs font-bold">{error}</p>
            <button 
              onClick={initCanvas}
              className="mt-2 px-4 py-1 bg-white text-red-500 rounded-full text-[10px] font-black"
            >
              REINTENTAR
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={clear}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-2"
        >
          <Trash2 size={16} />
          Borrar
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 border ${
            hasSignature 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-brand-gold text-brand-green-dark border-brand-gold/30 hover:bg-brand-gold-light'
          }`}
        >
          {isSaving ? 'GUARDANDO...' : hasSignature ? 'FIRMA CONFIRMADA ✓' : 'CONFIRMAR FIRMA'}
        </button>
      </div>
    </div>
  );
};
