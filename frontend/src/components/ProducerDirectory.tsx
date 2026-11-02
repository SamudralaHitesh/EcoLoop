import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  QrCode, 
  MapPin, 
  Mail, 
  User, 
  CheckCircle2, 
  Search, 
  UtensilsCrossed,
  Hotel,
  Coffee,
  Factory,
  Store
} from 'lucide-react';
import type { ProducerResponse, ProducerRegistrationRequest } from '../types';
import { apiClient } from '../api/client';
import confetti from 'canvas-confetti';

interface ProducerDirectoryProps {
  onSelectProducerForAudit?: (producerName: string, category: string) => void;
}

export const ProducerDirectory: React.FC<ProducerDirectoryProps> = ({ onSelectProducerForAudit }) => {
  const [producers, setProducers] = useState<ProducerResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [qrModalProducer, setQrModalProducer] = useState<ProducerResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [form, setForm] = useState<ProducerRegistrationRequest>({
    name: '',
    category: 'RESTAURANT',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    location_address: '',
    latitude: 1.2900,
    longitude: 103.8500,
    avg_daily_waste_kg: 250,
    primary_waste_type: 'MIXED_COOKED',
    assigned_biogas_facility: 'BioPower AD Mega-Facility 01 (East Hub)'
  });

  const loadProducers = async () => {
    try {
      const data = await apiClient.getProducers();
      setProducers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducers();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location_address) return;
    setIsSubmitting(true);

    try {
      const newProducer = await apiClient.registerProducer(form);
      setProducers(prev => [newProducer, ...prev]);
      setShowAddModal(false);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Reset form
      setForm({
        name: '',
        category: 'RESTAURANT',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        location_address: '',
        latitude: 1.2900,
        longitude: 103.8500,
        avg_daily_waste_kg: 250,
        primary_waste_type: 'MIXED_COOKED',
        assigned_biogas_facility: 'BioPower AD Mega-Facility 01 (East Hub)'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducers = producers.filter(p => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.location_address.toLowerCase().includes(q) || p.contact_person.toLowerCase().includes(q);
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HOTEL': return <Hotel className="w-4 h-4 text-amber-400" />;
      case 'RESTAURANT': return <UtensilsCrossed className="w-4 h-4 text-emerald-400" />;
      case 'CANTEEN': return <Coffee className="w-4 h-4 text-cyan-400" />;
      case 'FOOD_PROCESSING': return <Factory className="w-4 h-4 text-purple-400" />;
      case 'SUPERMARKET': return <Store className="w-4 h-4 text-teal-400" />;
      default: return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Commercial Waste Producers & Restaurant Network
              </h1>
              <p className="text-sm text-slate-400">
                Onboard and manage commercial kitchens, luxury hotels, corporate canteens, catering hubs, and food companies.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ONBOARD NEW RESTAURANT / COMPANY</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto text-xs font-mono">
          {['ALL', 'RESTAURANT', 'HOTEL', 'CANTEEN', 'CATERING', 'FOOD_PROCESSING', 'SUPERMARKET'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Company, Address, Contact..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono w-full sm:w-72"
          />
        </div>
      </div>

      {/* Producers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducers.map(prod => (
          <div
            key={prod.producer_id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4 relative group flex flex-col justify-between"
          >
            <div>
              {/* Header & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getCategoryIcon(prod.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {prod.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {prod.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setQrModalProducer(prod)}
                  title="View Cryptographic QR Bin Tag"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 transition"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Location & Contacts */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{prod.location_address}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{prod.contact_person}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{prod.contact_email}</span>
                </div>
              </div>

              {/* Waste Stats */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500">Est. Daily Mass</span>
                  <div className="text-sm font-bold text-white mt-0.5">{prod.avg_daily_waste_kg} kg/day</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500">Total GET Tokens</span>
                  <div className="text-sm font-bold text-purple-400 mt-0.5">{prod.total_green_tokens_earned.toFixed(1)} GET</div>
                </div>
              </div>
            </div>

            {/* Quick Action to Log Batch */}
            <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 truncate">
                ID: {prod.producer_id}
              </span>
              {onSelectProducerForAudit && (
                <button
                  onClick={() => onSelectProducerForAudit(prod.name, prod.category)}
                  className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold transition"
                >
                  Audit Food Waste &rarr;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Producer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl border border-emerald-500/40 p-6 sm:p-8 max-w-xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-mono">
                    Onboard Commercial Food Producer
                  </h2>
                  <p className="text-xs text-slate-400">Register restaurant or food company to BioWaste Neural-Grid</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Company Name */}
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1">Company / Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saffron Bistro & Kitchens"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-slate-300 block mb-1">Business Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="RESTAURANT">Commercial Restaurant</option>
                    <option value="HOTEL">Luxury Hotel & Resort</option>
                    <option value="CANTEEN">Corporate / University Canteen</option>
                    <option value="CATERING">Industrial Catering Facility</option>
                    <option value="FOOD_PROCESSING">Food Processing Factory</option>
                    <option value="SUPERMARKET">Supermarket / Retail Food Hub</option>
                  </select>
                </div>

                {/* Waste Profile */}
                <div>
                  <label className="text-slate-300 block mb-1">Primary Feedstock Stream</label>
                  <select
                    value={form.primary_waste_type}
                    onChange={e => setForm({ ...form, primary_waste_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="MIXED_COOKED">Mixed Cooked Kitchen Plate Scrap (0.25 m³/kg)</option>
                    <option value="FOG_GREASE">High FOG / Grease Trap (0.85 m³/kg)</option>
                    <option value="MEAT_PROTEINS">Meat / Butchery Proteins (0.49 m³/kg)</option>
                    <option value="CARBS_BAKERY">Bakery / Grain Starches (0.37 m³/kg)</option>
                    <option value="RAW_GREENS">Salad Bar / Raw Fruit Peels (0.18 m³/kg)</option>
                  </select>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="text-slate-300 block mb-1">Contact Person / Head Chef</label>
                  <input
                    type="text"
                    required
                    placeholder="Chef / Manager Name"
                    value={form.contact_person}
                    onChange={e => setForm({ ...form, contact_person: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="text-slate-300 block mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={form.contact_email}
                    onChange={e => setForm({ ...form, contact_email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+65 6789 0000"
                    value={form.contact_phone}
                    onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Daily Waste Kg */}
                <div>
                  <label className="text-slate-300 block mb-1">Est. Daily Waste (kg)</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={form.avg_daily_waste_kg}
                    onChange={e => setForm({ ...form, avg_daily_waste_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Location Address */}
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1">Kitchen / Facility Location Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Marina Boulevard, Kitchen Loading Bay B"
                    value={form.location_address}
                    onChange={e => setForm({ ...form, location_address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Assigned Digestion Facility */}
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1">Target Biogas Anaerobic Facility</label>
                  <select
                    value={form.assigned_biogas_facility}
                    onChange={e => setForm({ ...form, assigned_biogas_facility: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="BioPower AD Mega-Facility 01 (East Hub)">BioPower AD Mega-Facility 01 (East Hub - 150 Tons/Day)</option>
                    <option value="EcoGrid Anaerobic Center (West Sector)">EcoGrid Anaerobic Center (West Sector - 90 Tons/Day)</option>
                  </select>
                </div>

              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl hover:opacity-90 shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Issue Producer Tag</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Bin Tag Modal */}
      {qrModalProducer && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl border border-emerald-500/40 p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold font-mono text-emerald-400">PRODUCER BIN QR TAG</span>
              <button onClick={() => setQrModalProducer(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            {/* Generated QR Mock SVG */}
            <div className="p-4 bg-white rounded-xl inline-block shadow-xl">
              <div className="w-48 h-48 bg-slate-950 rounded-lg p-2 flex flex-col items-center justify-center text-emerald-400 font-mono text-xs">
                <QrCode className="w-32 h-32 text-emerald-400" />
                <span className="mt-1 text-[10px] text-white">{qrModalProducer.qr_producer_tag}</span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-300 space-y-1 text-left bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Producer:</span>
                <span className="font-bold text-white">{qrModalProducer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-emerald-400">{qrModalProducer.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Plant:</span>
                <span className="text-slate-300 text-[10px] truncate">{qrModalProducer.assigned_biogas_facility}</span>
              </div>
            </div>

            <button
              onClick={() => setQrModalProducer(null)}
              className="w-full py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-mono hover:bg-slate-700"
            >
              Close Tag
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
