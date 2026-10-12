# EventHub — Event Management Platform

A full-stack academic project inspired by the structure of the supplied Student Management Website, adapted for an **Event Platform**.

## Features
- Event discovery dashboard with search and category filters
- Upcoming event cards with date, venue, category, price and seat availability
- Create, edit and delete events (organizer controls)
- Register/RSVP for events and view attendee counts
- Responsive layout for desktop and mobile
- React + Vite frontend
- Java 21 + Spring Boot REST API + Spring Data JPA
- MySQL persistence for events and registrations
- Demo mode in the frontend using localStorage if the API is unavailable

## Technology
- Frontend: React 18, Vite, Lucide React
- Backend: Java 21, Spring Boot 3.3.5, Spring Web, Spring Data JPA
- Database: MySQL 8

## Requirements
- Node.js 20+ and npm
- JDK 21 and Maven 3.9+
- MySQL 8 (optional for frontend demo mode)

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally `http://localhost:5173`. The interface starts with sample events and can run in demo mode without the backend.

## Run the backend
1. Create a MySQL database (or let the configured JDBC URL create it):
```sql
CREATE DATABASE IF NOT EXISTS event_platform_db;
```
2. Configure credentials using environment variables if required:
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
```
3. Start the API:
```bash
cd backend
mvn spring-boot:run
```
The API runs at `http://localhost:8080`. The frontend uses `/api` via Vite proxy.

## API endpoints
- `GET /api/events` — list events; optional `?q=...&category=...`
- `GET /api/events/{id}` — event details
- `POST /api/events` — create event
- `PUT /api/events/{id}` — update event
- `DELETE /api/events/{id}` — delete event
- `GET /api/events/{id}/registrations` — list registrations
- `POST /api/events/{id}/registrations` — register an attendee

## Notes
- This is a student project/demo, not a production ticketing system.
- The frontend has a local demo fallback. If the backend is available, it attempts to load and save data through the API.
- For production, add authentication/authorization, payment integration, email notifications, audit logs, rate limiting and stronger validation.

## Registration and event management updates

- Manage Events includes explicit Edit and Delete actions.
- RSVP registration is saved through `POST /api/events/{id}/registrations` and backend errors are shown instead of pretending the registration succeeded.
- Duplicate registrations for the same event/email are rejected by the backend.
- Full events reject new registrations.
- My Registrations remembers the current browser's registered event IDs locally; the backend registration records remain stored in MySQL.
- A registered event can be cancelled with `DELETE /api/events/{id}/registrations?email=...`; the backend decrements the attendee count.
- Deleting an event also removes its registration rows.

After extracting this updated project, keep your existing database and credentials. Configure `backend/src/main/resources/application.properties` with your own MySQL credentials, then run the backend and frontend as described above.
