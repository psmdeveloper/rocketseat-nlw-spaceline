import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'
import fastify from 'fastify'
import { authRoute } from './routes/auth'
import { memoriesRoutes } from './routes/memories'

const _port = 3333
const app = fastify()

app.register(cors, {
  // Aceita todas as requesições independente da origem
  origin: true,
  // Abaixo exemplo de como seria especificando URLs especificas que poderiam acessar o este backend.
  // origin: ['http://localhost:2000', 'http://localhost:4000', 'http://localhost:5000'],
})
app.register(jwt, {
  secret: 'spacetime',
})

app.register(memoriesRoutes)
app.register(authRoute)

app
  .listen({ port: _port })
  .then(() => console.info(`Server HTTP is running on ${_port}`))
