const configuredBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '')

export function apiUrl(path: string) {
  if (!configuredBase) return path
  if (path.startsWith('/')) return `${configuredBase}${path}`
  return `${configuredBase}/${path}`
}

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    credentials: 'include',
  })
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export function mediaUrl(url: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('/assets/')) return url
  if (configuredBase && url.startsWith('/uploads/')) return `${configuredBase}${url}`
  return url
}
