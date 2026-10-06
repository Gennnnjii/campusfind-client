import { z } from 'zod'

export const claimSchema = z.object({
  claimantName: z.string().trim().min(2, 'Enter your full name.').max(100, 'Name is too long.'),
  claimantEmail: z.string().trim().email('Enter a valid school email address.').max(160, 'Email is too long.'),
  proofDescription: z.string().trim().min(20, 'Provide at least 20 characters of identifying detail.').max(1200, 'Proof description is too long.'),
})

export type ClaimFormValues = z.infer<typeof claimSchema>

export const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().trim().max(500, 'Review note is too long.'),
}).superRefine((values, context) => {
  if (values.status === 'rejected' && values.reviewNote.length < 5) {
    context.addIssue({
      code: 'custom',
      path: ['reviewNote'],
      message: 'Add a short reason when rejecting a claim.',
    })
  }
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
