import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  QrCode, 
  CheckCircle2, 
  MapPin, 
  Scale, 
  AlertCircle,
  Search,
  Flame
} from 'lucide-react';
import type { BatchResponse, BatchStatus, UserRole } from '../types';
import { apiClient } from '../api/client';

interface LogisticsHubProps {
  currentRole: UserRole;
  newlyCreatedBatch?: BatchResponse | null;
}

export const LogisticsHub: React.FC<LogisticsHubProps> = ({ currentRole, newlyCreatedBatch }) => {
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Scale Modal State
  const [scaleModalBatch, setScaleModalBatch] = useState<BatchResponse | null>(null);
  const [scaleWeightInput, setScaleWeightInput] = useState<string>('');
  const [driverNameInput, setDriverNameInput] = useState<string>('Marcus Vance (Fleet Alpha-4)');
  const [isVerifyingScale, setIsVerifyingScale] = useState(false);

  // QR Modal State
  const [qrModalBatch, setQrModalBatch] = useState<BatchResponse | null>(null);

  const loadBatches = async () => {
    try {
      const data = await apiClient.getBatches();
      setBatches(data);
      if (data.length > 0 && !selectedBatch) {
        setSelectedBatch(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (newlyCreatedBatch) {
      setBatches(prev => [newlyCreatedBatch, ...prev.filter(b => b.batch_id !== newlyCreatedBatch.batch_id)]);
      setSelectedBatch(newlyCreatedBatch);
    }
  }, [newlyCreatedBatch]);

  const handleVerifyScaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scaleModalBatch || !scaleWeightInput) return;
    setIsVerifyingScale(true);

    try {
      const updated = await apiClient.verifyScale(
        scaleModalBatch.batch_id,
        parseFloat(scaleWeightInput),
        driverNameInput
      );
      setBatches(prev => prev.map(b => b.batch_id === updated.batch_id ? updated : b));
      setSelectedBatch(updated);
      setScaleModalBatch(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingScale(false);
    }
  };

  const handleAcceptAtPlant = async (batchId: string) => {
    try {
      const res = await fetch(`/api/batches/${batchId}/transition?new_status=RECEIVED_AT_PLANT&notes=Inflow%20Gate%20Accepted`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        setBatches(prev => prev.map(b => b.batch_id === updated.batch_id ? updated : b));
        setSelectedBatch(updated);
      } else {
        // Local state update
        setBatches(prev => prev.map(b => b.batch_id === batchId ? { ...b, status: 'RECEIVED_AT_PLANT' as BatchStatus } : b));
      }
    } catch (err) {
      setBatches(prev => prev.map(b => b.batch_id === batchId ? { ...b, status: 'RECEIVED_AT_PLANT' as BatchStatus } : b));
    }
  };

  const filteredBatches = batches.filter(b => {
    if (activeFilter !== 'ALL' && b.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.batch_id.toLowerCase().includes(q) || b.generator_name.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: BatchStatus) => {
    switch (status) {
      case 'DISPATCH_READY':
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">READY FOR PICKUP</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-mono font-bold animate-pulse">IN TRANSIT</span>;
      case 'RECEIVED_AT_PLANT':
        return <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-mono font-bold">RECEIVED AT PLANT</span>;
      case 'IN_DIGESTER':
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">IN DIGESTER</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-mono font-bold">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Logistics & Multi-Party Lifecycle Grid
              </h1>
              <p className="text-sm text-slate-400">
                End-to-end chain of custody from Commercial Kitchens to Fleet Drivers & Biogas Inflow Gates.
              </p>
            </div>
          </div>

          {/* Perspective Indicator */}
          <div className="px-3.5 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center space-x-2">
            <span>ACTIVE ROLE:</span>
            <span className="text-emerald-400 font-bold">{currentRole}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Status Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto text-xs font-mono">
          {['ALL', 'DISPATCH_READY', 'IN_TRANSIT', 'RECEIVED_AT_PLANT', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeFilter === f
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Batch ID or Generator..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono w-full sm:w-64"
          />
        </div>
      </div>

      {/* Main Grid: Batch List vs Batch Detailed Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Batches Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredBatches.map(batch => {
            const isSelected = selectedBatch?.batch_id === batch.batch_id;
            return (
              <div
                key={batch.batch_id}
                onClick={() => setSelectedBatch(batch)}
                className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-400 bg-slate-900/90 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-white">{batch.batch_id}</span>
                  {getStatusBadge(batch.status)}
                </div>

                <div className="text-sm font-semibold text-slate-200">{batch.generator_name}</div>
                <div className="text-xs text-slate-400 flex items-center space-x-1 mt-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{batch.location_address}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Mass: </span>
                    <span className="text-emerald-400 font-bold">{batch.total_weight_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Purity: </span>
                    <span className="text-cyan-400 font-bold">{batch.purity_pct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Methane: </span>
                    <span className="text-amber-400 font-bold">{batch.methane_potential_m3} m³</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Batch Custody Ledger & Actions (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedBatch ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              
              {/* Batch Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold font-mono text-white">{selectedBatch.batch_id}</span>
                    {getStatusBadge(selectedBatch.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Generator: {selectedBatch.generator_name} ({selectedBatch.generator_type})
                  </p>
                </div>

                {/* QR Code Action Button */}
                <button
                  onClick={() => setQrModalBatch(selectedBatch)}
                  className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-mono transition self-start sm:self-auto"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>View QR Manifest</span>
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Total Mass</span>
                  <div className="text-base font-bold text-white mt-0.5">{selectedBatch.total_weight_kg} kg</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Scale Verified</span>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {selectedBatch.verified_scale_weight_kg ? `${selectedBatch.verified_scale_weight_kg} kg` : 'Pending'}
                  </div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Avoided CO₂e</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{selectedBatch.avoided_co2e_kg} kg</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Tokens Earned</span>
                  <div className="text-base font-bold text-purple-400 mt-0.5">{selectedBatch.green_tokens_earned} GET</div>
                </div>
              </div>

              {/* Role Context Actions */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  Operational Next Steps ({currentRole})
                </div>

                <div className="flex flex-wrap gap-3">
                  
                  {/* Driver Pickup Verification Button */}
                  {selectedBatch.status === 'DISPATCH_READY' && (
                    <button
                      onClick={() => {
                        setScaleModalBatch(selectedBatch);
                        setScaleWeightInput(selectedBatch.total_weight_kg.toString());
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 hover:opacity-90 transition shadow-lg cursor-pointer"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Verify Digital Scale & Accept Pickup</span>
                    </button>
                  )}

                  {/* Plant Inflow Acceptance Button */}
                  {selectedBatch.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleAcceptAtPlant(selectedBatch.batch_id)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 hover:opacity-90 transition shadow-lg cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Gate 2 Inflow Verification: Accept Batch</span>
                    </button>
                  )}

                  {selectedBatch.status === 'RECEIVED_AT_PLANT' && (
                    <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-500/30">
                      <Flame className="w-4 h-4" />
                      <span>Inflow scheduled for continuous digester feeding.</span>
                    </div>
                  )}

                  {selectedBatch.status === 'REJECTED' && (
                    <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 bg-rose-950/40 px-3 py-2 rounded-lg border border-rose-500/30">
                      <AlertCircle className="w-4 h-4" />
                      <span>Batch locked: Manual sorting of plastic contaminants required.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chain of Custody Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Audit Chain of Custody Timeline
                </h3>

                <div className="space-y-3">
                  {selectedBatch.timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5 shadow-sm shadow-emerald-400"></div>
                      <div className="flex-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex justify-between font-mono">
                          <span className="font-bold text-white">{event.step}</span>
                          <span className="text-slate-500">{event.timestamp}</span>
                        </div>
                        <p className="text-slate-400 mt-1 font-mono text-[11px]">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 font-mono text-xs rounded-2xl border border-slate-800">
              Select a batch from the list to inspect custody telemetry.
            </div>
          )}
        </div>

      </div>

      {/* Scale Verification Modal */}
      {scaleModalBatch && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl border border-amber-500/40 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono text-sm">
                <Scale className="w-5 h-5" />
                <span>Driver Digital Scale Ingestion</span>
              </div>
              <button
                onClick={() => setScaleModalBatch(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleVerifyScaleSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Batch ID</label>
                <input
                  type="text"
                  disabled
                  value={scaleModalBatch.batch_id}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Driver / Truck ID</label>
                <input
                  type="text"
                  value={driverNameInput}
                  onChange={e => setDriverNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Calibrated Scale Reading (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={scaleWeightInput}
                  onChange={e => setScaleWeightInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-lg text-white font-bold text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Estimated kitchen weight: {scaleModalBatch.total_weight_kg} kg
                </p>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setScaleModalBatch(null)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingScale}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl hover:opacity-90 shadow-lg cursor-pointer"
                >
                  {isVerifyingScale ? 'Verifying...' : 'Confirm Pickup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Manifest Modal */}
      {qrModalBatch && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl border border-emerald-500/40 p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold font-mono text-emerald-400">CRYPTOGRAPHIC BATCH QR</span>
              <button onClick={() => setQrModalBatch(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            {/* Generated QR Mock SVG */}
            <div className="p-4 bg-white rounded-xl inline-block shadow-xl">
              <div className="w-48 h-48 bg-slate-950 rounded-lg p-2 flex flex-col items-center justify-center text-emerald-400 font-mono text-xs">
                <QrCode className="w-32 h-32 text-emerald-400" />
                <span className="mt-1 text-[10px] text-white">{qrModalBatch.qr_code_id}</span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-300 space-y-1 text-left bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Generator:</span>
                <span className="font-bold text-white">{qrModalBatch.generator_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mass:</span>
                <span className="font-bold text-emerald-400">{qrModalBatch.total_weight_kg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purity:</span>
                <span className="font-bold text-cyan-400">{qrModalBatch.purity_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="text-slate-300 text-[10px] truncate">{qrModalBatch.target_facility}</span>
              </div>
            </div>

            <button
              onClick={() => setQrModalBatch(null)}
              className="w-full py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-mono hover:bg-slate-700"
            >
              Close Manifest
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
