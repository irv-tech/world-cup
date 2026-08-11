# World Cup Cloud Platform

## Overview

A full-stack World Cup web application built with React and FastAPI and deployed on Microsoft Azure.

The application provides World Cup team, player, and match data while supporting user registration, JWT-based authentication, protected dashboards, and persistent favorite teams and players.

The project demonstrates a complete cloud deployment architecture using Azure Static Web Apps, Azure Container Apps, Azure Container Registry, and Azure SQL Database.

## Features

- World Cup team directory
- Player profiles and statistics
- Historical World Cup match results and scores
- Country flags and team information
- User registration and login
- JWT authentication
- Protected user dashboard
- Favorite teams
- Favorite players
- Persistent user data stored in Azure SQL Database
- FastAPI backend proxy for external football data
- REST API architecture
- Dockerized backend
- Azure-hosted frontend and backend
- Secret and environment-variable management
- Git/GitHub source control
- Automated frontend deployment with GitHub Actions

## Tech Stack

### Frontend

- React
- JavaScript
- Vite
- React Router

### Backend

- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- Passlib / bcrypt
- pyodbc
- Microsoft ODBC Driver 18 for SQL Server

### Cloud & DevOps

- Microsoft Azure
- Azure Static Web Apps
- Azure Container Apps
- Azure Container Registry
- Azure SQL Database
- Docker
- GitHub Actions
- Git
- GitHub

### Database

Production:

- Azure SQL Database
- SQLAlchemy ORM
- pyodbc

Local fallback:

- SQLite

## Azure Architecture

The application uses separate frontend, backend, container registry, database, and secret-management layers.

```text
                     User Browser
                          |
                          v
                Azure Static Web Apps
                   React + Vite
                          |
                          | HTTPS / REST API
                          v
                 Azure Container Apps
                     FastAPI API
                     /         \
                    /           \
                   v             v
          Azure SQL Database   Football Data API
          ------------------
          users
          favorite_teams
          favorite_players

                     ^
                     |
             Container Images
                     |
           Azure Container Registry
                     ^
                     |
                   Docker
```

## Application Architecture

The React frontend is hosted using Azure Static Web Apps.

The frontend communicates with the FastAPI backend through REST API requests.

The FastAPI backend runs as a Docker container in Azure Container Apps. Backend container images are versioned and stored in Azure Container Registry.

SQLAlchemy provides the application's ORM layer. In production, SQLAlchemy connects to Azure SQL Database through `pyodbc` and Microsoft ODBC Driver 18 for SQL Server.

Azure SQL stores persistent application data including:

- User accounts
- Favorite teams
- Favorite players

The backend also communicates with an external football API to retrieve World Cup data.

## Security

The application uses JWT authentication for protected API endpoints and dashboard functionality.

Sensitive configuration is not stored in source control.

Azure Container Apps secrets are used for sensitive values including:

- Football API key
- JWT secret key
- Azure SQL password

These secrets are exposed to the application through environment-variable references at runtime.

Non-sensitive runtime configuration is also managed through environment variables.

Local `.env` files containing credentials are excluded from Git.

Azure SQL network firewall rules restrict database connectivity.

## Deployment Workflow

### Frontend

```text
Local Development
      |
      v
     Git
      |
      v
    GitHub
      |
      v
GitHub Actions
      |
      v
Azure Static Web Apps
```

Frontend changes pushed to GitHub are automatically built and deployed to Azure Static Web Apps through GitHub Actions.

### Backend

```text
FastAPI Source Code
       |
       v
 Docker Image Build
       |
       v
Azure Container Registry
       |
       v
Azure Container Apps Revision
       |
       v
Azure SQL Database
```

Backend deployment includes:

1. Develop and test changes locally.
2. Commit changes using Git.
3. Push source code to GitHub.
4. Build a versioned Docker image.
5. Push the image to Azure Container Registry.
6. Create a new Azure Container Apps revision.
7. Inject secrets and environment configuration at runtime.
8. Validate the new revision and application logs.
9. Verify production API and database functionality.

## Database Architecture

The backend uses SQLAlchemy models for application data.

Production database tables include:

```text
users
favorite_teams
favorite_players
```

The production application connects to Azure SQL using:

```text
FastAPI
   |
   v
SQLAlchemy
   |
   v
pyodbc
   |
   v
Microsoft ODBC Driver 18
   |
   v
Azure SQL Database
```

SQLite can be used as a local fallback when Azure SQL environment variables are not configured.

## Local Development

### Backend

Navigate to the backend directory:

```powershell
cd backend
```

Activate the Python virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Start FastAPI:

```powershell
python -m uvicorn main:app --reload
```

FastAPI will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server will display the local frontend URL in the terminal.

## Screenshots

Project screenshots can include:

- Teams page
- Players page
- Matches page
- Login page
- User dashboard

Screenshots are stored in:

```text
screenshots/
```

## Cloud Engineering Skills Demonstrated

This project demonstrates hands-on experience with:

- Azure application deployment
- Azure Container Apps
- Azure Container Registry
- Azure SQL Database
- Azure Static Web Apps
- Docker containerization
- Container image versioning
- REST API development
- Database connectivity
- SQLAlchemy ORM
- ODBC database drivers
- JWT authentication
- Secret management
- Environment configuration
- Azure SQL firewall configuration
- Cloud troubleshooting
- Git version control
- GitHub Actions CI/CD
- Production validation and debugging