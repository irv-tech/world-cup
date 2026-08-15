from sqlalchemy import Column, Integer, String

from database.database import Base


class FavoriteTeam(Base):
    __tablename__ = "favorite_teams"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    username = Column(
        String(50),
        index=True,
        nullable=False,
    )

    # Platform IDs use values such as T-73.
    team_id = Column(
        String(50),
        index=True,
        nullable=False,
    )

    team_name = Column(
        String(100),
        nullable=False,
    )

    team_code = Column(
        String(10),
        nullable=True,
    )

    team_crest = Column(
        String(500),
        nullable=True,
    )