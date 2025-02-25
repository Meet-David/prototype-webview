import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import ToggleButton from '../components/ToggleButton'
import { useProfileStore, generateProfileId } from '../store/profileStore'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
`

const Title = styled.h1`
  font-size: 2em;
  text-align: center;
  margin-bottom: 2rem;
  color: #213547;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`

const PhotoUpload = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 75px;
  border: 2px dashed #ddd;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
  position: relative;

  &:hover {
    border-color: #646cff;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const PhotoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 24px;
    height: 24px;
    stroke: white;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  color: #213547;
  font-size: 1em;
`

const ErrorText = styled.span`
  color: #ff4646;
  font-size: 0.9em;
  margin-top: 4px;
`

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  age: yup.number()
    .required('Age is required')
    .min(18, 'Must be at least 18 years old')
    .max(100, 'Invalid age'),
  sex: yup.string().oneOf(['male', 'female']).required('Sex is required'),
  photoData: yup.string().required('Profile photo is required'),
}).required()

type FormData = yup.InferType<typeof schema>

const ProfileSetup = () => {
  const navigate = useNavigate()
  const profile = useProfileStore(state => state.profile)
  const setProfile = useProfileStore(state => state.setProfile)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { control, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      age: profile?.age || undefined,
      sex: profile?.sex || 'male',
      photoData: profile?.photoData || '',
    }
  })

  useEffect(() => {
    // If editing existing profile, preserve additional photos
    if (profile?.photoData && !watch('photoData')) {
      setValue('photoData', profile.photoData)
    }
  }, [profile, setValue, watch])

  const photoData = watch('photoData')

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (file) {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError('photoData', {
          type: 'manual',
          message: 'Please upload a valid image file (JPEG, PNG, or GIF)'
        })
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError('photoData', {
          type: 'manual',
          message: 'Image size should be less than 5MB'
        })
        return
      }

      try {
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        setValue('photoData', base64String)
      } catch {
        setError('photoData', {
          type: 'manual',
          message: 'Failed to process the image'
        })
      }
    }
  }

  const onSubmit = (data: FormData) => {
    setProfile({
      ...data,
      id: generateProfileId(data.firstName, data.lastName, data.age, data.sex),
      additionalPhotoData: profile?.additionalPhotoData || [],
    })
    navigate('/photo-setup')
  }

  return (
    <Container>
      <Title>{profile ? 'Edit Profile' : 'Create Your Profile'}</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handlePhotoChange}
        />
        <PhotoUpload onClick={handlePhotoClick}>
          {photoData ? (
            <>
              <img src={photoData} alt="Profile" />
              <PhotoOverlay>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3"/>
                </svg>
              </PhotoOverlay>
            </>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <path d="M12 20v-8m0 0l-4 4m4-4l4 4M9 4h6l2 2h4a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1h4l2-2z"/>
            </svg>
          )}
        </PhotoUpload>
        {errors.photoData && <ErrorText>{errors.photoData.message}</ErrorText>}

        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextInput
              label="First Name"
              error={errors.firstName?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Last Name"
              error={errors.lastName?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="age"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Age"
              type="number"
              error={errors.age?.message}
              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
              value={field.value || ''}
            />
          )}
        />

        <FormGroup>
          <Label>Sex</Label>
          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <ToggleButton
                value={field.value as 'male' | 'female'}
                onChange={field.onChange}
              />
            )}
          />
          {errors.sex && <ErrorText>{errors.sex.message}</ErrorText>}
        </FormGroup>

        <Button
          type="submit"
          variant="primary"
          width="100%"
          style={{ marginTop: 'auto' }}
        >
          Next
        </Button>
      </Form>
    </Container>
  )
}

export default ProfileSetup 