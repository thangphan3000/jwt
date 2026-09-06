import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const app = express();
const PORT = 3001

app.use(express.json())

const books = [
  {
    id: 1,
    name: "Spiderman",
    author: "Thang"
  },
  {
    id: 2,
    name: "Startwars",
    author: "Ngoc"
  }
]

const authorize = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"]
  const token = authorizationHeader?.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      error: "missing_access_token",
      message: "Authorization bearer token is required"
    })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
    if (err) {
      return res.status(403).json({
        error: "jwt_expired",
        message: err
      })
    }

    next()
  })
}

app.get('/books', authorize, (req, res) => {
  res.json({status: 'Success', data: { books } })
})

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`)
})
