import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useWebSocket } from '../contexts/WebSocketContext'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
`

const TopSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 15%;
`

const BottomSection = styled.div`
  width: 100%;
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.h1`
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 2rem;
  color: #213547;
`

const Subtitle = styled.p`
  font-size: 1.1em;
  text-align: center;
  margin-bottom: 1rem;
  color: #666;
  line-height: 1.6;
`

const ConnectionStatus = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 1rem;
  color: ${props => {
    switch (props.status) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
        return '#FFA000';
      default:
        return '#F44336';
    }
  }};
  font-size: 0.9em;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
  }
`

const Home = () => {
  const navigate = useNavigate()
  const { status } = useWebSocket()

  const handleEditProfile = () => {
    navigate('/profile-setup')
  }

  const handleFindNeighborino = () => {
    navigate('/criteria')
  }

  return (
    <Container>
      <TopSection>
        <Title>MeetDavid</Title>
        <Subtitle>
          Find your best friend forever in your neighborhood
        </Subtitle>
        <ConnectionStatus status={status}>
          {status === 'connected' ? 'Online' : status === 'connecting' ? 'Connecting...' : 'Offline'}
        </ConnectionStatus>
      </TopSection>
      <BottomSection>
        <Button 
          variant="secondary"
          width="100%"
          onClick={handleEditProfile}
        >
          Edit Profile
        </Button>
        <Button 
          variant="primary"
          width="100%"
          onClick={handleFindNeighborino}
          disabled={status !== 'connected'}
        >
          Find Neighborino
        </Button>
      </BottomSection>
    </Container>
  )
}

export default Home 