import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  Scan,
  Check
} from 'lucide-react';
import type { VisionAuditResponse, DetectedItem } from '../types';
import { apiClient } from '../api/client';
import confetti from 'canvas-confetti';

interface VisionAuditorProps {
  onBatchCreated?: (batch: any) => void;
  initialGeneratorName?: string;
  initialGeneratorType?: string;
}

export const VisionAuditor: React.FC<VisionAuditorProps> = ({ 
  onBatchCreated,
  initialGeneratorName = 'Grand Horizon Palace Hotel Kitchens',
  initialGeneratorType = 'HOTEL'
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<VisionAuditResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<DetectedItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CONTAMINANTS' | 'ORGANICS'>('ALL');
  const [generatorName, setGeneratorName] = useState(initialGeneratorName);
  const [generatorType, setGeneratorType] = useState(initialGeneratorType);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  useEffect(() => {
    if (initialGeneratorName) setGeneratorName(initialGeneratorName);
    if (initialGeneratorType) setGeneratorType(initialGeneratorType);
  }, [initialGeneratorName, initialGeneratorType]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample Preset Ingestion Scenarios
  const samplePresets = [
    {
      id: 'clean_veg',
      title: 'Preset 1: Clean Organic Kitchen Scrap',
      desc: 'Purity 96.5% - Pure peels, cooked rice, greens (Compliant)',
      isContaminated: false,
      color: 'border-emerald-500/40 bg-emerald-950/20',
      badge: 'PASS (3.5% Contam)'
    },
    {
      id: 'plastic_cutlery',
      title: 'Preset 2: Contaminated Mixed Plate Scrap',
      desc: 'Contamination 19.2% - Plastic forks, cling wrap, PET bottle (Rejection Flag)',
      isContaminated: true,
      color: 'border-rose-500/40 bg-rose-950/20',
      badge: 'REJECT (>15% Limit)'
    },
    {
      id: 'foil_catering',
      title: 'Preset 3: High Foil Catering Tray Scrap',
      desc: 'Contamination 22.8% - Aluminum foil liners & packaging sachets',
      isContaminated: true,
      color: 'border-amber-500/40 bg-amber-950/20',
      badge: 'REJECT (22.8% Foil)'
    }
  ];

  // Draw synthetic test canvas if preset selected
  const loadPreset = (presetId: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Organic base gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#2d5a27');
    grad.addColorStop(0.5, '#3b7a33');
    grad.addColorStop(1, '#1e3f1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Draw textured food chunks (rice, potato, greens)
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#4ade80' : i % 3 === 1 ? '#fef08a' : '#d97706';
      ctx.beginPath();
      ctx.arc(
        50 + Math.random() * 540,
        50 + Math.random() * 380,
        15 + Math.random() * 25,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    if (presetId === 'plastic_cutlery') {
      // Draw Plastic Cutlery (Red contour / White plastic)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(180, 150, 25, 140); // fork stem
      ctx.fillRect(165, 130, 55, 30);  // prongs
      
      // Draw Plastic film
      ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
      ctx.fillRect(360, 200, 160, 110);
    } else if (presetId === 'foil_catering') {
      // Draw metallic reflective aluminum foil
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(200, 180);
      ctx.lineTo(340, 150);
      ctx.lineTo(380, 290);
      ctx.lineTo(220, 310);
      ctx.closePath();
      ctx.fill();
    }

    const dataUrl = canvas.toDataURL('image/jpeg');
    setSelectedImage(dataUrl);
    handleAudit(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
      handleAudit(dataUrl, file);
    };
    reader.readAsDataURL(file);
  };

  const handleAudit = async (dataUrl: string, file?: File) => {
    setIsAuditing(true);
    setAuditResult(null);
    setSelectedItem(null);
    setDispatchedSuccess(false);

    try {
      const res = await apiClient.auditImage(file, dataUrl);
      setAuditResult(res);
      if (res.status === 'APPROVED_FOR_DISPATCH') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPreset('clean_veg');
  }, []);

  const handleDispatch = async () => {
    if (!auditResult) return;
    setIsDispatching(true);

    const grossMass = 350.0; // kg default batch
    const payload = {
      generator_name: generatorName,
      generator_type: generatorType,
      location_address: "400 Marina Bay Blvd, Loading Dock Gate 3",
      latitude: 1.2834,
      longitude: 103.8607,
      feedstock: {
        fog_kg: (grossMass * 0.15),
        meat_proteins_kg: (grossMass * 0.20),
        carbs_starches_kg: (grossMass * 0.30),
        mixed_cooked_kg: (grossMass * 0.25),
        raw_greens_kg: (grossMass * 0.10),
        purity_factor: auditResult.purity_pct
      }
    };

    try {
      const batch = await apiClient.createBatch(payload);
      setDispatchedSuccess(true);
      if (onBatchCreated) {
        onBatchCreated(batch);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  const filteredItems = auditResult?.detected_items.filter(item => {
    if (filterCategory === 'CONTAMINANTS') return item.category === 'CONTAMINANT';
    if (filterCategory === 'ORGANICS') return item.category === 'ORGANIC';
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  AI Computer Vision Contamination & Purity Engine
                </h1>
                <p className="text-sm text-slate-400">
                  Real-time YOLOv8 + OpenCV foreign material localization and automated purity auditing.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-mono uppercase font-semibold">Test Ingest Presets:</span>
            {samplePresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                  preset.isContaminated 
                    ? 'border-rose-500/30 text-rose-300 hover:bg-rose-950/40' 
                    : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40'
                }`}
              >
                {preset.badge}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Viewport vs Audit Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image / Video Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
            
            {/* Viewport Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-emerald-400 font-bold">LIVE HUD STREAM</span>
                <span>| RESOLUTION: 640x480</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 text-xs transition"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Bin Photo</span>
                </button>
              </div>
            </div>

            {/* Viewport Frame with Canvas / Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center scanline-effect">
              {isAuditing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
                  <p className="text-sm font-mono text-emerald-300 animate-pulse">
                    RUNNING YOLOv8 SEGMENTATION & PIXEL GEOMETRY...
                  </p>
                </div>
              )}

              {auditResult?.annotated_image_base64 ? (
                <img
                  src={auditResult.annotated_image_base64}
                  alt="Audited Food Waste Bin"
                  className="w-full h-full object-contain"
                />
              ) : selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Raw Bin Snapshot"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500 p-8">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-mono">No video feed or snapshot loaded.</p>
                </div>
              )}

              {/* Status Verdict Overlay Stamp */}
              {auditResult && (
                <div className={`absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold border backdrop-blur-md shadow-xl ${
                  auditResult.status === 'APPROVED_FOR_DISPATCH'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/60'
                    : 'bg-rose-950/80 text-rose-300 border-rose-400/60 animate-bounce'
                }`}>
                  {auditResult.status === 'APPROVED_FOR_DISPATCH' ? '✓ APPROVED FOR DIGESTION' : '⚠ REJECTED: >15% CONTAMINATION'}
                </div>
              )}
            </div>

            {/* Viewport Meta Bar */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Purity Score</span>
                <div className={`text-base font-bold ${
                  (auditResult?.purity_pct || 0) >= 85 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {auditResult?.purity_pct || '--'}%
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Foreign Contaminants</span>
                <div className={`text-base font-bold ${
                  (auditResult?.contamination_pct || 0) <= 15 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {auditResult?.contamination_pct || '--'}%
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Bounding Areas</span>
                <div className="text-base font-bold text-cyan-400">
                  {auditResult?.detected_items.length || 0} regions
                </div>
              </div>
            </div>

          </div>

          {/* Sorting / Action Alert Notice */}
          {auditResult && (
            <div className={`p-4 rounded-xl border ${
              auditResult.status === 'APPROVED_FOR_DISPATCH'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-start space-x-3">
                {auditResult.status === 'APPROVED_FOR_DISPATCH' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                )}
                <div className="space-y-1 text-xs">
                  <div className="font-bold uppercase tracking-wider font-mono">
                    {auditResult.status === 'APPROVED_FOR_DISPATCH'
                      ? 'Automated Quality Pass: Ready for Biogas Inflow'
                      : 'Non-Biodegradable Contamination Alert'}
                  </div>
                  {auditResult.sorting_alerts.map((alert, idx) => (
                    <p key={idx} className="text-slate-300 font-mono">{alert}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: AI Bounding Box Inspection & Batch Logging (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Detected Objects Inspector */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Object Geometry Inspector</span>
              </h2>
              
              {/* Category Filter Pills */}
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-2 py-0.5 rounded ${filterCategory === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterCategory('CONTAMINANTS')}
                  className={`px-2 py-0.5 rounded ${filterCategory === 'CONTAMINANTS' ? 'bg-rose-900/60 text-rose-300' : 'text-slate-400'}`}
                >
                  Contaminants
                </button>
                <button
                  onClick={() => setFilterCategory('ORGANICS')}
                  className={`px-2 py-0.5 rounded ${filterCategory === 'ORGANICS' ? 'bg-emerald-900/60 text-emerald-300' : 'text-slate-400'}`}
                >
                  Organics
                </button>
              </div>
            </div>

            {/* List of Detected Regions */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-4 text-center">No objects in selected category.</p>
              ) : (
                filteredItems.map(item => {
                  const isContam = item.category === 'CONTAMINANT';
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedItem?.id === item.id 
                          ? 'border-cyan-400 bg-cyan-950/30 shadow-md' 
                          : isContam 
                            ? 'border-rose-500/20 bg-rose-950/10 hover:bg-rose-950/20' 
                            : 'border-emerald-500/20 bg-emerald-950/10 hover:bg-emerald-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${isContam ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                          <span className="font-bold text-slate-200">{item.label}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isContam ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {Math.round(item.confidence * 100)}% Conf
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Coverage Area: {item.bbox.area_pixels.toLocaleString()} px²</span>
                        <span>Type: {item.contaminant_type || 'BIODEGRADABLE'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Feedstock Chemical Composition Distribution */}
            {auditResult?.feedstock_distribution && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                  Estimated Feedstock Fractions
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Greens & Peels (0.18 m³/kg)</span>
                    <span className="text-emerald-400 font-bold">{auditResult.feedstock_distribution.greens_peels}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${auditResult.feedstock_distribution.greens_peels}%` }}></div>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Carbs & Starches (0.37 m³/kg)</span>
                    <span className="text-teal-400 font-bold">{auditResult.feedstock_distribution.carbs_starches}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full" style={{ width: `${auditResult.feedstock_distribution.carbs_starches}%` }}></div>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Proteins & Meat (0.49 m³/kg)</span>
                    <span className="text-cyan-400 font-bold">{auditResult.feedstock_distribution.meat_proteins}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${auditResult.feedstock_distribution.meat_proteins}%` }}></div>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Fats, Oils & Grease (0.85 m³/kg)</span>
                    <span className="text-amber-400 font-bold">{auditResult.feedstock_distribution.fog_grease}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${auditResult.feedstock_distribution.fog_grease}%` }}></div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Commercial Dispatch Form */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Commercial Batch Dispatch</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Commercial Kitchen / Generator</label>
                <input
                  type="text"
                  value={generatorName}
                  onChange={e => setGeneratorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Producer Sector</label>
                <select
                  value={generatorType}
                  onChange={e => setGeneratorType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value="HOTEL">Luxury Hotel & Resort</option>
                  <option value="RESTAURANT">Commercial Restaurant</option>
                  <option value="CANTEEN">Corporate / University Canteen</option>
                  <option value="CATERING">Industrial Catering Facility</option>
                </select>
              </div>

              {dispatchedSuccess ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-300 font-bold font-mono">
                    <Check className="w-4 h-4" />
                    <span>BATCH DISPATCHED TO NEURAL-GRID</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80">QR code generated & fleet driver notified.</p>
                </div>
              ) : (
                <button
                  onClick={handleDispatch}
                  disabled={!auditResult || auditResult.status !== 'APPROVED_FOR_DISPATCH' || isDispatching}
                  className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                    auditResult?.status === 'APPROVED_FOR_DISPATCH'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>LOGGING TO NEURAL GRID...</span>
                    </>
                  ) : (
                    <>
                      <span>APPROVE & DISPATCH BATCH</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {auditResult?.status !== 'APPROVED_FOR_DISPATCH' && (
                <p className="text-[11px] text-rose-400 font-mono text-center">
                  * Dispatch blocked: Contamination exceeds permissible 15% threshold.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
