import { Route, Routes, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ActivityHistoryPage } from './pages/ActivityHistoryPage'
import { BrowseItemsPage } from './pages/BrowseItemsPage'
import { ClaimReviewPage } from './pages/ClaimReviewPage'
import { Member3HomePage } from './pages/Member3HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SdaoManagementPage } from './pages/SdaoManagementPage'
import { SubmitClaimPage } from './pages/SubmitClaimPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/member3" replace />} />
        <Route path="member3" element={<Member3HomePage />} />
        <Route path="items" element={<BrowseItemsPage />} />
        <Route path="items/:id/claim" element={<SubmitClaimPage />} />
        <Route path="sdao" element={<SdaoManagementPage />} />
        <Route path="sdao/claims/:id" element={<ClaimReviewPage />} />
        <Route path="activity" element={<ActivityHistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
