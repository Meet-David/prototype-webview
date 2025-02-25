import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Button from '../components/Button'
import PhotoLibrary from '../components/PhotoLibrary'
import { useProfileStore, generateId } from '../store/profileStore'
import { useWebSocket } from '../contexts/WebSocketContext'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  position: relative;
`

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #213547;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`

const Title = styled.h1`
  font-size: 2em;
  text-align: center;
  margin-bottom: 1rem;
  color: #213547;
`

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
`

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const ButtonContainer = styled.div`
  margin-top: auto;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_PHOTOS = 6;

const PhotoSetup = () => {
  const navigate = useNavigate()
  const profile = useProfileStore(state => state.profile)
  const setProfile = useProfileStore(state => state.setProfile)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { connect } = useWebSocket()

  if (!profile) {
    navigate('/profile-setup')
    return null
  }

  const handleBack = () => {
    navigate('/profile-setup')
  }

  const handleAddPhoto = () => {
    if ((profile.additionalPhotoData?.length || 0) >= MAX_PHOTOS - 1) {
      alert(`Maximum ${MAX_PHOTOS} photos allowed`)
      return
    }
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (file) {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, or GIF)')
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert('Image size should be less than 5MB')
        return
      }

      try {
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        setProfile({
          ...profile,
          additionalPhotoData: [...(profile.additionalPhotoData || []), base64String]
        })
      } catch {
        alert('Failed to process the image')
      }
    }
  }

  const handleDeletePhoto = (index: number) => {
    const newPhotos = [...(profile.additionalPhotoData || [])]
    newPhotos.splice(index - 1, 1) // Subtract 1 because first photo is main photo
    setProfile({
      ...profile,
      additionalPhotoData: newPhotos
    })
  }

  const handleNext = () => {
    connect(
      generateId(profile),
      profile.firstName,
      profile.lastName,
      profile.photoData,
      profile.additionalPhotoData
    );
    navigate('/')
  }

  const allPhotos = [profile.photoData, ...(profile.additionalPhotoData || [])]

  return (
    <Container>
      <BackButton onClick={handleBack}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </BackButton>
      <Title>Add More Photos</Title>
      <Subtitle>Show more of your personality with additional photos</Subtitle>
      <Content>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handlePhotoChange}
        />
        <PhotoLibrary
          photos={allPhotos}
          isEditable
          onAddPhoto={handleAddPhoto}
          onDeletePhoto={handleDeletePhoto}
        />
        <ButtonContainer>
          <Button
            variant="primary"
            width="100%"
            onClick={handleNext}
          >
            {profile.additionalPhotoData?.length ? 'Save Changes' : 'Skip'}
          </Button>
        </ButtonContainer>
      </Content>
    </Container>
  )
}

export default PhotoSetup 