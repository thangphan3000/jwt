# JWT Express Demo

A small Express app that demonstrates logging in with hard-coded credentials, issuing a JSON Web Token (JWT), and using that token to access a protected `/books` endpoint.

## Table of Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Running the Server](#running-the-server)
- [API Usage](#api-usage)
- [Request Flow](#request-flow)
- [Project Structure](#project-structure)
- [Notes](#notes)

## Requirements

- Node.js
- pnpm
- `curl` and `jq` for the command-line examples

## Setup

Install dependencies:

```bash
pnpm install
```

Create a local `.env` file from the sample:

```bash
cp .env.sample .env
```

Update `.env` with your own JWT secret:

```bash
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
```

## Running the Server

Start the auth server:

```bash
pnpm auth
```

The auth server listens on port `5500`.

In another terminal, start the books API server:

```bash
pnpm dev
```

The books API server listens on port `3001`.

## API Usage

### Log In

Use the demo credentials to request an access token:

```bash
ACCESS_TOKEN=$(curl -s --json '{"username":"thangphan","password":"abc"}' \
  http://localhost:5500/login | jq -r ".accessToken")
```

Print the token:

```bash
echo "$ACCESS_TOKEN"
```

### Access Protected Books Endpoint

Pass the token in the `Authorization` header:

```bash
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:3001/books | jq
```

Successful responses return the protected book list:

```json
{
  "status": "Success",
  "data": {
    "books": [
      {
        "id": 1,
        "name": "Spiderman",
        "author": "Thang"
      },
      {
        "id": 2,
        "name": "Startwars",
        "author": "Ngoc"
      }
    ]
  }
}
```

## Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthServer as Auth Server
    participant Books as Books API Server

    Client->>AuthServer: POST /login with username and password

    alt Invalid credentials
        Note right of AuthServer: Compare username and password inline
        AuthServer-->>Client: 401 Unauthorized
    else Valid credentials
        Note right of AuthServer: Sign access token with ACCESS_TOKEN_SECRET
        AuthServer-->>Client: 200 OK with accessToken
    end

    Client->>Books: GET /books with Authorization: Bearer token

    alt Missing token
        Note right of Books: Read token from Authorization header
        Books-->>Client: 401 Unauthorized
    else Token invalid or expired
        Note right of Books: Verify token with ACCESS_TOKEN_SECRET
        Books-->>Client: 403 Forbidden
    else Token valid
        Note right of Books: Verify token with ACCESS_TOKEN_SECRET
        Books-->>Client: 200 OK with book list
    end
```

## Project Structure

```text
.
├── .env.sample
├── auth-server.js
├── index.js
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Notes

- Demo login credentials are `thangphan` / `abc`.
- Access tokens expire after `30` seconds.
- This project is for learning JWT request flow only. Do not use hard-coded credentials or short secrets in production.
