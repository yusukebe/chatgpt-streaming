# ChatGPT Streaming Example

An example using the ChatGPT API and responding with a streaming response.

## Stack

* ChatGPT API
* [Sonik](https://github.com/yusukebe/sonik) - The [Hono](https://hono.dev/) based meta-framework.
* [`c.stream()`](https://github.com/honojs/hono/pull/1437) - A new feature of the Hono.
* React
* Cloudflare Pages

## From the source code

Here is the key code:

```ts
export const route = defineRoute<Env>((app) => {
  app.post('/api', async (c) => {
    const body = await c.req.json<{ message: string }>()

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY
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
```

## Demo

https://github.com/yusukebe/chatgpt-streaming/assets/10682/ef0eedfc-813b-4eb3-941a-769319a3ed18

## Authors

- Yusuke Wada <https://github.com/yusukebe>

## License

MIT
