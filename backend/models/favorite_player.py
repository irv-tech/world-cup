from sqlalchemy import Column, Integer, String
from database.database import Base

class FavoritePlayer(Base): 
    __tablename__ = "favorite_players"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    player_id = Column(Integer, index=True)
    player_name = Column(String)
    team_name = Column(String)
    position = Column(String)
    nationality = Column(String)