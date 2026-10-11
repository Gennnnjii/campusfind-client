import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ActivityHistoryPage } from './pages/ActivityHistoryPage'
import { BrowseItemsPage } from './pages/BrowseItemsPage'
import { ClaimReviewPage } from './pages/ClaimReviewPage'
import { DashboardPage } from './pages/DashboardPage'
import { EditItemPage } from './pages/EditItemPage'
import { FoundReportsPage } from './pages/FoundReportsPage'
import { ItemDetailsPage } from './pages/ItemDetailsPage'
import { LandingPage } from './pages/LandingPage'
import { LostReportsPage } from './pages/LostReportsPage'
import { Member3HomePage } from './pages/Member3HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ReportItemPage } from './pages/ReportItemPage'
import { ReferenceManagementPage } from './pages/ReferenceManagementPage'
import { SdaoManagementPage } from './pages/SdaoManagementPage'
import { SubmitClaimPage } from './pages/SubmitClaimPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="member3" element={<Member3HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="items" element={<BrowseItemsPage />} />
        <Route path="items/lost" element={<LostReportsPage />} />
        <Route path="items/found" element={<FoundReportsPage />} />
        <Route path="items/:id/edit" element={<EditItemPage />} />
        <Route path="report" element={<ReportItemPage />} />
        <Route path="references" element={<ReferenceManagementPage />} />
        <Route path="items/:id/claim" element={<SubmitClaimPage />} />
        <Route path="items/:id" element={<ItemDetailsPage />} />
        <Route path="sdao" element={<SdaoManagementPage />} />
        <Route path="sdao/claims/:id" element={<ClaimReviewPage />} />
        <Route path="activity" element={<ActivityHistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
