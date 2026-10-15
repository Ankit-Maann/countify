import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import CountdownPage from "./pages/CountdownPage";

const PublicCountdownPage = lazy(() => import("./pages/PublicCountdownPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CreatorStudioPage = lazy(() => import("./pages/CreatorStudioPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
const AICreatorPage = lazy(() => import("./pages/AICreatorPage"));
const DesignStudioPage = lazy(() => import("./pages/DesignStudioPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CreatorProfilePage = lazy(() => import("./pages/CreatorProfilePage"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const SocialStudioPage = lazy(() => import("./pages/SocialStudioPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const PlatformHubPage = lazy(() => import("./pages/PlatformHubPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const EmbedPage = lazy(() => import("./pages/EmbedPage.jsx"));
const BusinessPage = lazy(() => import("./pages/BusinessPage.jsx"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage.jsx"));
const ReleasePage = lazy(() => import("./pages/ReleasePage"));

function RouteLoader() { return <main className="main-container"><section className="countdown-card"><div className="event-icon">⏳</div><h1>Loading…</h1><p className="event-description">Preparing your countdown.</p></section></main>; }
export default function App() {
  return <ErrorBoundary><Suspense fallback={<RouteLoader />}><Routes>
    <Route path="/c/:slug" element={<PublicCountdownPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/create" element={<CreatorStudioPage />} />
    <Route path="/explore" element={<ExplorePage />} />
    <Route path="/premium" element={<PremiumPage />} />
    <Route path="/ai" element={<AICreatorPage />} />
    <Route path="/design" element={<DesignStudioPage />} />
    <Route path="/share" element={<SocialStudioPage />} />
    <Route path="/community" element={<CommunityPage />} />
    <Route path="/creator/:username" element={<CreatorProfilePage />} />
    <Route path="/saved" element={<SavedPage />} />
    <Route path="/billing" element={<BillingPage />} />
    <Route path="/platform" element={<PlatformHubPage />} />
    <Route path="/marketplace" element={<MarketplacePage />} />
    <Route path="/business" element={<BusinessPage />} />
    <Route path="/embed" element={<EmbedPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/status" element={<StatusPage />} />
    <Route path="/release" element={<ReleasePage />} />
    <Route path="*" element={<CountdownPage />} />
  </Routes></Suspense></ErrorBoundary>;
}
