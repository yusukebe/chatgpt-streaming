import { Context, defineRoute } from 'sonik'
import Component from '../islands/component'
import { OpenAI } from 'openai'

type Env = {
  Bindings: {
    OPENAI_API_KEY: string
    OPENAI_BASE_URL: string
    BASE_URL: string
  }
}

const PROMPT = (message: string) => [
  {
    role: 'system' as const,
    content:
      'You are a great Web developer. If you receive a question about Web-related technologies, you can answer it.'
  },
  {
    role: 'user' as const,
    content: message
  }
]

export const route = defineRoute<Env>((app) => {
  app.post('/api', async (c) => {
    const body = await c.req.json<{ message: string }>()

    const openAIBaseUrl = c.env.OPENAI_BASE_URL !== '' ? c.env.OPENAI_BASE_URL : 'https://api.openai.com/v1'
    console.log(`Using ${openAIBaseUrl} as a base URL.`)

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
      baseURL: openAIBaseUrl
    })

    const chatStream = await openai.chat.completions.create({
      messages: PROMPT(body.message),
      model: 'gpt-3.5-turbo',
      stream: true
    })

    return c.streamText(async (stream) => {
      for await (const message of chatStream) {
        await stream.write(message.choices[0]?.delta.content ?? '')
      }
    })
  })
})

export default function Index(c: Context<Env>) {
  return (
    <div>
      <p>Me: {PROMPT('')[0].content}</p>
      <Component baseURL={c.env.BASE_URL} />
    </div>
  )
}
