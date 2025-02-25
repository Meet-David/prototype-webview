import styled from 'styled-components'

interface ToggleButtonProps {
  selected: boolean;
}

const ToggleContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`

const ToggleOption = styled.button<ToggleButtonProps>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid ${props => props.selected ? '#646cff' : '#ddd'};
  background-color: ${props => props.selected ? '#646cff' : 'white'};
  color: ${props => props.selected ? 'white' : '#213547'};
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #646cff;
  }
`

interface Props {
  value: 'male' | 'female';
  onChange: (value: 'male' | 'female') => void;
}

const ToggleButton: React.FC<Props> = ({ value, onChange }) => {
  return (
    <ToggleContainer>
      <ToggleOption
        selected={value === 'male'}
        onClick={() => onChange('male')}
      >
        Male
      </ToggleOption>
      <ToggleOption
        selected={value === 'female'}
        onClick={() => onChange('female')}
      >
        Female
      </ToggleOption>
    </ToggleContainer>
  )
}

export default ToggleButton 