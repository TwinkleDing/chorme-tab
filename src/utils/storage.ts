export const setStorage = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify({ value }))
}

export const getStorage = (key: string): any => {
  const raw = localStorage.getItem(key)
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw)
    return parsed?.value
  } catch {
    return undefined
  }
}
