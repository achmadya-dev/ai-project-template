import { useState, type FormEvent } from 'react'
import { createExampleWidget } from './widget.functions'
import { widgetInput } from './domain/widget'

export function WidgetForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = widgetInput.safeParse({ name })
    if (!parsed.success) {
      setMessage('Enter a name between 1 and 80 characters.')
      return
    }
    setPending(true)
    try {
      const result = await createExampleWidget({ data: parsed.data })
      if (!result.ok) {
        setMessage(
          result.error.code === 'EXAMPLE_WIDGET_EXISTS'
            ? 'This name is already in use.'
            : 'The request could not be completed.',
        )
      } else {
        setMessage(`Created ${result.data.name}.`)
        setName('')
      }
    } catch {
      setMessage('The request could not be completed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="example-widget-name">Name</label>
      <input
        id="example-widget-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={80}
      />
      <button type="submit" disabled={pending}>
        Create
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
