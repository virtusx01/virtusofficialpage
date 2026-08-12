/**
 * playerEvents.ts
 * Global registry of active SSE connections for the /textberjalan page.
 * When any player mutation happens (POST/PUT/DELETE), call broadcastPlayerUpdate()
 * to notify all connected OBS browser sources to reload.
 */

// Each connected SSE client gets a ReadableStreamDefaultController
type SSEController = ReadableStreamDefaultController<Uint8Array>;

// Use globalThis to survive Next.js hot-reloads in dev (module cache resets)
const g = globalThis as typeof globalThis & {
  _playerSSEClients?: Set<SSEController>;
};

if (!g._playerSSEClients) {
  g._playerSSEClients = new Set<SSEController>();
}

const clients: Set<SSEController> = g._playerSSEClients;

export function addSSEClient(controller: SSEController): void {
  clients.add(controller);
}

export function removeSSEClient(controller: SSEController): void {
  clients.delete(controller);
}

export function broadcastPlayerUpdate(): void {
  const message = `data: update\n\n`;
  const encoded = new TextEncoder().encode(message);

  for (const controller of clients) {
    try {
      controller.enqueue(encoded);
    } catch {
      // Client disconnected — clean up
      clients.delete(controller);
    }
  }
}

export function getClientCount(): number {
  return clients.size;
}
