'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, ShieldCheck, Zap, AlertTriangle, Info,
  ChefHat, ClipboardList, ThermometerSnowflake, UserCheck, Droplets,
  ArrowRight, Sparkles, AlertCircle
} from 'lucide-react';
import { analyzeKitchen, AuditReport } from '@/lib/fssai-engine';
import AnalysisDashboard from '@/components/AnalysisDashboard';

export default function FoodSafeAI() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AuditReport[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history
  React.useEffect(() => {
    const saved = localStorage.getItem('foodsafe_history');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMimeType(file.type);
        setReport(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeKitchen(image, mimeType);
      setReport(result);
      
      // Update history
      const newHistory = [result, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('foodsafe_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error(err);
      setError("AI analysis failed. Please ensure your Gemini API key is configured correctly.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const steps = [
    { icon: <Upload />, text: "Upload kitchen photo" },
    { icon: <Zap />, text: "AI scanning 23 points" },
    { icon: <ShieldCheck />, text: "FSSAI compliance check" },
    { icon: <ClipboardList />, text: "Get fix recommendations" },
    { icon: <Sparkles />, text: "Download PDF report" }
  ];

  const categories = [
    { icon: <Droplets />, name: "Premises & Surroundings" },
    { icon: <ThermometerSnowflake />, name: "Food Storage & Handling" },
    { icon: <ChefHat />, name: "Layout & Equipment" },
    { icon: <UserCheck />, name: "Personal Hygiene" },
    { icon: <ClipboardList />, name: "Cleaning & Documentation" }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-[240px] bg-brand-sidebar text-white flex-col p-6 overflow-y-auto h-screen sticky top-0">
        <div className="flex items-center gap-2.5 text-xl font-bold mb-8">
          🛡️ FoodSafe AI
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-[10px] uppercase tracking-wider opacity-60 mb-3 font-semibold">FSSAI Status</h2>
            <div className="space-y-0">
              {categories.map((cat, i) => {
                const catSlug = cat.name.toUpperCase().replace(/ /g, '_').replace(/&/g, '').replace(/__/g, '_');
                // Special mapping for personal hygiene which might be PERSONAL_HYGIENE_PPE
                const matchedCat = report?.categories.find(c => 
                  c.name.includes(catSlug) || catSlug.includes(c.name)
                );
                
                let icon = "⚪";
                if (matchedCat) {
                  if (matchedCat.score >= 90) icon = "✅";
                  else if (matchedCat.score >= 50) icon = "⚠️";
                  else icon = "❌";
                }

                return (
                  <div key={i} className="hd-sidebar-item">
                    {cat.name} <span>{icon}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] uppercase tracking-wider opacity-60 mb-3 font-semibold">How it Works</h2>
            <div className="space-y-1">
              {steps.map((step, i) => (
                <div key={i} className="text-[11px] opacity-80 py-1 transition-all">
                  {i + 1}. {step.text}
                </div>
              ))}
            </div>
          </section>

          {history.length > 0 && (
            <section>
              <h2 className="text-[10px] uppercase tracking-wider opacity-60 mb-3 font-semibold">Recent Audits</h2>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="text-[10px] bg-white/5 p-2 rounded border border-white/10 hover:bg-white/10 cursor-pointer transition-all" onClick={() => setReport(h)}>
                    <div className="flex justify-between font-bold">
                      <span>Score: {h.overallScore}/100</span>
                      <span className={h.riskLevel === 'low' ? 'text-brand-success' : 'text-brand-danger'}>●</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="mt-auto pt-6 text-[10px] opacity-50 leading-tight">
          Built by Aura Architects<br/>
          IIM Bangalore | 2026
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-5 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-brand-primary w-6 h-6" />
            <span className="font-bold text-lg">FoodSafe AI</span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Aura Architects</p>
        </div>

        {/* Landing Section */}
        {!report && !isAnalyzing && (
          <header className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-4">
            <div className="title-group">
              <h1 className="text-3xl font-bold text-brand-primary mb-1">AI Eyes for Every Kitchen</h1>
              <p className="text-sm text-gray-500 font-medium tracking-tight">FSSAI Schedule 4 Compliance Audit Platform</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-[#E8F5E9] px-3 py-2 rounded-md text-center">
                <span className="block text-xs font-bold text-brand-primary">10Cr</span>
                <p className="text-[9px] text-gray-600 font-semibold uppercase">Ill Annually</p>
              </div>
              <div className="bg-[#E8F5E9] px-3 py-2 rounded-md text-center">
                <span className="block text-xs font-bold text-brand-primary">1.2L</span>
                <p className="text-[9px] text-gray-600 font-semibold uppercase">Annual Deaths</p>
              </div>
              <div className="bg-[#E8F5E9] px-3 py-2 rounded-md text-center">
                <span className="block text-xs font-bold text-brand-primary">₹1.25L Cr</span>
                <p className="text-[9px] text-gray-600 font-semibold uppercase">Econ. Loss</p>
              </div>
            </div>
          </header>
        )}

        {/* Action Area */}
        <section className="space-y-8">
          {!report && !isAnalyzing && (
            <div className="relative">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-80 border-4 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-gray-400 group-hover:text-brand-primary w-8 h-8" />
                  </div>
                  <p className="font-bold text-gray-600 mb-1">Upload Kitchen Photo</p>
                  <p className="text-sm text-gray-400">JPG, JPEG or PNG formats</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-6 rounded-[40px] shadow-xl border border-gray-100">
                  <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-inner group">
                    <Image 
                      src={image} 
                      alt="Kitchen for Audit" 
                      fill 
                      className="object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {isAnalyzing && (
                      <motion.div 
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-brand-primary shadow-[0_0_15px_rgba(27,94,32,0.8)] z-10"
                      />
                    )}
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors z-20"
                    >
                      <Zap className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-brand-card p-6 rounded-3xl">
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <ShieldCheck className="text-brand-primary" /> Ready for Audit
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        AI will inspect this kitchen against 23 FSSAI parameters across premises, storage, layout, hygiene and documentation.
                      </p>
                    </div>
                    <button 
                      onClick={startAnalysis}
                      className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all active:scale-95"
                    >
                      Analyze Kitchen <ArrowRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-8 border-brand-primary/10 rounded-full" />
                <div className="absolute inset-0 border-8 border-brand-primary rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat className="w-12 h-12 text-brand-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">🤖 AI is inspecting your kitchen...</h2>
              <p className="text-gray-500 animate-pulse">Running 23 FSSAI Schedule 4 compliance checks</p>
            </div>
          )}

          {/* Analysis Report */}
          {report && !isAnalyzing && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">Inspection Report</h2>
                <button 
                  onClick={() => { setReport(null); setImage(null); }}
                  className="text-sm font-bold text-brand-primary px-4 py-2 hover:bg-brand-primary/5 rounded-xl transition-all"
                >
                  New Audit 
                </button>
              </div>
              <AnalysisDashboard report={report} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-4 text-brand-danger">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-bold">Audit Interrupted</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
