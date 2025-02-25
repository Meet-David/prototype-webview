import styled from 'styled-components'

const SliderContainer = styled.div`
  width: 100%;
  margin: 20px 0;
`

const Label = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #213547;
  font-size: 1em;
`

const SliderGroup = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
`

const StyledSlider = styled.input`
  position: absolute;
  width: 100%;
  height: 4px;
  background: none;
  outline: none;
  -webkit-appearance: none;
  pointer-events: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background: #646cff;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  &::-webkit-slider-thumb:hover {
    background: #535bf2;
  }
`

const Range = styled.div<{ left: number; right: number }>`
  position: absolute;
  height: 100%;
  background: #646cff;
  border-radius: 2px;
  left: ${props => props.left}%;
  right: ${props => props.right}%;
`

interface BaseSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

interface SingleSliderProps extends BaseSliderProps {
  isRange?: false;
  value: number;
  onChange: (value: number) => void;
}

interface RangeSliderProps extends BaseSliderProps {
  isRange: true;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}

type Props = SingleSliderProps | RangeSliderProps;

const Slider: React.FC<Props> = (props) => {
  if (props.isRange) {
    const { label, minValue, maxValue, min, max, step, unit = '', onChange } = props
    const leftPosition = ((minValue - min) / (max - min)) * 100
    const rightPosition = 100 - ((maxValue - min) / (max - min)) * 100

    return (
      <SliderContainer>
        <Label>
          <span>{label}</span>
          <span>{minValue}-{maxValue}{unit}</span>
        </Label>
        <SliderGroup>
          <Range left={leftPosition} right={rightPosition} />
          <StyledSlider
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (value <= maxValue) {
                onChange(value, maxValue)
              }
            }}
          />
          <StyledSlider
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (value >= minValue) {
                onChange(minValue, value)
              }
            }}
          />
        </SliderGroup>
      </SliderContainer>
    )
  }

  const { label, value, min, max, step, unit = '', onChange } = props as SingleSliderProps

  return (
    <SliderContainer>
      <Label>
        <span>{label}</span>
        <span>{value}{unit}</span>
      </Label>
      <SliderGroup>
        <Range left={0} right={100 - ((value - min) / (max - min)) * 100} />
        <StyledSlider
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </SliderGroup>
    </SliderContainer>
  )
}

export default Slider 