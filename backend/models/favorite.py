from sqlalchemy import Column, Integer, String

from database.database import Base

class FavoriteTeam(Base):
    __tablename__ = "favorite_teams"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    team_id = Column(Integer, index=True)
    team_name = Column(String)
    team_code = Column(String)
    team_crest = Column(String)