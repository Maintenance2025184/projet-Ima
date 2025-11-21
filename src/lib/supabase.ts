import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'technician' | 'requester';
  created_at: string;
};

export type Location = {
  id: string;
  name: string;
  type: 'building' | 'workshop' | 'warehouse' | 'other';
  description: string;
  created_at: string;
};

export type Equipment = {
  id: string;
  name: string;
  reference: string;
  location_id: string | null;
  type: 'machine' | 'hvac' | 'electrical' | 'plumbing' | 'other';
  status: 'operational' | 'under_maintenance' | 'out_of_service';
  installation_date: string | null;
  last_maintenance: string | null;
  created_at: string;
};

export type Intervention = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  category: 'preventive' | 'corrective' | 'improvement';
  equipment_id: string | null;
  location_id: string | null;
  requester_id: string | null;
  technician_id: string | null;
  estimated_duration: number;
  actual_duration: number;
  progress_percentage: number;
  requested_date: string;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InterventionUpdate = {
  id: string;
  intervention_id: string;
  user_id: string | null;
  status: string | null;
  progress_percentage: number | null;
  comment: string;
  time_spent: number;
  created_at: string;
};
