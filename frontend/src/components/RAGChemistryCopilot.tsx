import React, { useState } from 'react';
import { 
  Zap, 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  RefreshCw
} from 'lucide-react';
import type { CopilotResponse } from '../types';
import { apiClient } from '../api/client';

export const RAGChemistryCopilot: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; data?: CopilotResponse }>>([
    {
      role: 'assistant',
      text: "👋 Welcome to **BioWaste Neural-Grid RAG Copilot**. I am your biochemical process AI assistant, indexed with VDI 4630, IWA ADM1, and industrial anaerobic digestion engineering handbooks. Ask me about C:N balancing, VFA/TIC souring diagnostics, foaming prevention, or thermophilic thermal control."
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [operatingMode, setOperatingMode] = useState<'MESOPHILIC' | 'THERMOPHILIC'>('MESOPHILIC');
  const [currentPh, setCurrentPh] = useState(7.2);
  const [currentVfaTic, setCurrentVfaTic] = useState(0.22);

  const samplePrompts = [
    {
      title: "🚨 Acidification / Souring Alert",
      query: "Our primary digester pH dropped to 6.3 and VFA/TIC ratio reached 0.46. What emergency dosing and loading actions should we take immediately?",
      ph: 6.3,
      vfa: 0.46
    },
    {
      title: "🥩 High-Protein Co-Digestion",
      query: "We have an incoming 2-ton batch of canteen meat and dairy waste (C:N 8:1). How do we calculate the high-carbon co-substrate recipe to avoid Free Ammonia Nitrogen (FAN) inhibition?",
      ph: 7.3,
      vfa: 0.24
    },
    {
      title: "🫧 Foaming & FOG Surge Control",
      query: "Excessive foaming observed in the gas dome following a delivery of restaurant grease trap FOG. What mixer duty cycle and antifoam protocol should be applied?",
      ph: 7.1,
      vfa: 0.29
    },
    {
      title: "🌡️ Thermophilic Temperature Shock",
      query: "How sensitive are thermophilic methanogens (55°C) to a 1.2°C temperature drop compared to mesophilic systems?",
      ph: 7.0,
      vfa: 0.26
    }
  ];

  const handleSend = async (queryText?: string, overridePh?: number, overrideVfa?: number) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const activePh = overridePh !== undefined ? overridePh : currentPh;
    const activeVfa = overrideVfa !== undefined ? overrideVfa : currentVfaTic;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const response = await apiClient.queryCopilot({
        query: textToSend,
        digester_id: "DIGESTER-ALPHA-01",
        operating_mode: operatingMode,
        current_ph: activePh,
        current_vfa_tic: activeVfa,
        temperature_c: operatingMode === 'MESOPHILIC' ? 37.4 : 55.0
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: response.answer,
          data: response
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "⚠️ Communication error with biochemical vector store. Please retry."
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                RAG Biogas Chemistry Copilot
              </h1>
              <p className="text-sm text-slate-400">
                Vector-indexed anaerobic digestion intelligence for C:N balance, VFA/TIC buffering, and digester health troubleshooting.
              </p>
            </div>
          </div>

          {/* Digester State Simulator Controls */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Mode:</span>
              <button
                onClick={() => setOperatingMode(m => m === 'MESOPHILIC' ? 'THERMOPHILIC' : 'MESOPHILIC')}
                className="px-2 py-1 bg-slate-800 text-cyan-300 rounded border border-slate-700 font-bold"
              >
                {operatingMode} ({operatingMode === 'MESOPHILIC' ? '37°C' : '55°C'})
              </button>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">pH:</span>
              <input
                type="number"
                step="0.1"
                min="5.5"
                max="8.5"
                value={currentPh}
                onChange={e => setCurrentPh(parseFloat(e.target.value) || 7.0)}
                className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">VFA/TIC:</span>
              <input
                type="number"
                step="0.02"
                min="0.1"
                max="0.8"
                value={currentVfaTic}
                onChange={e => setCurrentVfaTic(parseFloat(e.target.value) || 0.22)}
                className={`w-16 px-1.5 py-0.5 bg-slate-950 border rounded text-center font-bold ${
                  currentVfaTic >= 0.40 ? 'text-rose-400 border-rose-500' : 'text-emerald-400 border-slate-700'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Copilot Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chat Conversation Stream (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[640px] glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          
          {/* Chat Messages Container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              const data = msg.data;
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs font-sans space-y-2.5 ${
                    isAssistant
                      ? 'bg-slate-900/90 text-slate-200 border border-slate-800'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg font-medium'
                  }`}>
                    
                    {/* Stability Badge if present */}
                    {data && (
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-mono">
                        <div className="flex items-center space-x-1.5">
                          {data.stability_verdict === 'CRITICAL_SOURING_RISK' ? (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-bold flex items-center space-x-1">
                              <ShieldAlert className="w-3 h-3" />
                              <span>CRITICAL SOURING RISK</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>OPTIMAL BIOCHEMICAL EQUILIBRIUM</span>
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono">Confidence: {Math.round(data.confidence_score * 100)}%</span>
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-line leading-relaxed font-sans text-slate-200">
                      {msg.text}
                    </div>

                    {/* Citations Box */}
                    {data?.citations && data.citations.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 text-[10px] font-mono space-y-1">
                        <div className="text-slate-400 flex items-center space-x-1">
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>Scientific Sources & AD Guidelines:</span>
                        </div>
                        {data.citations.map((cite, cIdx) => (
                          <div key={cIdx} className="bg-slate-950/70 p-2 rounded border border-slate-800/80 text-cyan-300">
                            <div><strong>{cite.topic}:</strong> {cite.source}</div>
                            {cite.formula && <div className="text-slate-400 mt-0.5">Formula: {cite.formula}</div>}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="animate-pulse">Retrieving biochemical literature & formulating remediation protocol...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask the Biogas Copilot (e.g., How to handle free ammonia surge from meat waste?)..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:opacity-90 disabled:opacity-50 transition shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Column: Instant Biochemical Diagnostic Prompts (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Biochemical Diagnostic Presets</span>
            </h2>

            <div className="space-y-2.5">
              {samplePrompts.map((prompt, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSend(prompt.query, prompt.ph, prompt.vfa)}
                  className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer transition text-xs space-y-1 group"
                >
                  <div className="font-bold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                    <span>{prompt.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">Run &rarr;</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {prompt.query}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Biochemical Reference Box */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-400 font-bold uppercase tracking-wider">
              Operating Threshold Rules
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex justify-between">
                <span>Optimal VFA/TIC:</span>
                <span className="text-emerald-400 font-bold">0.15 - 0.30</span>
              </li>
              <li className="flex justify-between">
                <span>Critical Souring:</span>
                <span className="text-rose-400 font-bold">&gt; 0.40</span>
              </li>
              <li className="flex justify-between">
                <span>Optimal C:N Ratio:</span>
                <span className="text-cyan-400 font-bold">20:1 - 30:1</span>
              </li>
              <li className="flex justify-between">
                <span>Free Ammonia (FAN):</span>
                <span className="text-amber-400 font-bold">&lt; 200 mg/L</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
