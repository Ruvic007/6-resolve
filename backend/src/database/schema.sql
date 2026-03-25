-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.companies (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nom character varying,
  code_postal integer,
  secteur_activite character varying,
  type_batiment character varying,
  annee_construction smallint,
  surface_locaux real,
  surface_toit real,
  heures_par_jour real,
  user_id text,
  jours_semaine smallint,
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.AuditReports (
  id bigint NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  energy_score real,
  recommendations text,
  benchmark real,
  pv_simulation json,
  part_electricite_sur_total real,
  CONSTRAINT AuditReports_pkey PRIMARY KEY (id),
  CONSTRAINT AuditReports_id_fkey FOREIGN KEY (id) REFERENCES public.companies(id)
);
CREATE TABLE public.energy (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  annee smallint,
  conso_elec real,
  conso_gaz real,
  cout_gaz real,
  cout_elec real,
  company_id bigint,
  pourcentage_renouvelable real,
  type_facture character varying,
  type_chauffage character varying,
  type_eclairage character varying,
  niveau_isolation character varying,
  emission_co2_kg real,
  CONSTRAINT energy_pkey PRIMARY KEY (id),
  CONSTRAINT energyusage_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.simulations_pv (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  company_id integer,
  puissance_installee_kw real NOT NULL,
  surface_panneaux_m2 real NOT NULL,
  taux_autoconsommation real,
  tarif_rachat_kwh real,
  prix_installation_ht real NOT NULL,
  production_annuelle_estimee_kwh real,
  economies_annuelles_estimees real,
  reduction_co2_annuelle_kg real,
  roi_annees real,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT simulations_pv_pkey PRIMARY KEY (id),
  CONSTRAINT simulations_pv_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.thermal_simulations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  company_id bigint NOT NULL,
  surface_m2 double precision NOT NULL,
  production_kwh double precision NOT NULL,
  cout_installation_estime double precision,
  economies_annuelles_estimees double precision,
  roi_annees double precision,
  reduction_co2_kg double precision,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT thermal_simulations_pkey PRIMARY KEY (id),
  CONSTRAINT thermal_simulations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);