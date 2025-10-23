from sqlalchemy.orm import declarative_base, Session
from sqlalchemy import Column, String, BigInteger, ForeignKey, create_engine, select
# from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

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

# If using Transaction Pooler or Session Pooler, we want to ensure we disable SQLAlchemy client side pooling -
# https://docs.sqlalchemy.org/en/20/core/pooling.html#switching-pool-implementations
# engine = create_engine(DATABASE_URL, poolclass=NullPool)

# Test the connection
'''
try:
    with engine.connect() as connection:
        print("Connection successful!")            
except Exception as e:
    print(f"Failed to connect: {e}")
'''
Base = declarative_base()

class User(Base):
    __tablename__ = "User"   # EXACT comme dans Supabase
    __table_args__ = {"schema": "public"}

    id = Column(BigInteger, primary_key=True)
    email_address = Column(String)
    password = Column(String)
    id_company = Column(BigInteger, ForeignKey("public.companies.id"))

# Test récupération
with Session(engine) as session:
    users = session.execute(select(User)).scalars().all()
    for u in users:
        print(u.id, u.email_address, u.password, u.id_company)

