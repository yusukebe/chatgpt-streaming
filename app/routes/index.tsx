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

type Message = {
  role: 'system' | 'user'
  content: string
}

export const route = defineRoute<Env>((app) => {
  app.post('/api', async (c) => {
    const body = await c.req.json<{ messages: Message[] }>()

    const openAIBaseUrl = c.env.OPENAI_BASE_URL !== '' ? c.env.OPENAI_BASE_URL : 'https://api.openai.com/v1'
    console.log(`Using ${openAIBaseUrl} as a base URL.`)

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
      baseURL: openAIBaseUrl
    })

    const chatStream = await openai.chat.completions.create({
      messages: body.messages,
      model: 'gpt-4',
      stream: true
    })

    return c.streamText(async (stream) => {
      for await (const message of chatStream) {
        const text = message.choices[0]?.delta.content ?? ''
        await Promise.all(
          Array.from(text).map(async (s) => {
            await stream.write(s)
            await stream.sleep(20)
          })
        )
      }
    })
  })
})

export default function Index(c: Context<Env>) {
  return (
    <div>
      <Component baseURL={c.env.BASE_URL} />
    </div>
  )
}
