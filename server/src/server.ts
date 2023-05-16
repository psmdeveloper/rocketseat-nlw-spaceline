import { PrismaClient } from '@prisma/client'
import fastify from 'fastify'

const porta = 3333
const app = fastify()
const repository = new PrismaClient()

app.get('/users', async () => {
  const users = await repository.user.findMany()
  return users
})

app
  .listen({ port: porta })
  .then(() => console.info(`Server HTTP is running on ${porta}`))
