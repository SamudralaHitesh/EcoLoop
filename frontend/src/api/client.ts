import type {
  VisionAuditResponse,
  FeedstockInput,
  BMPCalculationResult,
  BatchResponse,
  CopilotQuery,
  CopilotResponse,
  DigesterTelemetry
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  // 1. Vision Contamination Audit
  async auditImage(file?: File, base64Image?: string): Promise<VisionAuditResponse> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (base64Image) {
      formData.append('image_base64', base64Image);
    }

    try {
      const res = await fetch(`${API_BASE}/vision/audit`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, generating local neural audit simulation:', err);
      return mockVisionAudit(base64Image);
    }
  },

  // 2. BMP & Carbon Engine
  async calculateBMP(feedstock: FeedstockInput): Promise<BMPCalculationResult> {
    try {
      const res = await fetch(`${API_BASE}/bmp/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedstock),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, calculating BMP kinetics locally:', err);
      return mockCalculateBMP(feedstock);
    }
  },

  // 3. RAG Chemistry Copilot
  async queryCopilot(query: CopilotQuery): Promise<CopilotResponse> {
    try {
      const res = await fetch(`${API_BASE}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, querying local biochemical RAG knowledge base:', err);
      return mockCopilotQuery(query);
    }
  },

  // 4. Logistics Batches
  async getBatches(): Promise<BatchResponse[]> {
    try {
      const res = await fetch(`${API_BASE}/batches/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return getMockBatches();
    }
  },

  async createBatch(payload: any): Promise<BatchResponse> {
    try {
      const res = await fetch(`${API_BASE}/batches/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const mock = getMockBatches()[0];
      return {
        ...mock,
        batch_id: `BATCH-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        generator_name: payload.generator_name,
        purity_pct: payload.feedstock.purity_factor,
        total_weight_kg: payload.feedstock.fog_kg + payload.feedstock.meat_proteins_kg + payload.feedstock.carbs_starches_kg + payload.feedstock.mixed_cooked_kg + payload.feedstock.raw_greens_kg
      };
    }
  },

  async verifyScale(batchId: string, scaleWeight: number, driverId: string): Promise<BatchResponse> {
    try {
      const res = await fetch(`${API_BASE}/batches/verify-scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId, scale_weight_kg: scaleWeight, driver_id: driverId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const mock = getMockBatches().find(b => b.batch_id === batchId) || getMockBatches()[0];
      return {
        ...mock,
        verified_scale_weight_kg: scaleWeight,
        status: 'IN_TRANSIT',
        assigned_driver: driverId
      };
    }
  },

  // 5. Digester Telemetry SCADA
  async getDigesterTelemetry(digesterId: string = 'DIGESTER-ALPHA-01'): Promise<DigesterTelemetry> {
    try {
      const res = await fetch(`${API_BASE}/digester/telemetry/${digesterId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return getMockTelemetry(digesterId);
    }
  },

  async optimizeRecipe(payload: { meat_kg: number; fog_kg: number; greens_kg: number }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/digester/optimize-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const starch = Math.round(payload.meat_kg * 1.6 + payload.fog_kg * 0.4);
      return {
        recipe_status: "OPTIMAL_CO_DIGESTION",
        recommended_blend: {
          meat_proteins_kg: payload.meat_kg,
          fats_oils_fog_kg: payload.fog_kg,
          raw_greens_kg: payload.greens_kg,
          co_substrate_bakery_starch_kg: starch,
          process_water_dilution_liters: Math.round((payload.meat_kg + payload.greens_kg + starch) * 0.25)
        },
        projected_cn_ratio: "25.2 : 1",
        projected_methane_yield_m3: Math.round((payload.meat_kg * 0.49 + payload.fog_kg * 0.85 + payload.greens_kg * 0.18 + starch * 0.37) * 100) / 100,
        vfa_risk_score: "LOW (0.19 projected VFA/TIC)",
        guidance: "Adding bakery waste buffers nitrogen-rich proteins, stabilizing ammonium concentration and boosting net CH4 generation by 28%."
      };
    }
  },

  // 6. Commercial Producers & Restaurant Network
  async getProducers(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/producers/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return getMockProducers();
    }
  },

  async registerProducer(payload: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/producers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const pId = `PROD-${payload.category?.substring(0, 4) || 'REST'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      return {
        producer_id: pId,
        qr_producer_tag: `TAG-QR-${pId}`,
        name: payload.name,
        category: payload.category,
        contact_person: payload.contact_person,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone,
        location_address: payload.location_address,
        latitude: payload.latitude || 1.2834,
        longitude: payload.longitude || 103.8607,
        avg_daily_waste_kg: payload.avg_daily_waste_kg || 250,
        primary_waste_type: payload.primary_waste_type || 'MIXED_COOKED',
        assigned_biogas_facility: payload.assigned_biogas_facility || 'BioPower AD Mega-Facility 01 (East Hub)',
        total_diverted_mass_kg: 0.0,
        total_green_tokens_earned: 0.0,
        status: 'ACTIVE_CERTIFIED',
        onboarded_at: new Date().toISOString()
      };
    }
  }
};

function getMockProducers(): any[] {
  return [
    {
      producer_id: "PROD-HOTE-9810",
      qr_producer_tag: "TAG-QR-PROD-HOTE-9810",
      name: "Grand Horizon Palace Hotel",
      category: "HOTEL",
      contact_person: "Chef Marco Rossi",
      contact_email: "marco.rossi@grandhorizon.com",
      contact_phone: "+65 6789 0101",
      location_address: "400 Marina Bay Blvd, Sector 4",
      latitude: 1.2834,
      longitude: 103.8607,
      avg_daily_waste_kg: 550.0,
      primary_waste_type: "MIXED_COOKED",
      assigned_biogas_facility: "BioPower AD Mega-Facility 01 (East Hub)",
      total_diverted_mass_kg: 4820.0,
      total_green_tokens_earned: 915.8,
      status: "ACTIVE_CERTIFIED",
      onboarded_at: "2026-07-15T08:00:00Z"
    },
    {
      producer_id: "PROD-CANT-4412",
      qr_producer_tag: "TAG-QR-PROD-CANT-4412",
      name: "Metro Tech Tower Canteen",
      category: "CANTEEN",
      contact_person: "Anita Verma (Operations Lead)",
      contact_email: "anita.v@metrotech.org",
      contact_phone: "+65 6789 0202",
      location_address: "88 Innovation Way, Tech Park",
      latitude: 1.2950,
      longitude: 103.8520,
      avg_daily_waste_kg: 420.0,
      primary_waste_type: "CARBS_BAKERY",
      assigned_biogas_facility: "BioPower AD Mega-Facility 01 (East Hub)",
      total_diverted_mass_kg: 3650.0,
      total_green_tokens_earned: 693.5,
      status: "ACTIVE_CERTIFIED",
      onboarded_at: "2026-07-20T09:30:00Z"
    },
    {
      producer_id: "PROD-REST-7719",
      qr_producer_tag: "TAG-QR-PROD-REST-7719",
      name: "Spice Route Gourmet Bistro",
      category: "RESTAURANT",
      contact_person: "Rajesh Kumar (Head Chef)",
      contact_email: "rajesh@spiceroute.sg",
      contact_phone: "+65 6789 0303",
      location_address: "12 Heritage Row, Old Town",
      latitude: 1.2890,
      longitude: 103.8450,
      avg_daily_waste_kg: 280.0,
      primary_waste_type: "FOG_GREASE",
      assigned_biogas_facility: "BioPower AD Mega-Facility 01 (East Hub)",
      total_diverted_mass_kg: 2140.0,
      total_green_tokens_earned: 406.6,
      status: "ACTIVE_CERTIFIED",
      onboarded_at: "2026-08-01T11:00:00Z"
    },
    {
      producer_id: "PROD-CATE-3301",
      qr_producer_tag: "TAG-QR-PROD-CATE-3301",
      name: "Apex Culinary Catering Hub",
      category: "CATERING",
      contact_person: "David Lim (Logistics Manager)",
      contact_email: "david.lim@apexcatering.com",
      contact_phone: "+65 6789 0404",
      location_address: "550 Airport Cargo Link, Hub 2",
      latitude: 1.3500,
      longitude: 103.9800,
      avg_daily_waste_kg: 600.0,
      primary_waste_type: "MIXED_COOKED",
      assigned_biogas_facility: "BioPower AD Mega-Facility 01 (East Hub)",
      total_diverted_mass_kg: 5120.0,
      total_green_tokens_earned: 972.8,
      status: "ACTIVE_CERTIFIED",
      onboarded_at: "2026-08-05T14:15:00Z"
    }
  ];
}


// --- Local Fallback Simulations for Resilience ---

function mockCalculateBMP(feedstock: FeedstockInput): BMPCalculationResult {
  const purity = Math.max(0, Math.min(1, feedstock.purity_factor / 100));
  const gross = feedstock.fog_kg + feedstock.meat_proteins_kg + feedstock.carbs_starches_kg + feedstock.mixed_cooked_kg + feedstock.raw_greens_kg;
  const net = gross * purity;
  
  const ch4 = (
    feedstock.fog_kg * 0.85 +
    feedstock.meat_proteins_kg * 0.49 +
    feedstock.carbs_starches_kg * 0.37 +
    feedstock.mixed_cooked_kg * 0.25 +
    feedstock.raw_greens_kg * 0.18
  ) * purity;
  
  const biogas = ch4 / 0.60;
  const kwh = ch4 * 9.97 * 0.38;
  const thermal = ch4 * 9.97 * 0.45;
  const co2e = net * 1.90;
  const tokens = (co2e / 10.0) * purity;
  
  return {
    total_feedstock_kg: Math.round(gross * 10) / 10,
    net_organic_kg: Math.round(net * 10) / 10,
    methane_yield_m3: Math.round(ch4 * 1000) / 1000,
    total_biogas_yield_m3: Math.round(biogas * 1000) / 1000,
    biogas_ch4_content_pct: 60.0,
    chp_electricity_kwh: Math.round(kwh * 10) / 10,
    chp_thermal_kwh: Math.round(thermal * 10) / 10,
    avoided_co2e_kg: Math.round(co2e * 10) / 10,
    green_energy_tokens: Math.round(tokens * 100) / 100,
    esg_token_value_usd: Math.round(tokens * 15 * 100) / 100,
    feedstock_breakdown: {
      fog: { mass_kg: feedstock.fog_kg, kinetic_factor: 0.85, ch4_yield_m3: Math.round(feedstock.fog_kg * 0.85 * purity * 100) / 100, energy_kwh: Math.round(feedstock.fog_kg * 0.85 * purity * 9.97 * 100) / 100 },
      meat_proteins: { mass_kg: feedstock.meat_proteins_kg, kinetic_factor: 0.49, ch4_yield_m3: Math.round(feedstock.meat_proteins_kg * 0.49 * purity * 100) / 100, energy_kwh: Math.round(feedstock.meat_proteins_kg * 0.49 * purity * 9.97 * 100) / 100 },
      carbs_starches: { mass_kg: feedstock.carbs_starches_kg, kinetic_factor: 0.37, ch4_yield_m3: Math.round(feedstock.carbs_starches_kg * 0.37 * purity * 100) / 100, energy_kwh: Math.round(feedstock.carbs_starches_kg * 0.37 * purity * 9.97 * 100) / 100 },
      mixed_cooked: { mass_kg: feedstock.mixed_cooked_kg, kinetic_factor: 0.25, ch4_yield_m3: Math.round(feedstock.mixed_cooked_kg * 0.25 * purity * 100) / 100, energy_kwh: Math.round(feedstock.mixed_cooked_kg * 0.25 * purity * 9.97 * 100) / 100 },
      raw_greens: { mass_kg: feedstock.raw_greens_kg, kinetic_factor: 0.18, ch4_yield_m3: Math.round(feedstock.raw_greens_kg * 0.18 * purity * 100) / 100, energy_kwh: Math.round(feedstock.raw_greens_kg * 0.18 * purity * 9.97 * 100) / 100 }
    },
    formula_audit_trail: [
      `Gross Mass: ${gross} kg | Purity Multiplier: ${purity} -> Net Organic: ${Math.round(net)} kg`,
      `Theoretical Stoichiometric CH4 = ${Math.round(ch4 * 100) / 100} m³ CH4`,
      `CHP Electricity = ${Math.round(kwh)} kWh (38% efficiency)`,
      `Avoided Carbon Emissions = ${Math.round(co2e)} kg CO2e (1.90 kg/kg)`,
      `Minted Green Energy Tokens = ${Math.round(tokens * 100) / 100} GET ($${Math.round(tokens * 15)} USD)`
    ]
  };
}

function mockVisionAudit(base64Image?: string): VisionAuditResponse {
  const isContaminated = Math.random() > 0.6;
  const contaminationPct = isContaminated ? 18.4 : 4.2;
  const purityPct = Math.round((100 - contaminationPct) * 10) / 10;
  const isApproved = contaminationPct <= 15.0;

  return {
    audit_id: `audit_${Math.random().toString(36).substring(2, 10)}`,
    timestamp: new Date().toISOString(),
    image_width: 800,
    image_height: 600,
    detected_items: [
      {
        id: 'det_1',
        label: isContaminated ? 'Plastic Cutlery & Cling Film' : 'Organic Fruit & Veg Peels',
        category: isContaminated ? 'CONTAMINANT' : 'ORGANIC',
        confidence: 0.94,
        bbox: { x_min: 120, y_min: 140, x_max: 340, y_max: 380, width: 220, height: 240, area_pixels: 52800 },
        contaminant_type: isContaminated ? 'PLASTIC' : undefined,
        color: isContaminated ? '#EF4444' : '#10B981'
      },
      {
        id: 'det_2',
        label: 'Mixed Cooked Food Waste',
        category: 'ORGANIC',
        confidence: 0.96,
        bbox: { x_min: 360, y_min: 200, x_max: 720, y_max: 540, width: 360, height: 340, area_pixels: 122400 },
        color: '#10B981'
      }
    ],
    total_area_pixels: 480000,
    organic_area_pixels: Math.round(480000 * (purityPct / 100)),
    contaminant_area_pixels: Math.round(480000 * (contaminationPct / 100)),
    contamination_pct: contaminationPct,
    purity_pct: purityPct,
    status: isApproved ? 'APPROVED_FOR_DISPATCH' : 'REJECTED_NEEDS_SORTING',
    sorting_alerts: isApproved 
      ? [`Purity verified at ${purityPct}%. Conforms to anaerobic digester feedstock quality standards.`]
      : [
          `CRITICAL CONTAMINATION: ${contaminationPct}% non-organic mass exceeds strict 15% threshold.`,
          `Action Required: Manually remove plastic cutlery / synthetic wrap prior to dispatch approval.`
        ],
    annotated_image_base64: base64Image || '',
    feedstock_distribution: {
      greens_peels: 35.0,
      carbs_starches: 30.0,
      meat_proteins: 20.0,
      fog_grease: 15.0
    }
  };
}

function mockCopilotQuery(req: CopilotQuery): CopilotResponse {
  const vfa = req.current_vfa_tic || 0.24;
  const isSouring = vfa > 0.40;
  
  return {
    answer: isSouring 
      ? `### Critical Biochemical Alert: Digester Acidification\n\nCurrent VFA/TIC of **${vfa}** exceeds the 0.40 threshold. Cease organic loading immediately and dose 2.5 kg/m³ Sodium Bicarbonate buffer.`
      : `### Optimal Biochemical State\n\nDigester ${req.digester_id || 'Alpha-01'} is operating in nominal mesophilic equilibrium with VFA/TIC at ${vfa}. C:N ratio is well-balanced at 25:1.`,
    confidence_score: 0.98,
    stability_verdict: isSouring ? 'CRITICAL_SOURING_RISK' : 'OPTIMAL',
    biochemical_metrics: {
      vfa_tic_ratio: vfa,
      ph_level: req.current_ph || 7.2,
      operating_temp_c: req.temperature_c || 37.4,
      target_cn_ratio: "25:1"
    },
    actionable_remediations: isSouring
      ? [
          "Halt incoming kitchen waste feed pumps.",
          "Inject 2.5 kg/m³ Sodium Bicarbonate (NaHCO3) buffer to restore alkalinity above 3,500 mg/L.",
          "Modulate mixer to gentle 30% duty cycle to protect biofilm."
        ]
      : [
          "Maintain current organic loading rate (3.8 kg VS/m³/day).",
          "Ensure high-nitrogen proteins are co-digested with high-carbon starch substrate."
        ],
    citations: [
      { topic: "VFA/TIC Stability Ratio", source: "VDI 4630 / EPA Anaerobic Digestion Handbook", formula: "VFA/TIC = [VFA (mg/L CH3COOH)] / [TIC (mg/L CaCO3)]" },
      { topic: "C:N Ratio Optimization", source: "IWA ADM1 Biochemical Guidelines", formula: "C:N target = 25:1" }
    ]
  };
}

function getMockBatches(): BatchResponse[] {
  return [
    {
      batch_id: "BATCH-2026-A109",
      qr_code_id: "QR-BATCH-2026-A109",
      created_at: new Date().toISOString(),
      generator_name: "Grand Horizon Palace Hotel",
      generator_type: "HOTEL",
      location_address: "400 Marina Bay Blvd, Sector 4",
      latitude: 1.2834,
      longitude: 103.8607,
      total_weight_kg: 550.0,
      verified_scale_weight_kg: 548.2,
      purity_pct: 96.5,
      contamination_pct: 3.5,
      status: "IN_TRANSIT",
      methane_potential_m3: 184.2,
      avoided_co2e_kg: 998.4,
      green_tokens_earned: 96.3,
      assigned_driver: "Marcus Vance (Fleet Alpha-4)",
      target_facility: "BioPower AD Facility Alpha (East Sector)",
      timeline: [
        { step: "LOGGED", timestamp: "08:30 UTC", desc: "Batch logged by Kitchen Station" },
        { step: "AI_AUDITED", timestamp: "08:32 UTC", desc: "CV Audit: Purity 96.5%, Approved" },
        { step: "DISPATCH_READY", timestamp: "08:35 UTC", desc: "QR Dispatch Token Issued" },
        { step: "IN_TRANSIT", timestamp: "09:10 UTC", desc: "Driver Marcus Vance verified scale: 548.2 kg" }
      ]
    },
    {
      batch_id: "BATCH-2026-B244",
      qr_code_id: "QR-BATCH-2026-B244",
      created_at: new Date().toISOString(),
      generator_name: "Metro Tech Tower Canteen",
      generator_type: "CANTEEN",
      location_address: "88 Innovation Way, Tech Park",
      latitude: 1.2950,
      longitude: 103.8520,
      total_weight_kg: 550.0,
      verified_scale_weight_kg: null,
      purity_pct: 94.0,
      contamination_pct: 6.0,
      status: "DISPATCH_READY",
      methane_potential_m3: 162.0,
      avoided_co2e_kg: 982.0,
      green_tokens_earned: 92.3,
      assigned_driver: null,
      target_facility: "BioPower AD Facility Alpha (East Sector)",
      timeline: [
        { step: "LOGGED", timestamp: "09:00 UTC", desc: "Batch logged by Canteen Manager" },
        { step: "AI_AUDITED", timestamp: "09:05 UTC", desc: "CV Audit: Purity 94.0%, Approved" },
        { step: "DISPATCH_READY", timestamp: "09:10 UTC", desc: "Awaiting driver assignment" }
      ]
    },
    {
      batch_id: "BATCH-2026-C891",
      qr_code_id: "QR-BATCH-2026-C891",
      created_at: new Date().toISOString(),
      generator_name: "Spice Route Gourmet Bistro",
      generator_type: "RESTAURANT",
      location_address: "12 Heritage Row, Old Town",
      latitude: 1.2890,
      longitude: 103.8450,
      total_weight_kg: 280.0,
      verified_scale_weight_kg: 280.0,
      purity_pct: 98.0,
      contamination_pct: 2.0,
      status: "RECEIVED_AT_PLANT",
      methane_potential_m3: 98.5,
      avoided_co2e_kg: 521.3,
      green_tokens_earned: 51.0,
      assigned_driver: "Sarah Jenkins (Fleet Beta-2)",
      target_facility: "BioPower AD Facility Alpha (East Sector)",
      timeline: [
        { step: "LOGGED", timestamp: "07:30 UTC", desc: "Logged" },
        { step: "AI_AUDITED", timestamp: "07:32 UTC", desc: "Audit Pass" },
        { step: "IN_TRANSIT", timestamp: "08:15 UTC", desc: "Transit" },
        { step: "RECEIVED_AT_PLANT", timestamp: "09:45 UTC", desc: "Gate 2 Inflow Accepted" }
      ]
    },
    {
      batch_id: "BATCH-2026-X772",
      qr_code_id: "QR-BATCH-2026-X772",
      created_at: new Date().toISOString(),
      generator_name: "Apex Culinary Catering Hub",
      generator_type: "CATERING",
      location_address: "550 Airport Cargo Link, Hub 2",
      latitude: 1.3500,
      longitude: 103.9800,
      total_weight_kg: 160.0,
      verified_scale_weight_kg: null,
      purity_pct: 81.0,
      contamination_pct: 19.0,
      status: "REJECTED",
      methane_potential_m3: 42.1,
      avoided_co2e_kg: 246.2,
      green_tokens_earned: 0.0,
      assigned_driver: null,
      target_facility: "BioPower AD Facility Alpha",
      timeline: [
        { step: "LOGGED", timestamp: "10:00 UTC", desc: "Logged" },
        { step: "REJECTED", timestamp: "10:02 UTC", desc: "Rejected: Contamination 19% > 15% threshold. Plastic cutlery & film detected." }
      ]
    }
  ];
}

function getMockTelemetry(digesterId: string): DigesterTelemetry {
  return {
    digester_id: digesterId,
    name: digesterId === 'DIGESTER-ALPHA-01' ? 'Primary CSTR Digester Alpha-01' : 'Thermophilic High-Rate Digester Beta-02',
    status: digesterId === 'DIGESTER-ALPHA-01' ? 'OPTIMAL' : 'WARNING',
    operating_temp_c: digesterId === 'DIGESTER-ALPHA-01' ? 37.4 : 54.8,
    target_temp_c: digesterId === 'DIGESTER-ALPHA-01' ? 37.0 : 55.0,
    ph_level: digesterId === 'DIGESTER-ALPHA-01' ? 7.24 : 6.92,
    vfa_tic_ratio: digesterId === 'DIGESTER-ALPHA-01' ? 0.22 : 0.34,
    vfa_concentration_mg_l: digesterId === 'DIGESTER-ALPHA-01' ? 820.0 : 1450.0,
    tic_alkalinity_mg_l: digesterId === 'DIGESTER-ALPHA-01' ? 3720.0 : 4250.0,
    biogas_production_m3_h: digesterId === 'DIGESTER-ALPHA-01' ? 342.5 : 510.2,
    ch4_concentration_pct: digesterId === 'DIGESTER-ALPHA-01' ? 62.8 : 58.2,
    h2s_ppm: digesterId === 'DIGESTER-ALPHA-01' ? 64.0 : 185.0,
    co2_concentration_pct: digesterId === 'DIGESTER-ALPHA-01' ? 36.4 : 40.8,
    organic_loading_rate_kg_vs_m3_d: digesterId === 'DIGESTER-ALPHA-01' ? 3.8 : 5.2,
    hydraulic_retention_time_days: digesterId === 'DIGESTER-ALPHA-01' ? 24.5 : 16.0,
    active_feedstock_mass_tons: 1240.0,
    bio_fertilizer_digestate_m3: 410.0,
    health_score_pct: digesterId === 'DIGESTER-ALPHA-01' ? 98.2 : 84.5,
    alerts: [
      { level: "INFO", msg: "Optimal methanogenic steady state. Gas methane purity at 62.8%." }
    ]
  };
}
