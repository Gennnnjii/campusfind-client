export type ItemStatus =
  | 'open'
  | 'recovered'
  | 'pending_turnover'
  | 'available_for_claim'
  | 'returned'

export type ClaimStatus = 'pending' | 'approved' | 'rejected'

export type NamedResource = {
  _id: string
  name: string
}

export type Item = {
  _id: string
  title: string
  description?: string
  type: 'lost' | 'found'
  status: ItemStatus
  claimLocation: string
  dateOccurred: string
  category?: NamedResource
  location?: NamedResource
  createdAt?: string
  updatedAt?: string
}

export type Claim = {
  _id: string
  item: Item
  claimantName: string
  claimantEmail: string
  proofDescription: string
  referenceCode: string
  status: ClaimStatus
  reviewNote: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export type ActivityAction =
  | 'report_created'
  | 'turnover_confirmed'
  | 'claim_submitted'
  | 'claim_approved'
  | 'claim_rejected'
  | 'item_returned'
  | 'item_recovered'

export type ActivityLog = {
  _id: string
  item: Pick<Item, '_id' | 'title' | 'type' | 'status'>
  claim?: Pick<Claim, '_id' | 'referenceCode' | 'status'> | null
  action: ActivityAction
  message: string
  createdAt: string
}

export type SdaoOverview = {
  counts: {
    awaitingTurnover: number
    availableForClaim: number
    pendingClaims: number
    approvedClaims: number
    returnedItems: number
  }
  awaitingTurnover: Item[]
  availableForClaim: Item[]
  pendingClaims: Claim[]
  approvedClaims: Claim[]
  returnedItems: Item[]
}
