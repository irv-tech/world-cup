from sqlalchemy import Column, Integer, String

from database.database import Base


class FavoritePlayer(Base):
    __tablename__ = "favorite_players"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String(50),
        index=True,
        nullable=False,
    )

    player_id = Column(
        Integer,
        index=True,
        nullable=False,
    )

    player_name = Column(
        String(100),
        nullable=False,
    )

    team_name = Column(
        String(100),
        nullable=True,
    )

    position = Column(
        String(50),
        nullable=True,
    )

    nationality = Column(
        String(100),
        nullable=True,
    )