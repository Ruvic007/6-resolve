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
  horaire_ouverture text,
  type_facture character varying,
  utilisation_energie_renouvelable boolean,
  type_energie_renouvelable character varying,
  monitoring_consommation boolean,
  user_id text,
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
CREATE TABLE public.energytypes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  type_chauffage character varying NOT NULL,
  type_eclairage character varying,
  niveau_isolation character varying,
  ventilation character varying,
  autres text,
  company_id bigint,
  CONSTRAINT energytypes_pkey PRIMARY KEY (id),
  CONSTRAINT energytypes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.energyusage (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  annee smallint,
  conso_electricite_kwh real,
  conso_gaz_kwh real,
  cout_energie_euros real,
  emission_co2_kg real,
  company_id bigint,
  CONSTRAINT energyusage_pkey PRIMARY KEY (id),
  CONSTRAINT energyusage_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.simulations_pv (
  id integer NOT NULL DEFAULT nextval('simulations_pv_id_seq'::regclass),
  company_id integer,
  puissance_installee_kw numeric NOT NULL,
  surface_panneaux_m2 numeric NOT NULL,
  taux_autoconsommation numeric DEFAULT 0.70,
  tarif_rachat_kwh numeric DEFAULT 0.10,
  prix_installation_ht numeric NOT NULL,
  production_annuelle_estimee_kwh numeric,
  economies_annuelles_estimees numeric,
  reduction_co2_annuelle_kg numeric,
  roi_annees numeric,
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