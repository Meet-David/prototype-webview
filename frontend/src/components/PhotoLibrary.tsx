import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  padding: 12px;

  @media (min-width: 400px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const PhotoCell = styled.div<{ isAdd?: boolean }>`
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: ${props => props.isAdd ? '#f5f5f5' : 'white'};
  border: 2px dashed ${props => props.isAdd ? '#ddd' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #646cff;
  }
`

const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const AddButton = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;

  svg {
    width: 24px;
    height: 24px;
  }
`

const PhotoOverlay = styled.div<{ isMain?: boolean }>`
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

  ${props => props.isMain && `
    &::after {
      content: 'Main Photo';
      position: absolute;
      bottom: 8px;
      left: 8px;
      color: white;
      font-size: 0.8em;
      background: rgba(0, 0, 0, 0.5);
      padding: 4px 8px;
      border-radius: 4px;
    }
  `}

  &:hover {
    opacity: 1;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: white;
  }
`

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  &:hover {
    background: rgba(255, 0, 0, 0.5);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

interface Props {
  photos: string[]
  isEditable?: boolean
  onAddPhoto?: () => void
  onDeletePhoto?: (index: number) => void
  mainPhotoIndex?: number
}

const PhotoLibrary: React.FC<Props> = ({
  photos,
  isEditable = false,
  onAddPhoto,
  onDeletePhoto,
  mainPhotoIndex = 0,
}) => {
  return (
    <Grid>
      {photos.map((photo, index) => (
        <PhotoCell key={index}>
          <Photo src={photo} alt={`Photo ${index + 1}`} />
          {isEditable && (
            <PhotoOverlay isMain={index === mainPhotoIndex}>
              {onDeletePhoto && index !== mainPhotoIndex && (
                <DeleteButton onClick={() => onDeletePhoto(index)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M6 18L18 6"/>
                  </svg>
                </DeleteButton>
              )}
            </PhotoOverlay>
          )}
        </PhotoCell>
      ))}
      {isEditable && onAddPhoto && (
        <PhotoCell isAdd onClick={onAddPhoto}>
          <AddButton>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </AddButton>
        </PhotoCell>
      )}
    </Grid>
  )
}

export default PhotoLibrary 