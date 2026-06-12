export function dateFormat(time: Date | string | number, format = 'yyyy-MM-dd'): string {
  if (!time) return ''
  const date = new Date(time)
  const map: Record<string, number> = {
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
    q: Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  }
  return format.replace(/([yMdhmsqS])+/g, (all, t) => {
    let v = map[t]
    if (v !== undefined) {
      if (all.length > 1) v = Number(`0${v}`.slice(-2))
      return String(v)
    }
    if (t === 'y') return String(date.getFullYear()).slice(4 - all.length)
    return all
  })
}
