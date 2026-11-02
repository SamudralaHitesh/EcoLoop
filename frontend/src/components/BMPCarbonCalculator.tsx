import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Zap, 
  Leaf, 
  DollarSign, 
  RotateCcw, 
  Info, 
  Calculator,
  Sliders,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import type { FeedstockInput, BMPCalculationResult } from '../types';
import { apiClient } from '../api/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

export const BMPCarbonCalculator: React.FC = () => {
  const [feedstock, setFeedstock] = useState<FeedstockInput>({
    fog_kg: 50.0,
    meat_proteins_kg: 80.0,
    carbs_starches_kg: 150.0,
    mixed_cooked_kg: 200.0,
    raw_greens_kg: 120.0,
    purity_factor: 96.0
  });

  const [calculation, setCalculation] = useState<BMPCalculationResult | null>(null);

  const fetchCalculation = async (data: FeedstockInput) => {
    try {
      const result = await apiClient.calculateBMP(data);
      setCalculation(result);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCalculation(feedstock);
  }, [feedstock]);

  const handleSliderChange = (key: keyof FeedstockInput, val: number) => {
    setFeedstock(prev => ({ ...prev, [key]: val }));
  };

  // Prepare chart data
  const breakdownData = calculation ? [
    { name: 'FOG Grease', ch4: calculation.feedstock_breakdown.fog.ch4_yield_m3, kwh: calculation.feedstock_breakdown.fog.energy_kwh, color: '#f59e0b', factor: '0.85 m³/kg' },
    { name: 'Meat & Proteins', ch4: calculation.feedstock_breakdown.meat_proteins.ch4_yield_m3, kwh: calculation.feedstock_breakdown.meat_proteins.energy_kwh, color: '#06b6d4', factor: '0.49 m³/kg' },
    { name: 'Carbs & Starches', ch4: calculation.feedstock_breakdown.carbs_starches.ch4_yield_m3, kwh: calculation.feedstock_breakdown.carbs_starches.energy_kwh, color: '#10b981', factor: '0.37 m³/kg' },
    { name: 'Mixed Cooked', ch4: calculation.feedstock_breakdown.mixed_cooked.ch4_yield_m3, kwh: calculation.feedstock_breakdown.mixed_cooked.energy_kwh, color: '#3b82f6', factor: '0.25 m³/kg' },
    { name: 'Raw Greens', ch4: calculation.feedstock_breakdown.raw_greens.ch4_yield_m3, kwh: calculation.feedstock_breakdown.raw_greens.energy_kwh, color: '#84cc16', factor: '0.18 m³/kg' },
  ] : [];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Biochemical Methane Potential (BMP) & Carbon Engine
            </h1>
            <p className="text-sm text-slate-400">
              Thermodynamic degradation modeling, CHP electricity conversion, and verified ESG Green Energy Token minting.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Net Methane Yield */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">Net Methane (CH4)</span>
            <Flame className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-white">
              {calculation?.methane_yield_m3.toLocaleString() || '0.00'}{' '}
              <span className="text-sm font-normal text-cyan-400">m³</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Raw Biogas: {calculation?.total_biogas_yield_m3.toLocaleString() || '0.00'} m³ (60% CH₄)
            </p>
          </div>
        </div>

        {/* Card 2: CHP Electricity */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">CHP Electricity</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-white">
              {calculation?.chp_electricity_kwh.toLocaleString() || '0.0'}{' '}
              <span className="text-sm font-normal text-amber-400">kWh</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Thermal Output: {calculation?.chp_thermal_kwh.toLocaleString() || '0.0'} kWh
            </p>
          </div>
        </div>

        {/* Card 3: Avoided Carbon */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">Avoided GHG Emissions</span>
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-white">
              {calculation?.avoided_co2e_kg.toLocaleString() || '0.0'}{' '}
              <span className="text-sm font-normal text-emerald-400">kg CO₂e</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Factor: 1.90 kg CO₂e diverted / kg organic
            </p>
          </div>
        </div>

        {/* Card 4: Green Energy Tokens (GET) */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">Green Energy Tokens</span>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-white">
              {calculation?.green_energy_tokens.toLocaleString() || '0.00'}{' '}
              <span className="text-sm font-normal text-purple-400">GET</span>
            </div>
            <p className="text-xs text-purple-300/80 font-mono mt-1 font-semibold">
              ≈ ${calculation?.esg_token_value_usd.toLocaleString() || '0.00'} USD ESG Value
            </p>
          </div>
        </div>

      </div>

      {/* Interactive Controls & Kinetics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Feedstock Mass Sliders (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Feedstock Mass Ingestion (kg)</span>
            </h2>
            <button
              onClick={() => setFeedstock({ fog_kg: 50, meat_proteins_kg: 80, carbs_starches_kg: 150, mixed_cooked_kg: 200, raw_greens_kg: 120, purity_factor: 96 })}
              className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4">
            
            {/* FOG Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-semibold">Fats, Oils & Greases (FOG)</span>
                <span className="text-white font-bold">{feedstock.fog_kg} kg <span className="text-slate-400 font-normal">(@ 0.85 m³/kg)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                value={feedstock.fog_kg}
                onChange={e => handleSliderChange('fog_kg', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Meat & Proteins Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400 font-semibold">Meat, Fish & Animal Protein</span>
                <span className="text-white font-bold">{feedstock.meat_proteins_kg} kg <span className="text-slate-400 font-normal">(@ 0.49 m³/kg)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                value={feedstock.meat_proteins_kg}
                onChange={e => handleSliderChange('meat_proteins_kg', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Carbs & Starches Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-semibold">Rice, Bread, Pasta & Starches</span>
                <span className="text-white font-bold">{feedstock.carbs_starches_kg} kg <span className="text-slate-400 font-normal">(@ 0.37 m³/kg)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                value={feedstock.carbs_starches_kg}
                onChange={e => handleSliderChange('carbs_starches_kg', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Mixed Cooked Scrap Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-blue-400 font-semibold">Prepared Mixed Kitchen Scrap</span>
                <span className="text-white font-bold">{feedstock.mixed_cooked_kg} kg <span className="text-slate-400 font-normal">(@ 0.25 m³/kg)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                value={feedstock.mixed_cooked_kg}
                onChange={e => handleSliderChange('mixed_cooked_kg', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            {/* Raw Greens & Peels Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-lime-400 font-semibold">Fruit & Vegetable Peels</span>
                <span className="text-white font-bold">{feedstock.raw_greens_kg} kg <span className="text-slate-400 font-normal">(@ 0.18 m³/kg)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                value={feedstock.raw_greens_kg}
                onChange={e => handleSliderChange('raw_greens_kg', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-lime-400"
              />
            </div>

            {/* Purity Factor Slider */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-400 font-semibold">CV Audit Purity Factor (%)</span>
                <span className="text-purple-300 font-bold">{feedstock.purity_factor}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="0.5"
                value={feedstock.purity_factor}
                onChange={e => handleSliderChange('purity_factor', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

          </div>

          {/* Mass Summary Badge */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Total Feedstock Batch:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {calculation?.total_feedstock_kg} kg <span className="text-slate-400 font-normal">(Net Organic: {calculation?.net_organic_kg} kg)</span>
            </span>
          </div>

        </div>

        {/* Right Column: Interactive Charts & Mathematical Audit Trail (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Methane Output By Fraction Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Stoichiometric CH4 Yield by Feedstock (m³)</span>
            </h2>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="ch4" radius={[6, 6, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mathematical Audit Trail */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
            <h2 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kinetics & Stoichiometry Formula Audit Trail</span>
            </h2>

            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              {calculation?.formula_audit_trail.map((formula, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{formula}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
