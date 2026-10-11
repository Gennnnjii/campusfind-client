import { BrowseItemsPage } from './BrowseItemsPage'

export function LostReportsPage() {
  return (
    <BrowseItemsPage
      lockedType="lost"
      title="Lost Reports"
      description="Browse reported Lost Items and track their recovery status."
    />
  )
}
