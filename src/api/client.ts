import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string; details?: string[] }>(error)) {
    const message = error.response?.data?.message
    const details = error.response?.data?.details
    if (message && details?.length) return `${message}: ${details.join(', ')}`
    if (message) return message
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    if (!error.response) return 'Cannot reach the CampusFind API. Check that the server is running.'
  }
  return 'Something went wrong. Please try again.'
}
