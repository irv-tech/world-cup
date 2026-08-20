# World Cup Cloud Platform

A full-stack World Cup analytics and fan platform built with React, FastAPI, Docker, and Microsoft Azure.

The project was designed as a cloud engineering portfolio application that combines historical World Cup data, 2026 tournament data, authentication, favorites, statistics, containerized backend services, and a production Azure deployment.

---

## Live Application

**Frontend:**  
[World Cup Cloud Platform](https://kind-coast-02b175c0f.7.azurestaticapps.net)

**Backend API:**  
[FastAPI Backend](https://world-cup-backend.blueisland-cd76973a.westus2.azurecontainerapps.io)

**API Documentation:**  
[FastAPI Swagger UI](https://world-cup-backend.blueisland-cd76973a.westus2.azurecontainerapps.io/docs)

---

## Project Goals

The goal of this project was to build more than a traditional frontend application.

The platform was designed to demonstrate practical experience with:

- Cloud application architecture
- Azure deployment
- Containerized backend services
- REST API development
- Authentication
- Cloud database connectivity
- Data normalization
- External API integration
- API rate-limit handling
- Git and GitHub workflow
- Production troubleshooting
- Azure resource management

---

## Features

### World Cup 2026

- 48 national teams
- 12 groups
- 104 tournament matches
- Group standings
- Qualification logic
- Best third-place team qualification
- Group-stage match results
- Round of 32
- Round of 16
- Quarterfinals
- Semifinals
- Third-place match
- Final
- Tournament awards
- Clickable team links to detailed team pages

### World Cup History

- Historical World Cup tournaments from 1930 through 2022
- Tournament hosts
- Champions
- Runners-up
- Third-place teams
- Historical group-stage formats
- Historical knockout brackets
- Tournament awards
- Golden Boot / Golden Shoe statistics
- Historical national team identities

### Teams

- National team directory
- Search
- World Cup edition filtering
- Champions-only filtering
- Sorting
- Historical country identity support
- Championship history
- Team statistics
- Tournament squads
- 2026 squad integration

### Statistics

All-time World Cup rankings for:

- Most World Cup titles
- Most tournament appearances
- Most team goals
- All-time top scorers
- Most player match appearances

### Authentication

- User registration
- Login
- JWT authentication
- Protected application routes
- Session-expiration handling
- Logout

### My World Cup

Authenticated users can:

- Save favorite teams
- Save favorite players
- Remove favorites
- View saved favorites in My World Cup
- Persist favorites in Azure SQL Database

---

## Tech Stack

### Frontend

- React
- JavaScript
- Vite
- React Router
- CSS

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
- Azure Log Analytics
- Docker
- GitHub Actions
- Git
- GitHub
- Azure CLI

### Database

#### Production

- Azure SQL Database
- SQLAlchemy ORM
- pyodbc
- Microsoft ODBC Driver 18

#### Local Development

- SQLite fallback

---

## Azure Architecture

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
                      /           \
                     /             \
                    v               v
           Azure SQL Database    World Cup Data
           ------------------    + Football API
           users
           favorite_teams
           favorite_players

                         ^
                         |
                  Container Image
                         |
              Azure Container Registry
                         ^
                         |
                       Docker
```

## Azure Resources

The production environment uses the following Azure resources:

| Resource | Azure Service | Purpose |
|---|---|---|
| `world-cup-frontend` | Azure Static Web Apps | React frontend hosting |
| `world-cup-backend` | Azure Container Apps | FastAPI backend |
| `world-cup-environment` | Container Apps Environment | Backend runtime environment |
| `worldcupregistry26` | Azure Container Registry | Docker image storage |
| `worldcup-sql` | Azure SQL Server | SQL logical server |
| `worldcupdb` | Azure SQL Database | Production application database |
| Log Analytics workspace | Azure Monitor / Log Analytics | Container logging and monitoring |

The deployment process updates existing resources rather than creating duplicate services for each release.

---

## Application Architecture

### Frontend

The React application is hosted using Azure Static Web Apps.

React Router provides client-side navigation between:

- Home
- World Cup 2026
- Teams
- Team Details
- History
- Tournament History
- Stats
- Login
- Register
- My World Cup

The frontend communicates with the FastAPI backend through REST API requests.

### Backend

The FastAPI backend provides:

- Authentication endpoints
- Favorites endpoints
- World Cup tournament data
- 2026 tournament data
- Team data
- Squad data
- Historical data
- Statistics
- External API integration

The backend is packaged as a Docker container and deployed to Azure Container Apps.

## Unified World Cup Data Model

One of the core improvements to the platform was moving from separate page-specific data sources into a unified World Cup data model.

The backend generates:

`backend/data/world_cup_platform.json`

using:

`backend/generate_world_cup_platform.py`

The unified dataset contains:

- 23 tournament editions
- 1,068 matches
- 3,028 goals
- 90 team identities
- Historical squads
- Tournament awards
- Historical team identities
- 2026 tournament data

## Historical Team Identity Handling

World Cup history includes teams whose names or national identities changed over time.

The platform preserves historical tournament identities while presenting a modern canonical team experience.

Examples include:

- Germany / West Germany / East Germany
- Russia / Soviet Union
- Serbia / Yugoslavia
- Czech Republic / Czechoslovakia

This allows the application to display the correct historical identity for a specific tournament while still connecting it to the appropriate modern team profile.

---

## 2026 Tournament Data

The platform contains a complete modeled 2026 tournament:

- Teams: 48
- Groups: 12
- Matches: 104
- Goals: 308
- Champion: Spain
- Runner-up: Argentina
- Third Place: England

Tournament awards include:

| Award | Player | Team |
|---|---|---|
| Golden Ball | Rodri | Spain |
| Golden Boot | Kylian Mbappé | France |
| Golden Glove | Unai Simón | Spain |
| Best Young Player | Pau Cubarsí | Spain |

## External API Integration

The application integrates with football-data.org for current football information.

The backend acts as a proxy so the frontend does not directly expose API credentials.

Backend responsibilities include:

- Retrieving competition teams
- Retrieving squad data
- Normalizing external team and player identifiers
- Converting external data into platform-friendly structures

## API Rate-Limit Resilience

During development, repeated requests to the external football API caused HTTP `429 Too Many Requests` responses.

Originally, the application fetched match data directly from the external service whenever the 2026 page loaded.

This created two problems:

1. API rate limits were reached.
2. Unexpected error responses caused frontend runtime failures.

To solve this, the backend now uses a local snapshot:

`backend/data/world_cup_2026_matches.json`

The backend includes snapshot handling that:

- Loads finalized 2026 match data locally
- Returns snapshot data by default
- Allows explicit refresh requests
- Saves refreshed data
- Falls back to the existing snapshot if the external API fails

The following endpoints use this architecture:

- `GET /matches`
- `GET /world-cup-2026/groups`

An explicit refresh can be requested with:

- `GET /matches?refresh=true`

This makes the production application more resilient and reduces unnecessary dependency on third-party API availability.

## 2026 Squad Integration

The direct third-party team endpoint returned HTTP `403` for the required squad workflow.

Instead, the backend retrieves all competition teams and filters the requested team locally.

The application exposes:

- `GET /teams/{team_id}/squad`

The returned squad data is normalized for the frontend.

Third-party player IDs are prefixed with `FD-` so they can coexist safely with historical player IDs.

The external API does not provide tournament jersey numbers for these squads, so unavailable jersey numbers are intentionally not fabricated.

## Authentication

The platform uses JWT authentication.

Protected API requests require an authentication token.

The frontend maintains login state and protects the My World Cup route.

Authentication behavior includes:

- Register
- Login
- JWT token storage
- Protected routes
- Token expiration handling
- Logout
- Automatic clearing of stale authentication state

## Session Expiration Handling

During testing, a stored username remained in the browser after the JWT had expired.

This created HTTP `401 Unauthorized` responses when My World Cup attempted to load favorites.

The frontend API client was updated to:

- Detect `401` responses
- Clear stale JWT tokens
- Clear stored usernames
- Dispatch an authentication-state update
- Display a clear session-expired message

This prevents the interface from appearing logged in when the authentication token is no longer valid.

## Favorites and Azure SQL

Authenticated users can save:

- Favorite teams
- Favorite players

Production favorites are stored in Azure SQL Database.

The favorites schema was updated from integer-only IDs to string-based IDs because the unified platform uses multiple identifier formats.

Examples include:

- Historical player ID: `P-14758`
- External 2026 player ID: `FD-12345`

Using string IDs allows one favorites system to support both historical and modern data.

## Database Architecture

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

Production tables include:

- `users`
- `favorite_teams`
- `favorite_players`

SQLite can be used as a local fallback when Azure SQL environment variables are not configured.

## Security

Sensitive configuration is not committed to Git.

Azure Container Apps secrets are used for:

- Football API key
- JWT secret key
- Azure SQL password

Secrets are referenced through environment variables at runtime.

Other runtime configuration includes:

- CORS origins
- JWT algorithm
- Access token expiration
- Azure SQL server
- Azure SQL database
- Azure SQL username

Local `.env` files are excluded from source control.

Azure SQL firewall and network rules restrict database connectivity.

## Docker

The FastAPI backend is containerized.

The backend Docker image includes:

- Python runtime
- FastAPI dependencies
- SQLAlchemy
- pyodbc
- Microsoft ODBC Driver 18 for SQL Server
- Uvicorn

The application runs on port `8000`.

The backend image is stored in Azure Container Registry and deployed through Azure Container Apps revisions.

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

Changes pushed to the main GitHub branch are automatically built and deployed to Azure Static Web Apps.

### Backend

```text
FastAPI Source
      |
      v
Local Docker Build
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

Backend deployment workflow:

1. Develop and test locally.
2. Run the frontend production build.
3. Commit changes with Git.
4. Push changes to GitHub.
5. Build a versioned Docker image.
6. Authenticate with Azure Container Registry.
7. Push the image to ACR.
8. Update the existing Azure Container App.
9. Verify the new Container Apps revision.
10. Test production API endpoints.
11. Validate the live frontend.

## Azure Deployment Troubleshooting

Several real deployment issues were encountered and resolved during the project.

### ACR Tasks Restriction

The initial backend deployment attempted:

```powershell
az acr build
```

Azure returned:

`TasksOperationsNotAllowed`

The deployment workflow was changed to:

```text
Local Docker Build
        |
        v
Docker Push
        |
        v
Azure Container Registry
```

## Production Verification

The production backend was validated after deployment.

**Backend URL:**  
https://world-cup-backend.blueisland-cd76973a.westus2.azurecontainerapps.io

### Backend Health

`GET /`

Result: `World Cup backend is running`

### 2026 Matches

`GET /matches`

Verified: `104 matches`

### 2026 Groups

`GET /world-cup-2026/groups`

Verified: `12 groups`

### 2026 Tournament Summary

`GET /platform/tournaments/2026`

Verified:

- year: `2026`
- matchCount: `104`
- goalCount: `308`

### Statistics

`GET /stats`

Verified successfully with historical and 2026 statistics.

## Production Frontend

**Live application:**  
https://kind-coast-02b175c0f.7.azurestaticapps.net

Final production regression testing verified:

- Home
- World Cup 2026
- Teams
- Team Details
- History
- Tournament History
- Stats
- Login
- My World Cup
- Favorite teams
- Favorite players
- Azure SQL persistence
- Logout

## Local Development

### Backend

Navigate to the backend directory:

```powershell
cd backend
```

Activate the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Run FastAPI:

```powershell
python -m uvicorn main:app --reload
```

Backend:

`http://127.0.0.1:8000`

Swagger documentation:

`http://127.0.0.1:8000/docs`

### Frontend

Navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

Production build:

```powershell
npm run build
```

---

## Project Structure

```text
world-cup/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .dockerignore
│   ├── generate_stats.py
│   ├── generate_2026_stats.py
│   ├── generate_world_cup_platform.py
│   ├── main.py
│   └── data/
│       ├── world_cup_platform.json
│       ├── world_cup_2026_matches.json
│       ├── world_cup_2026_stats.json
│       └── ...
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── ...
│
├── docker-compose.yml
└── README.md
```

## Cloud Engineering Skills Demonstrated

This project demonstrates hands-on experience with:

- Microsoft Azure
- Azure Container Apps
- Azure Container Registry
- Azure Static Web Apps
- Azure SQL Database
- Azure Log Analytics
- Docker
- Container image deployment
- Azure Container Apps revisions
- Azure CLI
- FastAPI
- REST API architecture
- JWT authentication
- SQLAlchemy ORM
- pyodbc
- Microsoft ODBC Driver 18
- Environment variables
- Secret management
- Azure SQL connectivity
- Cloud troubleshooting
- API rate-limit mitigation
- Data snapshots
- Backend resiliency
- Data normalization
- Historical identity mapping
- Git
- GitHub
- GitHub Actions
- Production deployment
- Production validation

## Challenges Solved

Examples of engineering problems resolved during the project include:

- PowerShell script execution blocking Vite setup
- Missing frontend CSS imports
- React blank-page and hook errors
- External API fetch failures
- HTTP 429 API rate limits
- Frontend crashes from unexpected API responses
- HTTP 403 squad endpoint restrictions
- Historical national team naming conflicts
- Mixed historical and current player ID formats
- Azure SQL favorites schema migration
- Expired JWT handling
- Azure Container Registry Tasks restrictions
- Docker-to-ACR DNS resolution
- Azure Container Registry unique login-server naming
- Container App revision validation

## Future Improvements

Potential future enhancements include:

- Automated backend container deployment through a CI/CD pipeline
- Infrastructure as Code using Bicep or Terraform
- Azure Key Vault integration
- Application Insights instrumentation
- Automated backend tests
- Automated frontend tests
- API caching
- Enhanced accessibility
- Custom domain
- Additional tournament analytics
- Expanded historical player appearance coverage

## Portfolio Focus

This project was intentionally built to demonstrate more than web development.

The strongest areas are:

- Azure cloud architecture
- Docker containerization
- Azure SQL integration
- Backend deployment
- REST API development
- Authentication
- Production troubleshooting
- Data architecture
- Reliability improvements
- Git and GitHub workflow

The World Cup Cloud Platform can be used as a portfolio project for roles such as:

- Azure Administrator
- Cloud Infrastructure Engineer
- Cloud Systems Engineer
- Infrastructure Engineer
- Junior Cloud Engineer
- Azure Support Engineer
