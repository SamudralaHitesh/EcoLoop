export type UserRole = 'KITCHEN' | 'DRIVER' | 'PLANT_OPERATOR' | 'ADMIN';

export type BatchStatus = 
  | 'LOGGED' 
  | 'AI_AUDITED' 
  | 'DISPATCH_READY' 
  | 'IN_TRANSIT' 
  | 'RECEIVED_AT_PLANT' 
  | 'IN_DIGESTER' 
  | 'REJECTED';

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
  width: number;
  height: number;
  area_pixels: number;
}

export interface DetectedItem {
  id: string;
  label: string;
  category: 'ORGANIC' | 'CONTAMINANT';
  confidence: number;
  bbox: BoundingBox;
  contaminant_type?: string;
  color: string;
}

export interface VisionAuditResponse {
  audit_id: string;
  timestamp: string;
  image_width: number;
  image_height: number;
  detected_items: DetectedItem[];
  total_area_pixels: number;
  organic_area_pixels: number;
  contaminant_area_pixels: number;
  contamination_pct: number;
  purity_pct: number;
  status: 'APPROVED_FOR_DISPATCH' | 'REJECTED_NEEDS_SORTING';
  sorting_alerts: string[];
  annotated_image_base64: string;
  feedstock_distribution: Record<string, number>;
}

export interface FeedstockInput {
  fog_kg: number;
  meat_proteins_kg: number;
  carbs_starches_kg: number;
  mixed_cooked_kg: number;
  raw_greens_kg: number;
  purity_factor: number;
}

export interface BMPCalculationResult {
  total_feedstock_kg: number;
  net_organic_kg: number;
  methane_yield_m3: number;
  total_biogas_yield_m3: number;
  biogas_ch4_content_pct: number;
  chp_electricity_kwh: number;
  chp_thermal_kwh: number;
  avoided_co2e_kg: number;
  green_energy_tokens: number;
  esg_token_value_usd: number;
  feedstock_breakdown: Record<string, {
    mass_kg: number;
    kinetic_factor: number;
    ch4_yield_m3: number;
    energy_kwh: number;
  }>;
  formula_audit_trail: string[];
}

export interface BatchTimelineEvent {
  step: string;
  timestamp: string;
  desc: string;
}

export interface BatchResponse {
  batch_id: string;
  qr_code_id: string;
  created_at: string;
  generator_name: string;
  generator_type: string;
  location_address: string;
  latitude: number;
  longitude: number;
  total_weight_kg: number;
  verified_scale_weight_kg?: number | null;
  purity_pct: number;
  contamination_pct: number;
  status: BatchStatus;
  methane_potential_m3: number;
  avoided_co2e_kg: number;
  green_tokens_earned: number;
  assigned_driver?: string | null;
  target_facility: string;
  audit_summary?: any;
  timeline: BatchTimelineEvent[];
}

export interface CopilotQuery {
  query: string;
  digester_id?: string;
  operating_mode?: 'MESOPHILIC' | 'THERMOPHILIC';
  current_ph?: number;
  current_vfa_tic?: number;
  temperature_c?: number;
}

export interface CopilotCitation {
  topic: string;
  source: string;
  formula: string;
}

export interface CopilotResponse {
  answer: string;
  confidence_score: number;
  stability_verdict: 'OPTIMAL' | 'WARNING' | 'CRITICAL_SOURING_RISK' | 'AMMONIA_INHIBITION_RISK';
  biochemical_metrics: Record<string, any>;
  actionable_remediations: string[];
  citations: CopilotCitation[];
}

export interface DigesterTelemetry {
  digester_id: string;
  name: string;
  status: string;
  operating_temp_c: number;
  target_temp_c: number;
  ph_level: number;
  vfa_tic_ratio: number;
  vfa_concentration_mg_l: number;
  tic_alkalinity_mg_l: number;
  biogas_production_m3_h: number;
  ch4_concentration_pct: number;
  h2s_ppm: number;
  co2_concentration_pct: number;
  organic_loading_rate_kg_vs_m3_d: number;
  hydraulic_retention_time_days: number;
  active_feedstock_mass_tons: number;
  bio_fertilizer_digestate_m3: number;
  health_score_pct: number;
  alerts: Array<{ level: string; msg: string }>;
}

export interface ProducerRegistrationRequest {
  name: string;
  category: 'RESTAURANT' | 'HOTEL' | 'CANTEEN' | 'CATERING' | 'FOOD_PROCESSING' | 'SUPERMARKET';
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  location_address: string;
  latitude: number;
  longitude: number;
  avg_daily_waste_kg: number;
  primary_waste_type: 'MIXED_COOKED' | 'FOG_GREASE' | 'MEAT_PROTEINS' | 'CARBS_BAKERY' | 'RAW_GREENS';
  assigned_biogas_facility: string;
}

export interface ProducerResponse {
  producer_id: string;
  qr_producer_tag: string;
  name: string;
  category: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  location_address: string;
  latitude: number;
  longitude: number;
  avg_daily_waste_kg: number;
  primary_waste_type: string;
  assigned_biogas_facility: string;
  total_diverted_mass_kg: number;
  total_green_tokens_earned: number;
  status: string;
  onboarded_at: string;
}

