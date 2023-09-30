import { useState, useEffect, useRef, useReducer } from 'react'

type Message = {
  role: string
  content: string
}

type Action = { type: 'ADD_USER_MESSAGE'; content: string } | { type: 'ADD_SYSTEM_MESSAGE'; content: string }

function messageReducer(state: Message[], action: Action): Message[] {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return [
        {
          role: 'user',
          content: action.content
        },
        ...state
      ]
    case 'ADD_SYSTEM_MESSAGE':
      if (state.length > 0 && state[0].role === 'system') {
        return [{ role: 'system', content: action.content }, ...state.slice(1)]
      } else {
        return [{ role: 'system', content: action.content }, ...state]
      }
    default:
      return state
  }
}

export default function Component(props: { baseURL: string }) {
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [messages, dispatch] = useReducer(messageReducer, [
    {
      role: 'user',
      content: 'You are a helpful assistant.'
    }
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  const url = new URL('/api', props.baseURL)

  const fetchMessages = async (messagesToFetch: Message[]) => {
    setLoading(true)

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messagesToFetch].reverse()
        })
      })

      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      setTyping(true)

      for (;;) {
        const { done, value } = await reader.read()
        if (done) {
          setTyping(false)
          break
        }
        const decodedChunk = decoder.decode(value, { stream: true })
        text += decodedChunk

        dispatch({ type: 'ADD_SYSTEM_MESSAGE', content: text })
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch was aborted')
      } else {
        throw error
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if (messages[0].role === 'user' && !import.meta.env.SSR) {
      fetchMessages(messages)
    }
  }, [messages])

  useEffect(() => {
    if (!loading && inputRef.current) {
      ;(inputRef.current as any).focus()
    }
  }, [loading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    dispatch({ type: 'ADD_USER_MESSAGE', content: userInput })
    setUserInput('')
  }

  return (
    <>
      <div id="message">
        {[...messages].reverse().map((message, i) => (
          <div key={i}>
            <b>{message.role === 'user' ? 'You' : 'AI'}</b>
            <pre>
              {message.content}
              {typing && i === messages.length - 1 && <span className="loader">❚</span>}
            </pre>
          </div>
        ))}
      </div>
      <div id="input-div">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput((e.target as any).value)}
            disabled={loading}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </>
  )
}
