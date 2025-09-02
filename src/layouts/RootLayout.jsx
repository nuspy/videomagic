import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { DraftProvider } from '../context/DraftContext'
import NoStorageBanner from '../components/NoStorageBanner'
import StartupDraftModal from '../components/StartupDraftModal'
import DraftControls from '../components/DraftControls'

export default function RootLayout() {
  return (
    <DraftProvider>
      <Navbar />
      <NoStorageBanner />
      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <div className="container" style={{ paddingBottom: '1rem' }}>
        <DraftControls />
      </div>
      <Footer />
      <StartupDraftModal />
    </DraftProvider>
  )
}
