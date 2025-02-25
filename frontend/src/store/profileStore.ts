import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profile {
  id: string
  firstName: string
  lastName: string
  age: number
  sex: 'male' | 'female'
  photoData: string
  additionalPhotoData?: string[]
}

// Helper function to generate a base64 encoded ID from profile information
export const generateProfileId = (firstName: string, lastName: string, age: number, sex: 'male' | 'female'): string => {
  const profileString = `${firstName}-${lastName}-${age}-${sex}`
  return btoa(profileString)
}

interface ProfileStore {
  profile: Profile | null
  setProfile: (profile: Profile) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile: { ...profile, id: generateProfileId(profile.firstName, profile.lastName, profile.age, profile.sex) } }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'profile-storage',
    }
  )
) 

export const generateId = (profile: Profile) => {
  const profileString = `${profile.firstName}-${profile.lastName}-${profile.age}-${profile.sex}`
  return btoa(profileString)
}