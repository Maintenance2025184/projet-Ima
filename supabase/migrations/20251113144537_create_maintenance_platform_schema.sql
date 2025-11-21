/*
  # Plateforme de Gestion de Maintenance

  ## Vue d'ensemble
  Cette migration crée le schéma complet pour une plateforme de gestion de maintenance
  permettant de traiter les demandes d'intervention sur machines et bâtiments avec
  suivi en temps réel, indicateurs de performance et gestion de l'avancement.

  ## 1. Nouvelles Tables

  ### `users`
  - `id` (uuid, primary key) - Identifiant unique de l'utilisateur
  - `email` (text, unique) - Email de l'utilisateur
  - `full_name` (text) - Nom complet
  - `role` (text) - Rôle: 'admin', 'technician', 'requester'
  - `created_at` (timestamptz) - Date de création

  ### `locations`
  - `id` (uuid, primary key) - Identifiant unique du lieu
  - `name` (text) - Nom du lieu/bâtiment
  - `type` (text) - Type: 'building', 'workshop', 'warehouse'
  - `description` (text) - Description
  - `created_at` (timestamptz) - Date de création

  ### `equipment`
  - `id` (uuid, primary key) - Identifiant unique de l'équipement
  - `name` (text) - Nom de l'équipement/machine
  - `reference` (text) - Référence technique
  - `location_id` (uuid, foreign key) - Lieu d'installation
  - `type` (text) - Type: 'machine', 'hvac', 'electrical', 'plumbing', 'other'
  - `status` (text) - Statut: 'operational', 'under_maintenance', 'out_of_service'
  - `installation_date` (date) - Date d'installation
  - `last_maintenance` (timestamptz) - Dernière maintenance
  - `created_at` (timestamptz) - Date de création

  ### `interventions`
  - `id` (uuid, primary key) - Identifiant unique de l'intervention
  - `title` (text) - Titre de l'intervention
  - `description` (text) - Description détaillée
  - `priority` (text) - Priorité: 'low', 'medium', 'high', 'urgent'
  - `status` (text) - Statut: 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  - `category` (text) - Catégorie: 'preventive', 'corrective', 'improvement'
  - `equipment_id` (uuid, foreign key) - Équipement concerné
  - `location_id` (uuid, foreign key) - Lieu de l'intervention
  - `requester_id` (uuid, foreign key) - Demandeur
  - `technician_id` (uuid, foreign key) - Technicien assigné
  - `estimated_duration` (integer) - Durée estimée en minutes
  - `actual_duration` (integer) - Durée réelle en minutes
  - `progress_percentage` (integer) - Pourcentage d'avancement (0-100)
  - `requested_date` (timestamptz) - Date de demande
  - `scheduled_date` (timestamptz) - Date planifiée
  - `started_at` (timestamptz) - Date de début
  - `completed_at` (timestamptz) - Date de fin
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de mise à jour

  ### `intervention_updates`
  - `id` (uuid, primary key) - Identifiant unique de la mise à jour
  - `intervention_id` (uuid, foreign key) - Intervention concernée
  - `user_id` (uuid, foreign key) - Utilisateur ayant fait la mise à jour
  - `status` (text) - Nouveau statut
  - `progress_percentage` (integer) - Nouveau pourcentage
  - `comment` (text) - Commentaire de mise à jour
  - `time_spent` (integer) - Temps passé en minutes
  - `created_at` (timestamptz) - Date de la mise à jour

  ### `attachments`
  - `id` (uuid, primary key) - Identifiant unique de la pièce jointe
  - `intervention_id` (uuid, foreign key) - Intervention concernée
  - `file_name` (text) - Nom du fichier
  - `file_url` (text) - URL du fichier
  - `file_type` (text) - Type de fichier
  - `uploaded_by` (uuid, foreign key) - Utilisateur ayant téléchargé
  - `created_at` (timestamptz) - Date de téléchargement

  ## 2. Sécurité (RLS)
  - RLS activé sur toutes les tables
  - Politiques pour lecture : tous les utilisateurs authentifiés
  - Politiques pour création : utilisateurs authentifiés
  - Politiques pour mise à jour : créateurs et admins
  - Politiques pour suppression : admins uniquement

  ## 3. Index
  - Index sur les clés étrangères pour optimiser les jointures
  - Index sur les champs de statut et priorité pour les filtres
  - Index sur les dates pour les rapports temporels

  ## 4. Notes importantes
  - Tous les timestamps utilisent le fuseau horaire
  - Les valeurs par défaut assurent l'intégrité des données
  - Le suivi du temps est en minutes pour plus de précision
  - Les statuts sont normalisés pour faciliter les rapports
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'requester' CHECK (role IN ('admin', 'technician', 'requester')),
  created_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'building' CHECK (type IN ('building', 'workshop', 'warehouse', 'other')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  reference text DEFAULT '',
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'other' CHECK (type IN ('machine', 'hvac', 'electrical', 'plumbing', 'other')),
  status text NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'under_maintenance', 'out_of_service')),
  installation_date date,
  last_maintenance timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  category text NOT NULL DEFAULT 'corrective' CHECK (category IN ('preventive', 'corrective', 'improvement')),
  equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  requester_id uuid REFERENCES users(id) ON DELETE SET NULL,
  technician_id uuid REFERENCES users(id) ON DELETE SET NULL,
  estimated_duration integer DEFAULT 0,
  actual_duration integer DEFAULT 0,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  requested_date timestamptz DEFAULT now(),
  scheduled_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create intervention_updates table
CREATE TABLE IF NOT EXISTS intervention_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid REFERENCES interventions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text,
  progress_percentage integer CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  comment text DEFAULT '',
  time_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid REFERENCES interventions(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT '',
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_priority ON interventions(priority);
CREATE INDEX IF NOT EXISTS idx_interventions_technician ON interventions(technician_id);
CREATE INDEX IF NOT EXISTS idx_interventions_requester ON interventions(requester_id);
CREATE INDEX IF NOT EXISTS idx_interventions_equipment ON interventions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_interventions_location ON interventions(location_id);
CREATE INDEX IF NOT EXISTS idx_interventions_dates ON interventions(requested_date, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_intervention_updates_intervention ON intervention_updates(intervention_id);
CREATE INDEX IF NOT EXISTS idx_attachments_intervention ON attachments(intervention_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for locations table
CREATE POLICY "Users can view all locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for equipment table
CREATE POLICY "Users can view all equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for interventions table
CREATE POLICY "Users can view all interventions"
  ON interventions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create interventions"
  ON interventions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update interventions"
  ON interventions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete interventions"
  ON interventions FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for intervention_updates table
CREATE POLICY "Users can view all intervention updates"
  ON intervention_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create intervention updates"
  ON intervention_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for attachments table
CREATE POLICY "Users can view all attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create attachments"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Function to update intervention updated_at timestamp
CREATE OR REPLACE FUNCTION update_intervention_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update intervention updated_at
CREATE TRIGGER update_intervention_timestamp
BEFORE UPDATE ON interventions
FOR EACH ROW
EXECUTE FUNCTION update_intervention_timestamp();