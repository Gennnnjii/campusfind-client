export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-PH', options ?? {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function daysSince(value: string) {
  const milliseconds = Date.now() - new Date(value).getTime()
  return Math.max(0, Math.floor(milliseconds / 86_400_000))
}
