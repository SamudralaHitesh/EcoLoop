import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Droplets,
  Sparkles,
  Award
} from 'lucide-react';
import type { DigesterTelemetry } from '../types';
import { apiClient } from '../api/client';

export const DigesterSCADA: React.FC = () => {
  const [telemetry, setTelemetry] = useState<DigesterTelemetry | null>(null);
  const [selectedDigester, setSelectedDigester] = useState<string>('DIGESTER-ALPHA-01');
  
  // Recipe Optimizer State
  const [meatKg, setMeatKg] = useState<number>(80);
  const [fogKg, setFogKg] = useState<number>(30);
  const [greensKg, setGreensKg] = useState<number>(150);
  const [recipeResult, setRecipeResult] = useState<any>(null);

  const fetchTelemetry = async () => {
    try {
      const data = await apiClient.getDigesterTelemetry(selectedDigester);
      setTelemetry(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOptimizeRecipe = async () => {
    try {
      const res = await apiClient.optimizeRecipe({ meat_kg: meatKg, fog_kg: fogKg, greens_kg: greensKg });
      setRecipeResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, [selectedDigester]);

  useEffect(() => {
    handleOptimizeRecipe();
  }, [meatKg, fogKg, greensKg]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Industrial Biogas Facility SCADA Console
              </h1>
              <p className="text-sm text-slate-400">
                Real-time CSTR digester telemetry, VFA/TIC biological buffering, and co-digestion recipe balancer.
              </p>
            </div>
          </div>

          {/* Digester Selector */}
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedDigester('DIGESTER-ALPHA-01')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                selectedDigester === 'DIGESTER-ALPHA-01'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CSTR Alpha-01 (Mesophilic 37°C)
            </button>
            <button
              onClick={() => setSelectedDigester('DIGESTER-BETA-02')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                selectedDigester === 'DIGESTER-BETA-02'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermophilic Beta-02 (55°C)
            </button>
          </div>
        </div>
      </div>

      {/* SCADA Telemetry Dials Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Dial 1: pH Level */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Digester pH</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {telemetry?.ph_level.toFixed(2) || '7.24'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Target: 7.0 - 7.5</span>
        </div>

        {/* Dial 2: VFA/TIC Ratio */}
        <div className={`glass-panel p-4 rounded-xl border text-center space-y-1 ${
          (telemetry?.vfa_tic_ratio || 0) >= 0.40 
            ? 'border-rose-500/50 bg-rose-950/20' 
            : 'border-slate-800'
        }`}>
          <span className="text-[11px] font-mono text-slate-400 uppercase">VFA/TIC Ratio</span>
          <div className={`text-2xl font-bold font-mono ${
            (telemetry?.vfa_tic_ratio || 0) >= 0.35 ? 'text-rose-400' : 'text-cyan-400'
          }`}>
            {telemetry?.vfa_tic_ratio.toFixed(2) || '0.22'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Limit: &lt; 0.30</span>
        </div>

        {/* Dial 3: Temperature */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Temperature</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {telemetry?.operating_temp_c.toFixed(1) || '37.4'}°C
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Set: {telemetry?.target_temp_c}°C</span>
        </div>

        {/* Dial 4: Biogas Flow */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Biogas Production</span>
          <div className="text-2xl font-bold font-mono text-white">
            {telemetry?.biogas_production_m3_h.toFixed(1) || '342.5'}
          </div>
          <span className="text-[10px] text-teal-400 font-mono">m³ / hour</span>
        </div>

        {/* Dial 5: Methane CH4 % */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">CH4 Purity</span>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {telemetry?.ch4_concentration_pct.toFixed(1) || '62.8'}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">CO₂: {telemetry?.co2_concentration_pct}%</span>
        </div>

        {/* Dial 6: H2S Gas */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">H2S Content</span>
          <div className={`text-2xl font-bold font-mono ${
            (telemetry?.h2s_ppm || 0) > 150 ? 'text-rose-400' : 'text-purple-400'
          }`}>
            {telemetry?.h2s_ppm.toFixed(0) || '64'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">ppm (Desulfurized)</span>
        </div>

      </div>

      {/* Main Dual Columns: Recipe Co-Digestion Balancer vs Digestate Bio-Fertilizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Co-Digestion Recipe Balancer (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Feedstock Co-Digestion Recipe Optimizer</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400">Target C:N = 25:1</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-slate-400">Meat Waste (kg)</label>
              <input
                type="number"
                value={meatKg}
                onChange={e => setMeatKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
              <span className="text-[10px] text-slate-500">C:N ~ 8:1 (High Nitrogen)</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">FOG Grease (kg)</label>
              <input
                type="number"
                value={fogKg}
                onChange={e => setFogKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
              <span className="text-[10px] text-slate-500">High Methane Potential</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Greens & Peels (kg)</label>
              <input
                type="number"
                value={greensKg}
                onChange={e => setGreensKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
              <span className="text-[10px] text-slate-500">Moisture & Inoculum</span>
            </div>
          </div>

          {/* Optimizer Recommendation Output */}
          {recipeResult && (
            <div className="p-4 bg-slate-900/90 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-300">RECIPE CALCULATION SUMMARY</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                  {recipeResult.projected_cn_ratio} C:N
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Add Bakery Starch Substrate:</span>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    +{recipeResult.recommended_blend.co_substrate_bakery_starch_kg} kg
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Projected Methane Yield:</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {recipeResult.projected_methane_yield_m3} m³ CH₄
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                💡 <strong>Biochemical Rule:</strong> {recipeResult.guidance}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Bio-Fertilizer & Digestate Valorization (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-teal-400" />
              <span>Bio-Fertilizer & Digestate Inventory</span>
            </h2>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-4">
            
            {/* Liquid Bio-Fertilizer */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Liquid Bio-Fertilizer (Centrifuge Effluent)</span>
                <span className="text-teal-400 font-bold">410 m³ (82% Storage)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full" style={{ width: '82%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>NPK: 4.2 - 1.8 - 3.1</span>
                <span>Certified USDA/EU Organic</span>
              </div>
            </div>

            {/* Solid Compost Cake */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Solid Humic Compost Cake</span>
                <span className="text-amber-400 font-bold">142 Tons (58% Storage)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full" style={{ width: '58%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Moisture: 28% Dry Matter</span>
                <span>Soil Regeneration Ready</span>
              </div>
            </div>

            {/* Digestate Dispatch Log */}
            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-xs font-mono text-emerald-300 space-y-1">
              <div className="font-bold">✓ Regional Agricultural Co-Op Dispatch</div>
              <p className="text-[11px] text-slate-400">
                12,000 Liters dispatched today for organic vineyard fertigation.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
