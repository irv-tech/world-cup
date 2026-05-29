from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from models.favorite import FavoriteTeam
from utils.security import get_current_username

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.post("/teams")
def add_favorite_team(
    team: dict,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username)
):
    existing_favorite = db.query(FavoriteTeam).filter(
        FavoriteTeam.username == username,
        FavoriteTeam.team_id == team.get("id")
    ).first()

    if existing_favorite:
        raise HTTPException(
            status_code=400,
            detail="Team already favorited"
        )

    favorite = FavoriteTeam(
        username=username,
        team_id=team.get("id"),
        team_name=team.get("name"),
        team_code=team.get("tla"),
        team_crest=team.get("crest")
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return {"message": "Team added to favorites"}

@router.get("/teams")
def get_favorite_teams(
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username)
):
    favorites = db.query(FavoriteTeam).filter(
        FavoriteTeam.username == username
    ).all()

    return favorites