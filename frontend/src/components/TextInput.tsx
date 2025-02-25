import styled from 'styled-components'

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

const Label = styled.label`
  color: #213547;
  font-size: 1em;
`

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.hasError ? '#ff4646' : '#ddd'};
  border-radius: 8px;
  font-size: 1em;
  outline: none;
  background-color: white;
  color: #213547;

  &:focus {
    border-color: #646cff;
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`

const ErrorText = styled.span`
  color: #ff4646;
  font-size: 0.9em;
`

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hasError?: boolean;
}

const TextInput: React.FC<Props> = ({
  label,
  error,
  hasError,
  ...props
}) => {
  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <StyledInput hasError={hasError || !!error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  )
}

export default TextInput 