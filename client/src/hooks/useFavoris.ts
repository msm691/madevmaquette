import { useCallback, useState } from 'react'

const STORAGE_KEY = 'madev_favoris'

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set<string>(JSON.parse(raw) as string[])
  } catch { /* ignore */ }
  return new Set()
}

export function useFavoris() {
  const [favoris, setFavoris] = useState<Set<string>>(loadFromStorage)

  const toggleFavori = useCallback((id: string) => {
    setFavoris((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  return { favoris, toggleFavori }
}
