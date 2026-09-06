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

Start the app:

```bash
node index.js
```

The server listens on port `3001`.

## API Usage

### Log In

Use the demo credentials to request an access token:

```bash
ACCESS_TOKEN=$(curl -s --json '{"username":"thangphan","password":"abc"}' \
  http://localhost:3001/login | jq -r ".accessToken")
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
    participant Express as Express Server
    participant Auth as authenticate()
    participant JWT as jsonwebtoken
    participant Books as /books API

    Client->>Express: POST /login with username and password
    Express->>Auth: Validate credentials
    Auth-->>Express: Valid or invalid

    alt Invalid credentials
        Express-->>Client: 401 Unauthorized
    else Valid credentials
        Express->>JWT: Sign JWT with ACCESS_TOKEN_SECRET
        JWT-->>Express: accessToken
        Express-->>Client: 200 OK with accessToken
    end

    Client->>Books: GET /books with Authorization: Bearer token
    Books->>JWT: Verify token with ACCESS_TOKEN_SECRET

    alt Token invalid or expired
        JWT-->>Books: Verification error
        Books-->>Client: 403 Forbidden
    else Token valid
        JWT-->>Books: Decoded token data
        Books-->>Client: 200 OK with book list
    end
```

## Project Structure

```text
.
├── .env.sample
├── index.js
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Notes

- Demo login credentials are `thangphan` / `abc`.
- Access tokens expire after `30` seconds.
- This project is for learning JWT request flow only. Do not use hard-coded credentials or short secrets in production.
