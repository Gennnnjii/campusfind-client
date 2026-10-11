import { z } from 'zod'

export const itemSchema = z.object({
  title: z.string().trim().min(3, 'Enter at least 3 characters.').max(120, 'Keep the title under 120 characters.'),
  description: z.string().trim().min(10, 'Enter at least 10 characters.').max(1200, 'Keep the description under 1,200 characters.'),
  category: z.string().min(1, 'Choose a category.'),
  location: z.string().min(1, 'Choose a campus location.'),
  type: z.enum(['lost', 'found']),
  dateOccurred: z.string().refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const [year, month, day] = value.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, day)
    return selectedDate.getFullYear() === year
      && selectedDate.getMonth() === month - 1
      && selectedDate.getDate() === day
      && selectedDate <= new Date()
  }, 'Choose a valid date today or earlier.'),
})

export type ItemFormValues = z.infer<typeof itemSchema>
