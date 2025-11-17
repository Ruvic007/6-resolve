<<<<<<< HEAD
=======
from sqlalchemy.orm import declarative_base, Session
from sqlalchemy import Column, Integer, SmallInteger, String, BigInteger, Float, DateTime, Boolean, Text, create_engine, select
from dotenv import load_dotenv
>>>>>>> 57b8b402e4e216a720563603875ab8f5e9c0516b
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

<<<<<<< HEAD
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
=======
# Fetch variables
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")

# Construct the SQLAlchemy connection string
DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)


Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"
    __table_args__ = {"schema": "public"}

    id = Column(BigInteger, primary_key=True)
    created_at = Column(DateTime(timezone=True))
    nom = Column(String)
    code_postal = Column(Integer)
    secteur_activite = Column(String)
    type_batiment = Column(String)
    annee_construction = Column(SmallInteger)
    surface_locaux = Column(Float)
    surface_toit = Column(Float)
    horaire_ouverture = Column(Text)
    type_facture = Column(String)
    utilisation_energie_renouvelable = Column(Boolean)
    type_energie_renouvelable = Column(String)
    monitoring_consommation = Column(Boolean)
    

# Test récupération
with Session(engine) as session:
    companies = session.execute(select(Company)).scalars().all()
    for c in companies:
        print(c.id, c.created_at, c.nom, 
              c.code_postal, c.secteur_activite, c.type_batiment, 
              c.annee_construction, c.surface_locaux, c.surface_toit, 
              c.horaire_ouverture, c.type_facture, c.utilisation_energie_renouvelable, 
              c.type_energie_renouvelable, c.monitoring_consommation)
>>>>>>> 57b8b402e4e216a720563603875ab8f5e9c0516b
