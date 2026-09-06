import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = 5500
const JWT_EXPIRE_TIME_IN_MS = 30

app.use(express.json())

const authenticate = (username, password) => {
  return username === "thangphan" && password === "abc"
}

app.post("/login", (req, res) => {
  const data = req.body
  const { username, password } = data

  const isAuthenticated = authenticate(username, password)
  if (!isAuthenticated) {
    return res.status(401).json({
      error: "invalid_user_credentials",
      message: "Can not login"
    })
  }

  const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_EXPIRE_TIME_IN_MS
  })

  res.json({
    accessToken
  })
})

app.listen(PORT, () => {
  console.log(`Auth server is listening on port: ${PORT}`)
})
