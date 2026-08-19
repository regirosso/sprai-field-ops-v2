import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_SECTIONS } from './constants';
import { AppState, ChecklistItem, HistoryItem } from './types';
import { ChecklistItemCard } from './components/ChecklistItemCard';
import { SignaturePad } from './components/SignaturePad';
import { DeepAgroLogo } from './components/Logos';
import { finalizeReport, FinalizeResult } from './utils/pdfExport';
import {
  Download,
  Trash2,
  History,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Menu,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Loader2 = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const STORAGE_KEY = 'sprai_field_ops_state_v3';
const HISTORY_KEY = 'sprai_field_ops_history_v1';
const CHECKLIST_VERSION = "1.0"; 
const MANUAL_URL = "https://drive.google.com/file/d/1QbV19gyzQJ7m-RmMByxMsYnTQI7TCr_4/view?usp=sharing";
const DRIVE_URL = "https://drive.google.com/drive/folders/1zT7zaRkViAkC9i5OBMopSVvMr4zFoxBf";
const NO_CONFORME_URL = "https://docs.google.com/forms/d/e/1FAIpQLScjD1F9yLhrdwMwO_16bTHK-OXnM55FYK5nim1vhvZl0ljVCg/viewform";

interface ExtendedAppState extends AppState {
  dobleTanqueConfig?: 'SI' | 'NO' | null;
  starlinkConfig?: 'SI' | 'NO' | null;
  compresorConfig?: 'SI' | 'NO' | null;   
  farosExtraConfig?: 'SI' | 'NO' | null;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const MASTER_PIN = "2415"; 

  // Fecha de hoy local limpia
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const fechaHoyString = `${year}-${month}-${day}`;

  // Estado inicial limpio de fábrica
  const initialState: ExtendedAppState = {
    sections: INITIAL_SECTIONS,
    clientName: '',
    sprAiNumber: '',
    signerName: '',
    signerCompany: '',
    signerRole: '',
    date: fechaHoyString,
    dateInicio: '',
    dateFin: fechaHoyString,
    dobleTanqueConfig: null, 
    starlinkConfig: null,
    compresorConfig: null,   
    farosExtraConfig: null,
  };

  // Estados para controlar el borrador intermedio
  const [state, setState] = useState<ExtendedAppState>(initialState);
  const [pendingDraft, setPendingDraft] = useState<ExtendedAppState | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false); 

  // Al arrancar, revisamos si hay un borrador pendiente
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clientName || parsed.sprAiNumber) {
          setPendingDraft(parsed);
          setShowDraftModal(true);
        }
      }
    } catch (e) { console.error(e); }
  }, []);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [currentGroupId, setCurrentGroupId] = useState('mod'); 
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-guardado condicional
  useEffect(() => {
    if (!isFinished && (state.clientName || state.sprAiNumber)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isFinished]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTop = 0;
  }, [currentGroupId]);

  const groups = [
    { id: 'mod', label: '1. Módulos' },
    { id: 'far', label: '2. Faros' },
    { id: 'del', label: '3. Delanteros' },
    { id: 'pul', label: '4. Pulverización' },
    { id: 'hid', label: '5. Hidráulica' },
    { id: 'cab', label: '6. Cableado' },
    { id: 'con', label: '7. Conexiones' },
    { id: 'sen', label: '8. Sensor Rueda' },
    { id: 'man', label: '9. Manómetro' },
    { id: 'ele', label: '10. Eléctrica' },
    { id: 'neu', label: '11. Neumática' },
    { id: 'sta', label: '12. Starlink' },
    { id: 'ext', label: '13. Extras' },
    { id: 'val', label: '14. VALIDACIÓN FINAL' },
  ];

  const updateItem = (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
        };
      }),
    }));
  };

  const isSectionComplete = (groupId: string) => {
    if (groupId === 'val') {
      return !!(state.signature && state.signature.length > 50 && state.signerName.trim().length > 1);
    }
    
    const sectionItems = state.sections[0].items.filter(item => item.id.startsWith(groupId));
    if (sectionItems.length === 0) return false;

    return sectionItems.every(item => {
      const isCompresor = item.label.toLowerCase().includes("compresor funcionamiento");
      const isFarosExtra = item.label.toLowerCase().includes("faros extra");
      
      // 🔄 REGLA DE VALIDACIÓN PARA SUB-ÍTEMS OCULTOS:
      if (item.id === 'ext-noconformes-falla' || item.id === 'ext-noconformes-etiqueta') {
        const cuadroPrincipal = state.sections[0].items.find(it => it.id === 'ext-noconformes');
        const textoEscrito = cuadroPrincipal?.observations?.trim() || "";
        
        // Si NO se escribió ninguna falla, este sub-ítem se aprueba automáticamente (bypass)
        if (textoEscrito === "" || textoEscrito.toLowerCase() === "ninguno" || textoEscrito.toLowerCase() === "ninguna") {
          return true;
        }
      }

      // 1. VALIDACIONES DE EXCLUSIÓN
      if (item.id === 'ext-3' && !state.dobleTanqueConfig) return false;
      if (item.id === 'sta-1' && !state.starlinkConfig) return false;
      if (isCompresor && !state.compresorConfig) return false;
      if (isFarosExtra && !state.farosExtraConfig) return false;
      
      // 2. REGLAS DE SALTO DIRECTO
      if (state.compresorConfig === 'NO' && isCompresor) return true; 
      if (state.farosExtraConfig === 'NO' && isFarosExtra) return true;
      if (state.starlinkConfig === 'NO' && item.id === 'sta-1') return true;
      if (state.dobleTanqueConfig === 'NO' && item.id === 'ext-3') return true;

      // 3. Validación estándar
      const isMarked = item.status === 'Reviewed' || item.status === 'Completed';
      const taskStatusSet = !!item.taskStatus;
      const photoCondition = item.requiresPhoto ? (item.photos && item.photos.length > 0) : true;
      return isMarked && taskStatusSet && photoCondition;
    });
  };

  const isComplete = useMemo(() => {
    return groups.every(g => isSectionComplete(g.id));
  }, [state, groups]);

  const handleFinalize = async () => {
    if (!state.dateInicio || state.dateInicio === '') {
      alert("⚠️ Por favor, ingresa la Fecha de Inicio de la instalación.");
      return;
    }

    const incompletosSinMotivo = state.sections.flatMap(s => s.items).filter(item => 
      item.taskStatus === 'incomplete' && (!item.incompleteReason || item.incompleteReason.trim() === '')
    );

    if (incompletosSinMotivo.length > 0) {
      alert(`⚠️ Acción requerida: Por favor, indique el motivo en las tareas 'Incompletas'.`);
      return;
    }

    if (!isComplete || isGenerating) return;
    setIsGenerating(true);
    
    try {
      const finalStateToExport = { ...state };
      
      finalStateToExport.sections = state.sections.map(sec => ({
        ...sec,
        items: sec.items.map(it => {
          if (it.id === 'ext-3' && state.dobleTanqueConfig) {
            return { ...it, label: `${it.label} (Lleva Doble Tanque: ${state.dobleTanqueConfig})` };
          }
          if (it.id === 'sta-1' && state.starlinkConfig) {
            return { ...it, label: `${it.label} (Lleva Starlink: ${state.starlinkConfig})` };
          }
          if (it.label.toLowerCase().includes("compresor funcionamiento") && state.compresorConfig) {
            return { ...it, label: `${it.label} (Lleva Compresor: ${state.compresorConfig})` };
          }
          if (it.label.toLowerCase().includes("faros extra") && state.farosExtraConfig) {
            return { ...it, label: `${it.label} (Lleva Faros Extra: ${state.farosExtraConfig})` };
          }
          return it;
        })
      }));

      const itemsIncompletos = state.sections.flatMap(s => s.items).filter(i => 
        i.taskStatus === 'incomplete' && i.id !== 'ext-3' && i.id !== 'sta-1'
      );
      
      const metricsForExcel = {
        id: state.sprAiNumber,
        cliente: state.clientName,
        inicio: state.dateInicio,
        fin: state.dateFin,
        cantidad: itemsIncompletos.length,
        descripcion: itemsIncompletos.map(i => i.label).join('; '),
      };

      const result: FinalizeResult = await finalizeReport(finalStateToExport, metricsForExcel);
      
      if (result && result.filename) {
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          date: new Date().toLocaleDateString(),
          clientName: state.clientName || 'Cliente',
          sprAiNumber: state.sprAiNumber || 'S/N',
          filename: result.filename,
          timestamp: Date.now(),
          data: state
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

        setIsFinished(true); 
        setShowSuccessToast(true);

        setTimeout(() => {
          localStorage.removeItem(STORAGE_KEY); 
          window.location.reload();             
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      alert("Reporte procesado. Verifique su carpeta de descargas.");
      setIsFinished(true);
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => window.location.reload(), 1500);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-green-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-brand-green p-8 rounded-3xl border border-brand-gold/20 shadow-2xl w-full max-sm:max-w-xs">
          <div className="bg-white p-4 rounded-2xl inline-block mb-6"><DeepAgroLogo /></div>
          <h2 className="text-brand-gold font-black text-xl mb-4 uppercase">Acceso Técnico</h2>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              if (e.target.value === MASTER_PIN) setIsAuthenticated(true);
            }}
            placeholder="••••"
            className="w-full bg-brand-green-dark text-brand-gold text-4xl text-center py-4 rounded-2xl border-2 border-brand-gold/30 outline-none tracking-[0.5em]"
            autoFocus
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-brand-green-dark text-slate-100 flex flex-col overflow-hidden relative">
      
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[110] p-2.5 bg-brand-green-dark/60 backdrop-blur-md border border-white/10 rounded-xl text-brand-gold shadow-lg active:scale-95 transition-all"
      >
        <Menu size={24} />
      </button>

      <header className="bg-brand-green p-4 border-b border-brand-green-dark/30 shadow-lg shrink-0 z-[100]">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 pl-12 md:pl-0">
            <div className="bg-white p-2 rounded-xl shrink-0"><DeepAgroLogo /></div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-white leading-none">
                SprAI <span className="text-brand-gold">FIELD OPS</span> 
                <span className="ml-2 text-[10px] bg-brand-green-dark px-2 py-0.5 rounded text-brand-gold">V{CHECKLIST_VERSION}</span>
              </h1>
              <p className="text-[10px] text-brand-gold font-bold uppercase mt-1">OP.PI-MN002 - MANUAL DE INSTALACIÓN - V1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex gap-4 mr-4 items-center hidden lg:flex">
                <a href={NO_CONFORME_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-black text-red-400 hover:text-red-300 transition-colors mr-2">
                  <AlertCircle size={12}/> MATERIAL NO CONFORME
                </a>
                <a href={DRIVE_URL} target="_blank" className="flex items-center gap-1 text-[10px] font-black text-white/50 hover:text-brand-gold"><ExternalLink size={12}/> DRIVE</a>
                <a href={MANUAL_URL} target="_blank" className="flex items-center gap-1 text-[10px] font-black text-white/50 hover:text-brand-gold"><BookOpen size={12}/> MANUAL</a>
             </div>
            <button onClick={() => setShowHistory(true)} className="p-2.5 bg-white/5 rounded-lg text-brand-gold hover:bg-white/10"><History size={22}/></button>
            <button onClick={() => { if(confirm("¿Estás seguro de que quieres borrar todo? Esto limpiará el checklist para una nueva carga.")) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } }} className="text-white/20 hover:text-red-400 p-2.5"><Trash2 size={22}/></button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-brand-green-dark border-r border-white/5 flex flex-col shrink-0 hidden md:flex">
          <div className="p-6 border-b border-white/5 shrink-0">
            <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Índice</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar pb-32">
            {groups.map(g => {
              const complete = isSectionComplete(g.id);
              return (
                <button 
                  key={g.id} 
                  onClick={() => setCurrentGroupId(g.id)} 
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center justify-between",
                    currentGroupId === g.id ? 'bg-brand-gold text-brand-green-dark' : 'text-slate-400 hover:bg-white/5'
                  )}
                >
                  <span>{g.label}</span>
                  {complete ? (
                    <ShieldCheck size={14} className={currentGroupId === g.id ? "text-brand-green-dark" : "text-brand-gold"} />
                  ) : (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full border",
                      currentGroupId === g.id ? "bg-brand-green-dark/20 border-brand-green-dark/40" : "bg-orange-500/40 border-orange-500 animate-pulse"
                    )} />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40 custom-scrollbar relative scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {currentGroupId === 'mod' && (
              <div className="bg-brand-green/10 p-6 rounded-3xl border border-white/5 space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="text-[10px] text-brand-gold/50 ml-4 mb-1 block font-black uppercase">Fecha Inicio Instalación</label>
                    <input 
                      type="date" 
                      value={state.dateInicio} 
                      onChange={e => setState(s => ({...s, dateInicio: e.target.value}))} 
                      className="w-full bg-brand-green-dark/50 p-4 rounded-2xl border border-white/10 outline-none text-brand-gold appearance-none font-bold custom-date-input" 
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] text-brand-gold/50 ml-4 mb-1 block font-black uppercase">Fecha Fin Instalación</label>
                    <input 
                      type="date" 
                      value={state.dateFin} 
                      onChange={e => setState(s => ({...s, dateFin: e.target.value}))} 
                      className="w-full bg-brand-green-dark/50 p-4 rounded-2xl border border-white/10 outline-none text-brand-gold appearance-none font-bold custom-date-input" 
                    />
                  </div>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Nombre del Cliente" 
                  value={state.clientName} 
                  onChange={e => setState(s => ({...s, clientName: e.target.value}))} 
                  className="w-full bg-brand-green-dark/50 p-4 rounded-2xl border border-white/10 outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Nro. de SprAI (SPRAI-XX-000)" 
                  value={state.sprAiNumber} 
                  onChange={e => setState(s => ({...s, sprAiNumber: e.target.value}))} 
                  className="w-full bg-brand-green-dark/50 p-4 rounded-2xl border border-white/10 outline-none" 
                />
              </div>
            )}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-brand-gold uppercase tracking-tight">
                {groups.find(g => g.id === currentGroupId)?.label}
              </h2>
            </div>

            {currentGroupId === 'val' ? (
              <div className="bg-brand-green/20 p-6 rounded-3xl border border-brand-gold/30 space-y-5">
                <input type="text" placeholder="Nombre completo" value={state.signerName} onChange={e => setState(s => ({...s, signerName: e.target.value}))} className="w-full bg-brand-green-dark/50 p-4 rounded-2xl border border-white/10 outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Empresa" value={state.signerCompany} onChange={e => setState(s => ({...s, signerCompany: e.target.value}))} className="w-full bg-brand-green-dark/50 p-4 rounded-2xl border border-white/10 outline-none" />
                  <input type="text" placeholder="Rol" value={state.signerRole} onChange={e => setState(s => ({...s, signerRole: e.target.value}))} className="w-full bg-brand-green-dark/50 p-4 rounded-2xl border border-white/10 outline-none" />
                </div>
                <SignaturePad onSave={sig => setState(s => ({...s, signature: sig}))} initialValue={state.signature} />
              </div>
            ) : (
              <div className="space-y-8">
                {state.sections[0].items
                  .filter(item => {
                    if (!item.id.startsWith(currentGroupId)) return false;

                    if (item.id === 'ext-noconformes-falla' || item.id === 'ext-noconformes-etiqueta') {
                      const cuadroPrincipal = state.sections[0].items.find(it => it.id === 'ext-noconformes');
                      const textoEscrito = cuadroPrincipal?.observations?.trim() || "";
                      
                      if (textoEscrito === "" || textoEscrito.toLowerCase() === "ninguno" || textoEscrito.toLowerCase() === "ninguna") {
                        return false;
                      }
                    }
                    return true;
                  })
                  .map(item => {
                    const isDT = item.id === 'ext-3';
                    const isSL = item.id === 'sta-1';
                    const isCompresor = item.label.toLowerCase().includes("compresor funcionamiento");
                    const isFarosExtra = item.label.toLowerCase().includes("faros extra");

                    const showTaskExecution = (!isDT && !isSL && !isCompresor && !isFarosExtra) || 
                                              (isDT && state.dobleTanqueConfig === 'SI') || 
                                              (isSL && state.starlinkConfig === 'SI') ||
                                              (isCompresor && state.compresorConfig === 'SI') ||
                                              (isFarosExtra && state.farosExtraConfig === 'SI');

                    return (
                      <div key={item.id} className="group relative bg-white/5 rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-white/10 shadow-xl">
                        
                        <ChecklistItemCard item={item} onUpdate={u => updateItem('revision', item.id, u)} />
                        
                        {isDT && (
                          <div className="px-6 py-4 bg-brand-gold/5 border-t border-brand-gold/20 space-y-3">
                            <div className="flex items-center gap-2 text-brand-gold">
                              <HelpCircle size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">¿Lleva Doble Tanque la máquina? (Requerido)</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, dobleTanqueConfig: 'SI' }));
                                  updateItem('revision', item.id, { taskStatus: undefined }); 
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.dobleTanqueConfig === 'SI' ? "bg-brand-gold text-brand-green-dark border-brand-gold" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                SÍ LLEVA
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, dobleTanqueConfig: 'NO' }));
                                  updateItem('revision', item.id, { taskStatus: 'not_applicable' as any, incompleteReason: '' });
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.dobleTanqueConfig === 'NO' ? "bg-white/20 text-white border-white/30" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                NO LLEVA
                              </button>
                            </div>
                          </div>
                        )}

                        {isSL && (
                          <div className="px-6 py-4 bg-brand-gold/5 border-t border-brand-gold/20 space-y-3">
                            <div className="flex items-center gap-2 text-brand-gold">
                              <HelpCircle size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">¿Lleva Antena Starlink la máquina? (Requerido)</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, starlinkConfig: 'SI' }));
                                  updateItem('revision', item.id, { taskStatus: undefined }); 
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.starlinkConfig === 'SI' ? "bg-brand-gold text-brand-green-dark border-brand-gold" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                SÍ LLEVA
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, starlinkConfig: 'NO' }));
                                  updateItem('revision', item.id, { taskStatus: 'not_applicable' as any, incompleteReason: '' });
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.starlinkConfig === 'NO' ? "bg-white/20 text-white border-white/30" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                NO LLEVA
                              </button>
                            </div>
                          </div>
                        )}

                        {isCompresor && (
                          <div className="px-6 py-4 bg-brand-gold/5 border-t border-brand-gold/20 space-y-3">
                            <div className="flex items-center gap-2 text-brand-gold">
                              <HelpCircle size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">¿Se instaló compresor en la máquina? (Requerido)</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, compresorConfig: 'SI' }));
                                  updateItem('revision', item.id, { taskStatus: undefined }); 
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.compresorConfig === 'SI' ? "bg-brand-gold text-brand-green-dark border-brand-gold" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                SÍ, SE INSTALÓ
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, compresorConfig: 'NO' }));
                                  updateItem('revision', item.id, { taskStatus: 'not_applicable' as any, incompleteReason: '' });
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.compresorConfig === 'NO' ? "bg-white/20 text-white border-white/30" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                NO SE INSTALÓ
                              </button>
                            </div>
                          </div>
                        )}

                        {isFarosExtra && (
                          <div className="px-6 py-4 bg-brand-gold/5 border-t border-brand-gold/20 space-y-3">
                            <div className="flex items-center gap-2 text-brand-gold">
                              <HelpCircle size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">¿Se instaló faro extra por distancia &gt; 130cm? (Requerido)</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, farosExtraConfig: 'SI' }));
                                  updateItem('revision', item.id, { taskStatus: undefined }); 
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.farosExtraConfig === 'SI' ? "bg-brand-gold text-brand-green-dark border-brand-gold" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                SÍ LLEVA
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setState(s => ({ ...s, farosExtraConfig: 'NO' }));
                                  updateItem('revision', item.id, { taskStatus: 'not_applicable' as any, incompleteReason: '' });
                                }}
                                className={cn(
                                  "flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all border",
                                  state.farosExtraConfig === 'NO' ? "bg-white/20 text-white border-white/30" : "bg-black/40 border-white/5 text-white/50"
                                )}
                              >
                                NO LLEVA
                              </button>
                            </div>
                          </div>
                        )}

                        {showTaskExecution && (
                          <div className="px-6 pt-4 bg-black/20 border-t border-white/5 space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-brand-gold/60 uppercase tracking-widest">Estado de ejecución</span>
                                {item.taskStatus === 'incomplete' && (
                                  <span className="text-[10px] font-bold text-red-400 animate-pulse uppercase flex items-center gap-1">
                                    <AlertCircle size={12}/> Pendiente
                                  </span>
                                )}
                             </div>
                             
                             <div className="flex gap-2">
                                <button 
                                  type="button"
                                  onClick={() => updateItem('revision', item.id, { taskStatus: 'complete' })}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black transition-all border",
                                    item.taskStatus === 'complete' ? "bg-brand-gold text-brand-green-dark border-brand-gold" : "bg-black/20 border-white/5 text-white/40"
                                  )}
                                >
                                  <CheckCircle2 size={16} /> TAREA COMPLETADA
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => updateItem('revision', item.id, { taskStatus: 'incomplete' })}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black transition-all border",
                                    item.taskStatus === 'incomplete' ? "bg-red-500 text-white border-red-500" : "bg-black/20 border-white/5 text-white/40"
                                  )}
                                >
                                  <AlertCircle size={16} /> QUEDÓ INCOMPLETO
                                </button>
                             </div>

                             {item.taskStatus === 'incomplete' && (
                               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                 <textarea
                                   placeholder="Requerido para poder finalizar: Indique brevemente por qué no se pudo terminar..."
                                   value={item.incompleteReason || ''}
                                   onChange={e => updateItem('revision', item.id, { incompleteReason: e.target.value })}
                                   className="w-full bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-xs text-red-200 outline-none"
                                   rows={2}
                                 />
                               </motion.div>
                             )}
                          </div>
                        )}

                        <div className="px-6 pb-6 pt-4 bg-black/20">
                          {!(item.status === 'Completed' || item.status === 'Reviewed') ? (
                            (() => {
                              if (isDT && !state.dobleTanqueConfig) {
                                return <button disabled className="w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all bg-white/5 border-white/5 text-white/10 cursor-not-allowed">Responda si lleva Doble Tanque</button>;
                              }
                              if (isSL && !state.starlinkConfig) {
                                return <button disabled className="w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all bg-white/5 border-white/5 text-white/10 cursor-not-allowed">Responda si lleva Starlink</button>;
                              }
                              if (isCompresor && !state.compresorConfig) {
                                return <button disabled className="w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all bg-white/5 border-white/5 text-white/10 cursor-not-allowed">Responda sobre el Compresor</button>;
                              }
                              if (isFarosExtra && !state.farosExtraConfig) {
                                return <button disabled className="w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all bg-white/5 border-white/5 text-white/10 cursor-not-allowed">Responda si lleva Faros Extra</button>;
                              }

                              const isMissingReason = item.taskStatus === 'incomplete' && (!item.incompleteReason || item.incompleteReason.trim() === '');
                              const isNoDT = isDT && state.dobleTanqueConfig === 'NO';
                              const isNoSL = isSL && state.starlinkConfig === 'NO';
                              const isNoFE = isFarosExtra && state.farosExtraConfig === 'NO';
                              const isNoCompresor = isCompresor && state.compresorConfig === 'NO';

                              const isDisabled = (isNoDT || isNoSL || isNoFE || isNoCompresor) 
                                ? false 
                                : (item.requiresPhoto && item.photos.length === 0) || !item.taskStatus || isMissingReason;

                              return (
                                <button 
                                  disabled={isDisabled}
                                  onClick={() => updateItem('revision', item.id, { status: 'Completed' })}
                                  className={cn(
                                    "w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all border shadow-lg",
                                    isDisabled ? "bg-white/5 border-white/5 text-white/10 cursor-not-allowed" : "bg-brand-gold text-brand-green-dark border-brand-gold hover:brightness-110 active:scale-95"
                                  )}
                                >
                                  {
                                    (!item.taskStatus && !isNoDT && !isNoSL && !isNoFE && !isNoCompresor)
                                      ? "Seleccione estado" 
                                      : (item.requiresPhoto && item.photos.length === 0 && !isNoDT && !isNoSL && !isNoFE && !isNoCompresor) 
                                        ? "Falta evidencia" 
                                        : isMissingReason ? "Indique motivo" : "Confirmar Punto"
                                  }
                                </button>
                              );
                            })()
                          ) : (
                            <button 
                              onClick={() => updateItem('revision', item.id, { status: 'Pending' })}
                              className="w-full py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2"
                            >
                              <FileText size={14} /> Editar información
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-green-dark via-brand-green-dark to-transparent z-[120] md:z-[90]">
        <div className="max-w-xl mx-auto flex gap-3 pb-safe">
          <button 
            disabled={currentGroupId === 'mod'}
            onClick={() => { 
              const idx = groups.findIndex(g => g.id === currentGroupId); 
              setCurrentGroupId(groups[idx-1].id); 
            }}
            className="p-4 rounded-2xl bg-brand-green-dark/80 backdrop-blur-md border border-white/10 disabled:opacity-20 active:scale-95 transition-all text-brand-gold shadow-2xl"
          >
            <ChevronLeft size={24}/>
          </button>

          {currentGroupId === 'val' ? (
            <button 
              onClick={handleFinalize} 
              disabled={!isComplete || isGenerating} 
              className={cn(
                "flex-1 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-2xl", 
                isComplete ? 'bg-brand-gold text-brand-green-dark' : 'bg-white/5 text-white/20'
              )}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Download size={18} />}
              <span>{isGenerating ? 'GENERANDO...' : 'FINALIZAR REPORTE'}</span>
            </button>
          ) : (
            <button 
              onClick={() => { 
                const idx = groups.findIndex(g => g.id === currentGroupId); 
                setCurrentGroupId(groups[idx+1].id); 
              }} 
              className="flex-1 bg-brand-green text-brand-gold rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 border border-brand-gold/20 shadow-2xl active:scale-95 transition-all"
            >
              Siguiente Sección <ChevronRight size={18}/>
            </button>
          )}
        </div>
      </footer>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210]"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-brand-green-dark border-r border-white/10 z-[220] p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-brand-gold font-black text-xl tracking-tighter uppercase">Menú</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/50"><X size={24} /></button>
              </div>

              <div className="flex flex-col gap-2 mb-6 md:hidden">
                <a href={NO_CONFORME_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-red-500/10 rounded-2xl text-[10px] font-black text-red-400 border border-red-500/20">
                  <AlertCircle size={16}/> MATERIAL NO CONFORME
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a href={DRIVE_URL} target="_blank" className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl text-[10px] font-black text-brand-gold border border-brand-gold/20">
                    <ExternalLink size={16}/> DRIVE
                  </a>
                  <a href={MANUAL_URL} target="_blank" className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl text-[10px] font-black text-brand-gold border border-brand-gold/20">
                    <BookOpen size={16}/> MANUAL
                  </a>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {groups.map(g => {
                  const complete = isSectionComplete(g.id);
                  return (
                    <button 
                      key={g.id} 
                      onClick={() => { setCurrentGroupId(g.id); setIsMenuOpen(false); }}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                        currentGroupId === g.id ? 'bg-brand-gold text-brand-green-dark' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      )}
                    >
                      <span>{g.label}</span>
                      {complete ? (
                        <ShieldCheck size={16} className={currentGroupId === g.id ? "text-brand-green-dark" : "text-brand-gold"} />
                      ) : (
                        <div className={cn(
                          "w-2 h-2 rounded-full border",
                          currentGroupId === g.id ? "bg-brand-green-dark/20 border-brand-green-dark/40" : "bg-orange-500/20 border-orange-500 animate-pulse"
                        )} />
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-6 right-6 z-[300] md:left-auto md:right-8 md:w-96">
            <div className="bg-brand-gold p-6 rounded-3xl shadow-2xl border-2 border-white flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-brand-green-dark p-2 rounded-full text-brand-gold"><UserCheck size={22} /></div>
                <div>
                  <p className="text-brand-green-dark font-black text-sm uppercase leading-none">¡REPORTE GENERADO!</p>
                  <p className="text-brand-green-dark/70 text-[10px] font-bold mt-1">Descarga completada con éxito.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-brand-green-dark/98 flex flex-col p-6 backdrop-blur-md">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-brand-gold font-black text-2xl uppercase tracking-tighter">Historial</h2>
                <button onClick={() => setShowHistory(false)} className="p-3 bg-white/10 rounded-full text-white"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {history.length === 0 ? <p className="text-center text-white/20 py-20 font-bold uppercase text-xs">Vacío</p> : 
                  history.map(item => (
                    <div key={item.id} className="bg-white/5 p-5 rounded-3xl border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="text-white font-black text-base uppercase leading-none">{item.clientName}</p>
                        <p className="text-brand-gold/60 text-[11px] font-bold mt-2 uppercase">{item.sprAiNumber} | {item.date}</p>
                      </div>
                      <FileText size={20} className="text-brand-gold/30" />
                    </div>
                  ))
                }
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARTEL FLOTANTE: DETECCIÓN DE BORRADOR ANTERIOR */}
      <AnimatePresence>
        {showDraftModal && pendingDraft && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-green border-2 border-brand-gold/30 p-6 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-6"
            >
              <div className="bg-brand-gold/10 p-3 rounded-full inline-block text-brand-gold">
                <FileText size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-brand-gold font-black text-lg uppercase tracking-tight">¡Borrador Pendiente!</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Detectamos una instalación a medio completar para el cliente <span className="text-white font-bold">{pendingDraft.clientName || 'Sin Nombre'}</span> (SprAI: {pendingDraft.sprAiNumber || 'S/N'}). ¿Qué deseas hacer?
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setState(pendingDraft); 
                    setShowDraftModal(false);
                  }}
                  className="w-full py-3.5 bg-brand-gold text-brand-green-dark rounded-2xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg"
                >
                  Continuar Edición
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY); 
                    setState(initialState);               
                    setShowDraftModal(false);
                  }}
                  className="w-full py-3 bg-black/40 text-red-400 hover:bg-black/60 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all border border-red-500/20"
                >
                  Descartar y Nuevo Checklist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(242, 183, 5, 0.2); border-radius: 10px; }
        
        .custom-date-input::-webkit-calendar-picker-indicator {
          filter: invert(81%) sepia(61%) saturate(941%) hue-rotate(354deg) brightness(104%) contrast(97%);
          cursor: pointer;
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}