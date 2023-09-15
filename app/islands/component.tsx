import { useState, useEffect, useRef } from 'react'

export default function Component(props: { baseURL: string }) {
  const [answer, setAnswer] = useState('')
  const [userInput, setUserInput] = useState('')
  const url = new URL('/api', props.baseURL)

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchMessage = async (messageToSend: string) => {
    setAnswer('')

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          message: messageToSend
        }),
        signal
      })

      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        const decodedChunk = decoder.decode(value, { stream: true })
        text += decodedChunk
        setAnswer(text)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch was aborted')
      } else {
        throw error
      }
    }
  }

  useEffect(() => {
    if (!import.meta.env.SSR) {
      fetchMessage('Hello!')
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchMessage(userInput)
    setUserInput('')
  }

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            style={{ width: '300px', marginRight: '2px' }}
            value={userInput}
            onChange={(e) => setUserInput((e.target as any).value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
      <h2>Answer</h2>
      <pre>{answer}</pre>
    </div>
  )
}
