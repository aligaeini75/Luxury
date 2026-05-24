export class ChatDurableObject {
  state: DurableObjectState
  sessions: Set<WebSocket>

  constructor(state: DurableObjectState) {
    this.state = state
    this.sessions = new Set()
  }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const pair = new WebSocketPair()
    const client = pair[0]
    const server = pair[1]

    server.accept()
    this.sessions.add(server)

    server.addEventListener('message', (event) => {
      const data = String(event.data || '')
      for (const ws of this.sessions) {
        if (ws.readyState === WebSocket.OPEN) {
          try { ws.send(data) } catch {}
        }
      }
    })

    const cleanup = () => this.sessions.delete(server)
    server.addEventListener('close', cleanup)
    server.addEventListener('error', cleanup)

    return new Response(null, { status: 101, webSocket: client })
  }
}
