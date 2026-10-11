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
  description?: string
  isActive?: boolean
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

export type MatchScoreBreakdown = {
  category: 0 | 40
  location: 0 | 25
  date: 0 | 20
  title: 0 | 15
}

export type PossibleMatch = {
  _id: string
  title: string
  description: string
  type: 'lost' | 'found'
  status: ItemStatus
  category: NamedResource | null
  location: NamedResource | null
  dateOccurred: string
  claimLocation: string
  score: number
  reasons: string[]
  scoreBreakdown: MatchScoreBreakdown
}

export type StatisticsOverview = {
  totalItems: number
  totalLost: number
  totalFound: number
  activeLost: number
  activeFound: number
  recovered: number
  returned: number
  claims: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export type CategoryStatistic = {
  categoryId: string | null
  name: string
  total: number
  lost: number
  found: number
  percentage: number
}

export type LocationStatistic = {
  locationId: string | null
  name: string
  total: number
  lost: number
  found: number
  percentage: number
  rank: number
}

export type ResolutionStatistics = {
  totalReports: number
  resolvedReports: number
  overallResolutionRate: number
  lost: {
    total: number
    recovered: number
    rate: number
  }
  found: {
    total: number
    returned: number
    rate: number
  }
}
