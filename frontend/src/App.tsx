import { useEffect } from 'react'
import styled from 'styled-components'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Home from './screens/Home'
import GroupMatchCriteria from './screens/GroupMatchCriteria'
import ProfileSetup from './screens/ProfileSetup'
import PhotoSetup from './screens/PhotoSetup'
import WaitingMatch from './screens/WaitingMatch'
import GroupScreen from './screens/GroupScreen'
import { useProfileStore } from './store/profileStore'
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketContext'

// Constants for responsive design
const MOBILE_THRESHOLD = '500px'

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
`

const MobileContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  /* On screens larger than mobile threshold */
  @media (min-width: ${MOBILE_THRESHOLD}) {
    width: ${MOBILE_THRESHOLD};
    height: 100vh;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  /* On mobile screens */
  @media (max-width: ${MOBILE_THRESHOLD}) {
    min-height: 100vh;
  }
`

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const profile = useProfileStore(state => state.profile)

  useEffect(() => {
    if (!profile) {
      navigate('/profile-setup')
    }
  }, [profile, navigate])

  return profile ? <>{children}</> : null
}

const AppContent = () => {
  const navigate = useNavigate()
  const ws = useWebSocket()

  useEffect(() => {
    if (!ws) return;

    ws.onGroupFormed((members, groupId, chatTime) => {
      navigate('/group', { state: { members, groupId, chatTime } });
    });
  }, [ws, navigate]);

  return (
    <AppContainer>
      <MobileContainer>
        <Routes>
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/photo-setup" element={<PhotoSetup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/criteria" element={
            <ProtectedRoute>
              <GroupMatchCriteria />
            </ProtectedRoute>
          } />
          <Route path="/waiting-match" element={
            <ProtectedRoute>
              <WaitingMatch />
            </ProtectedRoute>
          } />
          <Route path="/group" element={
            <ProtectedRoute>
              <GroupScreen />
            </ProtectedRoute>
          } />
        </Routes>
      </MobileContainer>
    </AppContainer>
  )
}

function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </BrowserRouter>
  )
}

export default App
