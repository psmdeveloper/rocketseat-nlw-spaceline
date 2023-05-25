import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoute(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      code: z.string(),
    })

    const { code } = bodySchema.parse(request.body)

    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token', // URL
      null, // Body da request
      {
        params: {
          client_id: process.env.GIT_HUB_CLIENT_ID,
          client_secret: process.env.GIT_HUB_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      }, // parametros da requisição
    )

    const { access_token } = accessTokenResponse.data

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    })

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    const userInfo = userSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        idGitHub: userInfo.id,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          idGitHub: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    const token = app.jwt.sign(
      {
        // Informações publicas e não sensíveis para que o consumidor do server/backend, possa utilizar
        // pois o jwt (Json Web Token) não é criptografado, mas, somente assinado.
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        // sub = subject/assunto | A quem pertence estas informações
        sub: user.id,
        // Tempo de validade/duração do token
        expiresIn: '30 days',
      },
    )

    return {
      token,
    }
  })
}
