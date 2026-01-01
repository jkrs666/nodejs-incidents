# How to run

execute `docker compose up` in the root directory

browse [http://localhost:3001](http://localhost:3001)

# Project Overview

## ports

- **3000**  backend
- **9001**  websocket server
- **3001**  frontend
- **27017** mongo db

## compose.yaml

this creates 3 containers and assigns them on a network `incinet`

frontend and backend are official node images version 24

respective docker volumes are created using the `./backend`, `./frontend` folders

mongo uses a volume for persistence

## frontend

a node js server that serves a single html file

this file:
1. fetches all incidents from backend
2. converts each incident to html and renders table
3. for each incident change (js event listeners), send a patch request to backend
4. creates a new incident with default values by clicking the 'New Incident' button
5. on each websocket message checks if its a new incident or an updated one and updates the table accordingly

## backend

### ./test

directory that has unit and integration tests for each endpoint and request validations

you can run the tests by executing `npm test`

### ./src/

the backend source code

### ./backend/src/repo.mjs

this file is abstracting the db queries execution

creates default values (createdAt, status) and converts DTOs

### ./backend/src/utils.mjs

helper functions for validations, test server creations, etc


### ./backend/src/websocket.mjs

the websocket server

uses `ws` library

client must initiate from localhost:3001 (frontend) else will decline the connection (CORS check)

sends message on incident creation and update 


### ./backend/src/server.mjs

has a single function that basically creates the backend server

params are a db client, and a websocket server

has 3 endpoints:
- create incident
- update incident
- get all incidents

also a basic router that pattern matches the endpoint from the request

OPTIONS endpoint and headers are for CORS check

accepts connections only from localhost:3001 (frontend)

### ./backend/index.mjs

creates db, websocket server and starts backend server on port 3000

# design decisions

## infrastructure
- **no custom dockerfiles**: used official `node:24` images directly with volume mounts. this keeps the setup simple, allows instant code changes without rebuilding images.

- **separate WebSocket server**: WebSocket runs on port 9001 instead of upgrading HTTP connections. this separates concerns and makes the code easier to understand and test.

## backend
- **no framework**: used Node.js native `http` module instead of external libraries

- **manual routing**: simple regex-based router instead of a routing library. sufficient for 3 endpoints and more transparent.

- **mongo DB ObjectId for timestamps**: used the embedded timestamp in mongo ObjectId for `createdAt` instead of storing a separate field. this eliminates redundancy and guarantees uniqueness.

- **request size limit**: limited request body to 100KB to prevent abuse

- **validation approach**: validates against immutable fields (`id`, `createdAt`, `status` on POST) to prevent client manipulation

## frontend
- **simple "New Incident" button**: creates incidents with default values (title: "untitled", severity: "low") instead of a form. users can edit inline immediately. this reduces UI complexity and makes creating incidents faster.

- **no WebSocket delays**: updates are applied immediately without debouncing/throttling for a true real-time feel. in a production app with high traffic, this might need throttling.

- **inline editing**: table cells are directly editable with input/select elements, avoiding modal dialogs or separate edit pages.

- **client-side sorting**: Incidents are sorted on the frontend. for small datasets this is fine. larger datasets would need server-side sorting.

## security
- **CORS restrictions**: Backend and WebSocket only accept connections from `http://localhost:3001` to prevent unauthorized access.

## testing
- **mock WebSocket in tests**: created a mock `broadcastIncident` function in test server to avoid WebSocket dependency during API tests.

# assumptions

- **single user**: no concurrent editing conflicts handled (last write wins)
- **small dataset**: no pagination on incidents list
- **development environment**: hardcoded localhost URLs, no HTTPS
- **mongo DB always available**: no retry logic for database connections
- **WebSocket reliability**: no automatic reconnection if connection drops
