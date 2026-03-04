from sqlalchemy import Column, Integer, BigInteger, String, Float, ForeignKey, DateTime, Text, SmallInteger
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
from src.database.db import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(BigInteger, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    nom = Column(String)
    code_postal = Column(Integer) 
    secteur_activite = Column(String)
    type_batiment = Column(String)
    annee_construction = Column(SmallInteger)
    surface_locaux = Column(Float)
    surface_toit = Column(Float)
    heures_par_jour = Column(Float)
    jours_semaine = Column(SmallInteger)
    user_id = Column(Text)

class Energy(Base):
    __tablename__ = "energy"

    id = Column(BigInteger, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    annee = Column(SmallInteger)
    conso_elec = Column(Float)
    conso_gaz = Column(Float)
    prix_elec = Column(Float)
    prix_gaz = Column(Float)
    pourcentage_renouvelable = Column(Float)
    type_facture = Column(String)
    type_chauffage = Column(String)
    type_eclairage = Column(String)
    niveau_isolation = Column(String)
    emission_co2_kg = Column(Float)
    company_id = Column(BigInteger, ForeignKey("companies.id"))

class AuditReport(Base):
    __tablename__ = "AuditReports"

    id = Column(BigInteger, ForeignKey("companies.id"), primary_key=True)
    created_at = Column(DateTime, server_default=func.now())
    energy_score = Column(Float)
    recommendations = Column(Text)
    benchmark = Column(Float)
    pv_simulation = Column(JSON)
    part_electricite_sur_total = Column(Float)

class SimulationPV(Base):
    __tablename__ = "simulations_pv"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    puissance_installee_kw = Column(Float, nullable=False)
    surface_panneaux_m2 = Column(Float, nullable=False)
    taux_autoconsommation = Column(Float, default=0.70)
    tarif_rachat_kwh = Column(Float, default=0.10)
    prix_installation_ht = Column(Float, nullable=False)
    production_annuelle_estimee_kwh = Column(Float)
    economies_annuelles_estimees = Column(Float)
    reduction_co2_annuelle_kg = Column(Float)
    roi_annees = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

class ThermalSimulation(Base):
    __tablename__ = "thermal_simulations"

    id = Column(BigInteger, primary_key=True, index=True)
    company_id = Column(BigInteger, ForeignKey("companies.id"), nullable=False)
    surface_m2 = Column(Float, nullable=False)
    production_kwh = Column(Float, nullable=False)
    cout_installation_estime = Column(Float)
    economies_annuelles_estimees = Column(Float)
    roi_annees = Column(Float)
    reduction_co2_kg = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())