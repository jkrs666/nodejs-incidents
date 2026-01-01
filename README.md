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
