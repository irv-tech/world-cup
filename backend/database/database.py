import os

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


AZURE_SQL_SERVER = os.getenv("AZURE_SQL_SERVER")
AZURE_SQL_DATABASE = os.getenv("AZURE_SQL_DATABASE")
AZURE_SQL_USERNAME = os.getenv("AZURE_SQL_USERNAME")
AZURE_SQL_PASSWORD = os.getenv("AZURE_SQL_PASSWORD")


if all([
    AZURE_SQL_SERVER,
    AZURE_SQL_DATABASE,
    AZURE_SQL_USERNAME,
    AZURE_SQL_PASSWORD,
]):
    DATABASE_URL = URL.create(
        "mssql+pyodbc",
        username=AZURE_SQL_USERNAME,
        password=AZURE_SQL_PASSWORD,
        host=AZURE_SQL_SERVER,
        port=1433,
        database=AZURE_SQL_DATABASE,
        query={
            "driver": "ODBC Driver 18 for SQL Server",
            "Encrypt": "yes",
            "TrustServerCertificate": "no",
        },
    )

    engine = create_engine(DATABASE_URL)

else:
    DATABASE_URL = "sqlite:///./worldcup.db"

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()