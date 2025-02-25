import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import PhotoLibrary from '../components/PhotoLibrary'
import { useProfileStore } from '../store/profileStore'
import { useWebSocket } from '../contexts/WebSocketContext'

interface Member {
  firstName: string
  lastName: string
  photoData: string
  additionalPhotoData?: string[]
}

interface LocationState {
  members: Member[]
  groupId: string
  chatTime: number
}

const Container = styled.div`
  padding: 20px;
  height: 100vh;
  background: #f8f9fa;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Timer = styled.div<{ timeRemaining: number }>`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${props => props.timeRemaining <= 60 ? '#ff4646' : '#646cff'};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.3s;

  svg {
    width: 16px;
    height: 16px;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 800px;
  padding: 0 20px;
`

const ProfileCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const ProfileName = styled.h3`
  margin: 0;
  font-size: 1rem;
  text-align: center;
  color: #333;
`

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  transform: translateY(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;
`

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease-in-out;
  z-index: 999;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #666;

  &:hover {
    color: #333;
  }
`

const GroupScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useProfileStore()
  const ws = useWebSocket()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  const state = location.state as LocationState
  const members = state?.members || []
  const chatTime = state?.chatTime || 0
  const groupId = state?.groupId || ''
  const otherMembers = members.filter(
    member => member.firstName !== profile?.firstName || member.lastName !== profile?.lastName
  )

  useEffect(() => {
    if (!ws) return;

    // Handle group disbanded message
    ws.onGroupDisbanded((disbandedGroupId) => {
      if (disbandedGroupId === groupId) {
        navigate('/')
      }
    });
  }, [ws, groupId, navigate]);

  useEffect(() => {
    if (chatTime) {
      const endTime = Date.now() + chatTime * 60 * 1000
      
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          clearInterval(timer)
          navigate('/')
        }
      }, 1000)

      // Set initial time remaining
      setTimeRemaining(chatTime * 60)

      return () => clearInterval(timer)
    }
  }, [chatTime, navigate])

  const handleProfileClick = (member: Member) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedMember(null), 300) // Clear after animation
  }

  if (!profile || members.length === 0) {
    navigate('/')
    return null
  }

  const formatTime = (seconds: number) => {
    if (seconds > 60) {
      return `${chatTime}min`
    }
    return `${seconds}s`
  }

  return (
    <Container>
      <Timer timeRemaining={timeRemaining}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        {formatTime(timeRemaining)}
      </Timer>

      <Grid>
        {/* Current user's profile */}
        <ProfileCard>
          <ProfileImage src={profile.photoData} alt={`${profile.firstName} ${profile.lastName}`} />
          <ProfileName>{profile.firstName} {profile.lastName}</ProfileName>
        </ProfileCard>

        {/* Other members' profiles */}
        {otherMembers.map((member, index) => (
          <ProfileCard key={index} onClick={() => handleProfileClick(member)}>
            <ProfileImage src={member.photoData} alt={`${member.firstName} ${member.lastName}`} />
            <ProfileName>{member.firstName} {member.lastName}</ProfileName>
          </ProfileCard>
        ))}
      </Grid>

      <Overlay isOpen={isModalOpen} onClick={closeModal} />
      <Modal isOpen={isModalOpen}>
        <ModalHeader>
          <ModalTitle>
            {selectedMember?.firstName} {selectedMember?.lastName}
          </ModalTitle>
          <CloseButton onClick={closeModal}>&times;</CloseButton>
        </ModalHeader>
        {selectedMember && (
          <PhotoLibrary
            photos={[selectedMember.photoData, ...(selectedMember.additionalPhotoData || [])]}
            isEditable={false}
          />
        )}
      </Modal>
    </Container>
  )
}

export default GroupScreen 