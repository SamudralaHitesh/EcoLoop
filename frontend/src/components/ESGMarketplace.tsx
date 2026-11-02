import React, { useState } from 'react';
import { 
  Activity, 
  Leaf, 
  Award, 
  ShieldCheck, 
  ArrowUpRight, 
  Download, 
  FileText, 
  Sparkles
} from 'lucide-react';

interface ESGMarketplaceProps {
  tokenBalance: number;
}

export const ESGMarketplace: React.FC<ESGMarketplaceProps> = ({ tokenBalance }) => {
  const [showCertificate, setShowCertificate] = useState(false);

  const transactions = [
    { id: 'TX-GET-8902', date: '2026-08-30 08:35', org: 'Grand Horizon Palace Hotel', amount: '+96.30 GET', co2e: '998.4 kg CO₂e', status: 'VERIFIED' },
    { id: 'TX-GET-8891', date: '2026-08-29 17:10', org: 'Spice Route Gourmet Bistro', amount: '+51.00 GET', co2e: '521.3 kg CO₂e', status: 'VERIFIED' },
    { id: 'TX-GET-8874', date: '2026-08-29 11:45', org: 'Metro Tech Tower Canteen', amount: '+92.30 GET', co2e: '982.0 kg CO₂e', status: 'VERIFIED' },
    { id: 'TX-GET-8850', date: '2026-08-28 15:20', org: 'BioPower Facility Grid Injection', amount: '+180.50 GET', co2e: '1,890.0 kg CO₂e', status: 'VERIFIED' },
  ];

  const usdValue = tokenBalance * 15.0;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500/20 to-emerald-500/20 border border-purple-500/30 text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                ESG Carbon Avoidance Ledger & Token Marketplace
              </h1>
              <p className="text-sm text-slate-400">
                Verified methane diversion credits, immutable green energy tokenization, and sustainability reporting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 transition"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Generate ESG Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Token Balance */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 relative overflow-hidden space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-purple-300">
            <span>TOTAL MINTED GREEN TOKENS</span>
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div className="text-4xl font-bold font-mono text-white">
            {tokenBalance.toFixed(2)} <span className="text-lg font-normal text-purple-400">GET</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Market Value: <strong className="text-emerald-400">${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</strong> (@ $15.00/GET)
          </div>
        </div>

        {/* Total Avoided Carbon */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-emerald-300">
            <span>CUMULATIVE AVOIDED GHG</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-bold font-mono text-white">
            4,391.7 <span className="text-lg font-normal text-emerald-400">kg CO₂e</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Equiv to diverting <strong className="text-white">2.31 Tons</strong> of commercial food waste
          </div>
        </div>

        {/* Renewable Energy Yield */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-cyan-300">
            <span>GRID CLEAN ELECTRICITY</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-4xl font-bold font-mono text-white">
            3,480.5 <span className="text-lg font-normal text-cyan-400">kWh</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Displaced coal/gas grid baseline power
          </div>
        </div>

      </div>

      {/* Transactions & Carbon Ledger */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable Green Energy Token Ledger</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">ISO 14064 / EPA Compliance Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Producer / Node</th>
                <th className="py-2.5 px-3">Avoided Emissions</th>
                <th className="py-2.5 px-3">Tokens Minted</th>
                <th className="py-2.5 px-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-900/40 text-slate-200">
                  <td className="py-3 px-3 font-bold text-white">{tx.id}</td>
                  <td className="py-3 px-3 text-slate-400">{tx.date}</td>
                  <td className="py-3 px-3">{tx.org}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{tx.co2e}</td>
                  <td className="py-3 px-3 text-purple-400 font-bold">{tx.amount}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ESG Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl border border-emerald-500/50 p-8 max-w-xl w-full text-center space-y-6 relative">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-mono"
            >
              &times;
            </button>

            {/* Seal */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Award className="w-8 h-8 text-slate-950" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                OFFICIAL ESG CARBON OFFSET CERTIFICATE
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                BioWaste Neural-Grid Diversion Verification
              </h2>
              <p className="text-xs text-slate-400 font-mono">Certificate ID: #ESG-BNG-2026-984421</p>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-mono text-left space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Certified Facility:</span>
                <span className="font-bold text-white">Grand Horizon Palace Hotel</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Biogas Facility:</span>
                <span className="text-slate-200">BioPower AD Mega-Facility 01</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Total Net Diversion:</span>
                <span className="font-bold text-emerald-400">2,310.0 kg Organic Scrap</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Avoided GHG Emissions:</span>
                <span className="font-bold text-emerald-300">4,389.0 kg CO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Standard Framework:</span>
                <span className="text-cyan-400">GHG Protocol / IPCC Tier 1</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowCertificate(false)}
                className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-mono hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Certificate PDF downloaded to your local device.');
                  setShowCertificate(false);
                }}
                className="w-1/2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs font-mono hover:opacity-90 shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Certificate</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
