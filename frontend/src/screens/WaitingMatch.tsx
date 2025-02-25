import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Lottie from 'react-lottie'
import walkingAnimation from '../assets/walking-in-city.json' // You'll need to add this animation file
import { useWebSocket } from '../contexts/WebSocketContext'
import { useProfileStore } from '../store/profileStore'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  align-items: center;
  justify-content: center;
`

const LogoContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;

  img {
    width: 100px;
    height: 100px;
    position: absolute;
    z-index: 2;
  }
`

const Message = styled.p`
  font-size: 1.2em;
  text-align: center;
  color: #213547;
  margin-top: 2rem;
  line-height: 1.6;
`

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: walkingAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const WaitingMatch = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { createGroup, cancelGroup } = useWebSocket()
  const profile = useProfileStore(state => state.profile)
  const groupIdRef = useRef<string | null>(null)

  const ageMin = Number(searchParams.get('ageMin'))
  const ageMax = Number(searchParams.get('ageMax'))
  const distance = Number(searchParams.get('distance'))
  const groupSize = Number(searchParams.get('groupSize'))
  const chatTime = Number(searchParams.get('chatTime'))

  useEffect(() => {
    if (!profile) {
      navigate('/profile-setup')
      return
    }

    const handleBeforeUnload = () => {
      if (groupIdRef.current) {
        cancelGroup(groupIdRef.current, profile.id)
      }
    }

    // Create group when component mounts
    createGroup(
      profile.id,
      { min: ageMin, max: ageMax },
      distance,
      groupSize,
      chatTime
    )

    // Add cleanup for page unload
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (groupIdRef.current) {
        cancelGroup(groupIdRef.current, profile.id)
      }
    }
  }, [profile, ageMin, ageMax, distance, groupSize, chatTime, createGroup, cancelGroup, navigate])

  // Listen for WebSocket messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'group_created') {
          groupIdRef.current = data.groupId
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <Container>
      <LogoContainer>
        <Lottie 
          options={defaultOptions}
          height={200}
          width={200}
        />
      </LogoContainer>
      <Message>
        Let's see who we bump into...
      </Message>
    </Container>
  )
}

export default WaitingMatch 