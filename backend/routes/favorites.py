from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from models.favorite import FavoriteTeam
from models.favorite_player import FavoritePlayer
from utils.security import get_current_username


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"],
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
    username: str = Depends(get_current_username),
):
    team_id = team.get("id")

    if team_id is None:
        raise HTTPException(
            status_code=400,
            detail="Team ID is required",
        )

    team_id = str(team_id)

    existing_favorite = (
        db.query(FavoriteTeam)
        .filter(
            FavoriteTeam.username == username,
            FavoriteTeam.team_id == team_id,
        )
        .first()
    )

    if existing_favorite:
        raise HTTPException(
            status_code=400,
            detail="Team already favorited",
        )

    favorite = FavoriteTeam(
        username=username,
        team_id=team_id,
        team_name=team.get("name"),
        team_code=team.get("tla"),
        team_crest=team.get("crest"),
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return {
        "message": "Team added to favorites"
    }


@router.get("/teams")
def get_favorite_teams(
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    favorites = (
        db.query(FavoriteTeam)
        .filter(
            FavoriteTeam.username == username
        )
        .all()
    )

    return favorites


@router.delete("/teams/{favorite_id}")
def delete_favorite_team(
    favorite_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    favorite = (
        db.query(FavoriteTeam)
        .filter(
            FavoriteTeam.id == favorite_id,
            FavoriteTeam.username == username,
        )
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite team not found",
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Favorite team removed"
    }


@router.post("/players")
def add_favorite_player(
    player: dict,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    player_id = player.get("id")

    if player_id is None:
        raise HTTPException(
            status_code=400,
            detail="Player ID is required",
        )

    player_id = str(player_id)

    existing_favorite = (
        db.query(FavoritePlayer)
        .filter(
            FavoritePlayer.username == username,
            FavoritePlayer.player_id == player_id,
        )
        .first()
    )

    if existing_favorite:
        raise HTTPException(
            status_code=400,
            detail="Player already favorited",
        )

    favorite = FavoritePlayer(
        username=username,
        player_id=player_id,
        player_name=player.get("name"),

        # New platform frontend sends teamName.
        # Keep "team" as a fallback for old clients.
        team_name=(
            player.get("teamName")
            or player.get("team")
        ),

        position=player.get("position"),
        nationality=player.get("nationality"),
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return {
        "message": "Player added to favorites"
    }


@router.get("/players")
def get_favorite_players(
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    return (
        db.query(FavoritePlayer)
        .filter(
            FavoritePlayer.username == username
        )
        .all()
    )


@router.delete("/players/{favorite_id}")
def delete_favorite_player(
    favorite_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    favorite = (
        db.query(FavoritePlayer)
        .filter(
            FavoritePlayer.id == favorite_id,
            FavoritePlayer.username == username,
        )
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite player not found",
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Favorite player removed"
    }