import styled from 'styled-components'

interface ButtonProps {
  width?: string;
  variant?: 'primary' | 'secondary';
}

const StyledButton = styled.button<ButtonProps>`
  width: ${props => props.width || 'auto'};
  border-radius: 12px;
  border: none;
  padding: 16px 24px;
  font-size: 1.1em;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background-color: #646cff;
    color: white;

    &:hover {
      background-color: #535bf2;
      transform: translateY(-2px);
    }
  ` : `
    background-color: #f0f0f0;
    color: #213547;

    &:hover {
      background-color: #e0e0e0;
      transform: translateY(-2px);
    }
  `}

  &:active {
    transform: translateY(0);
  }

  &:focus,
  &:focus-visible {
    outline: 2px solid #646cff;
    outline-offset: 2px;
  }
`

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<Props> = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  )
}

export default Button 