# TransportApp Admin

Aplicație React Admin pentru backend ASP.NET Core Web API TransportApp.

## Instalare

```bash
npm install
cp .env.example .env
npm run dev
```

În `.env`, setează URL-ul backendului:

```env
VITE_API_BASE_URL=https://localhost:7000/api
```

## Endpointuri așteptate

Login:
- POST `/api/auth/login`

Dashboard:
- GET `/api/admin/dashboard`

Users:
- GET `/api/admin/users`
- POST `/api/admin/users/controllers`
- POST `/api/admin/users/admins`
- POST `/api/admin/users/{id}/roles`
- DELETE `/api/admin/users/{id}/roles/{role}`
- PUT `/api/admin/users/{id}/deactivate`

Lines:
- GET/POST `/api/admin/lines`
- PUT/DELETE `/api/admin/lines/{id}`
- PUT `/api/admin/lines/{id}/active`

Stations:
- GET/POST `/api/admin/stations`
- PUT/DELETE `/api/admin/stations/{id}`

Timetable:
- GET/POST `/api/admin/timetable`
- PUT/DELETE `/api/admin/timetable/{id}`
- PUT `/api/admin/timetable/{id}/active`

Announcements:
- GET/POST `/api/admin/announcements`
- PUT/DELETE `/api/admin/announcements/{id}`

Prices:
- GET `/api/admin/prices`
- PUT `/api/admin/prices`
```

Dacă backendul tău are alte endpointuri, modifici doar fișierele din `src/services`.
