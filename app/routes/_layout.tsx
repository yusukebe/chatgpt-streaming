import type { LayoutHandler } from '@sonikjs/react'

const handler: LayoutHandler = ({ children, head }) => {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css" />
        {import.meta.env.PROD ? (
          <>
            <link href="/static/style.css" rel="stylesheet" />
            <script type="module" src="/static/client.js"></script>
          </>
        ) : (
          <>
            <link href="/app/style.css" rel="stylesheet" />
            <script type="module" src="/app/client.ts"></script>
          </>
        )}
        {head.createTags()}
      </head>
      <body>
        <div className="wrapper">
          <h1>Hello ChatGPT!</h1>

          <div id="chat-container">{children}</div>
          <footer>
            <small>
              © 2023 Yusuke Wada &nbsp;
              <a href="https://github.com/yusukebe/chatgpt-streaming">See the code</a>
            </small>
          </footer>
        </div>
      </body>
    </html>
  )
}

export default handler
