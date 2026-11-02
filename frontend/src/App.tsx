import { useState } from 'react';
import type { UserRole, BatchResponse } from './types';
import { Navbar } from './components/Navbar';
import { ProducerDirectory } from './components/ProducerDirectory';
import { VisionAuditor } from './components/VisionAuditor';
import { BMPCarbonCalculator } from './components/BMPCarbonCalculator';
import { RAGChemistryCopilot } from './components/RAGChemistryCopilot';
import { LogisticsHub } from './components/LogisticsHub';
import { DigesterSCADA } from './components/DigesterSCADA';
import { ESGMarketplace } from './components/ESGMarketplace';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('KITCHEN');
  const [activeTab, setActiveTab] = useState<string>('producers');
  const [tokenBalance, setTokenBalance] = useState<number>(339.60);
  const [newlyCreatedBatch, setNewlyCreatedBatch] = useState<BatchResponse | null>(null);
  const [selectedProducerName, setSelectedProducerName] = useState<string>('Grand Horizon Palace Hotel');
  const [selectedProducerCategory, setSelectedProducerCategory] = useState<string>('HOTEL');

  // Auto-switch tab on role change to highlight respective persona module
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'KITCHEN') {
      setActiveTab('vision');
    } else if (role === 'DRIVER') {
      setActiveTab('logistics');
    } else if (role === 'PLANT_OPERATOR') {
      setActiveTab('scada');
    } else if (role === 'ADMIN') {
      setActiveTab('esg');
    }
  };

  const handleBatchCreated = (batch: BatchResponse) => {
    setNewlyCreatedBatch(batch);
    setTokenBalance(prev => prev + batch.green_tokens_earned);
  };

  const handleSelectProducerForAudit = (name: string, category: string) => {
    setSelectedProducerName(name);
    setSelectedProducerCategory(category);
    setActiveTab('vision');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Interactive Navbar with Role Switcher & Live Token Ticker */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        tokenBalance={tokenBalance}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'producers' && (
          <ProducerDirectory onSelectProducerForAudit={handleSelectProducerForAudit} />
        )}

        {activeTab === 'vision' && (
          <VisionAuditor 
            onBatchCreated={handleBatchCreated}
            initialGeneratorName={selectedProducerName}
            initialGeneratorType={selectedProducerCategory}
          />
        )}

        {activeTab === 'bmp' && (
          <BMPCarbonCalculator />
        )}

        {activeTab === 'copilot' && (
          <RAGChemistryCopilot />
        )}

        {activeTab === 'logistics' && (
          <LogisticsHub
            currentRole={currentRole}
            newlyCreatedBatch={newlyCreatedBatch}
          />
        )}

        {activeTab === 'scada' && (
          <DigesterSCADA />
        )}

        {activeTab === 'esg' && (
          <ESGMarketplace tokenBalance={tokenBalance} />
        )}
      </main>

      {/* Futuristic System Status Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold">GRID ONLINE</span>
            </span>
            <span>|</span>
            <span>FASTAPI BACKEND: 127.0.0.1:8000</span>
            <span>|</span>
            <span>PRODUCER NETWORK ACTIVE</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">BioWaste Neural-Grid &copy; 2026</span>
            <span className="text-emerald-400/80 font-bold">VDI 4630 / IPCC Tier 1 Standard</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
