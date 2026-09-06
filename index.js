import express from "express"
import jwt from  "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const app = express();
const PORT = 3001
const JWT_EXPIRE_TIME_IN_MS = 30

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

const authenicate = (username, password) => {
  if (username === "thangphan" && password === "abc") {
    return true
  }

  return false
}

app.post('/login', (req, res) => {
  const data = req.body
  const { username, password } = data

  const isAuthenticated = authenicate(username, password) 
  if (!isAuthenticated) {
    res.status(401).json({
      error: "invalid_user_credentials",
      message: "Can not login"
    })
  } 
  const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: JWT_EXPIRE_TIME_IN_MS }) 

  res.json({
    accessToken: accessToken
  })
})

const authorize = (req, res, next) => {
  const authorizationHeader = req.headers['authorization']
  const token = authorizationHeader.split(' ')[1];
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      res.status(403).json({
        error: 'jwt_expired',
        message: err
    })
    } else {
      next()
    }
  })
}

app.get('/books', authorize, (req, res) => {
  res.json({status: 'Success', data: { books } })
})

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`)
})
