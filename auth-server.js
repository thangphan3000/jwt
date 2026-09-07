import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "node:crypto";

dotenv.config();

const app = express();
const PORT = 5500;
const JWT_EXPIRE_TIME_IN_MS = 30;
const REFRESH_TOKEN_EXPIRE_TIME = "1d";
const refreshTokens = new Set();

app.use(express.json());

const authenticate = (username, password) => {
  return username === "thangphan" && password === "abc";
};

const createAccessToken = (username) => {
  return jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_EXPIRE_TIME_IN_MS,
  });
};

const createRefreshToken = (username) => {
  return jwt.sign({ username, tokenId: crypto.randomUUID() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
  });
};

app.post("/login", (req, res) => {
  const data = req.body;
  const { username, password } = data;

  const isAuthenticated = authenticate(username, password);
  if (!isAuthenticated) {
    return res.status(401).json({
      error: "invalid_user_credentials",
      message: "Can not login",
    });
  }

  const accessToken = createAccessToken(username);
  const refreshToken = createRefreshToken(username);
  refreshTokens.add(refreshToken);

  res.json({
    accessToken,
    refreshToken,
  });
});

app.post("/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: "missing_refresh_token",
      message: "Refresh token is required",
    });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({
      error: "invalid_refresh_token",
      message: "Refresh token is invalid",
    });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      refreshTokens.delete(refreshToken);

      return res.status(401).json({
        error: "invalid_refresh_token",
        message: err.message,
      });
    }

    const accessToken = createAccessToken(user.username);
    const newRefreshToken = createRefreshToken(user.username);

    refreshTokens.delete(refreshToken);
    refreshTokens.add(newRefreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  });
});

app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  res.json({
    status: "Success",
    message: "Logged out",
  });
});

app.listen(PORT, () => {
  console.log(`Auth server is listening on port: ${PORT}`);
});
