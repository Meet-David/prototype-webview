import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Button from '../components/Button'
import Slider from '../components/Slider'

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

const TopSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10%;
`

const Title = styled.h1`
  font-size: 2em;
  text-align: center;
  margin-bottom: 2rem;
  color: #213547;
`

const SliderSection = styled.div`
  width: 100%;
  max-width: 300px;
  margin-top: 2rem;
`

const BottomSection = styled.div`
  width: 100%;
  padding-bottom: 40px;
  display: flex;
  justify-content: center;
`

const GroupMatchCriteria = () => {
  const navigate = useNavigate()
  const [ageRange, setAgeRange] = useState({ min: 20, max: 30 })
  const [distance, setDistance] = useState(5)
  const [groupSize, setGroupSize] = useState(3)
  const [chatTime, setChatTime] = useState(15)

  const handleBack = () => {
    navigate('/')
  }

  const handleConfirm = () => {
    const params = new URLSearchParams({
      ageMin: ageRange.min.toString(),
      ageMax: ageRange.max.toString(),
      distance: distance.toString(),
      groupSize: groupSize.toString(),
      chatTime: chatTime.toString()
    }).toString()

    navigate(`/waiting-match?${params}`)
  }

  return (
    <Container>
      <BackButton onClick={handleBack}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </BackButton>
      <TopSection>
        <Title>Set Your Preferences</Title>
        <SliderSection>
          <Slider
            isRange
            label="Age Range"
            minValue={ageRange.min}
            maxValue={ageRange.max}
            min={18}
            max={50}
            step={1}
            unit=" years"
            onChange={(min, max) => setAgeRange({ min, max })}
          />
          <Slider
            label="Distance"
            value={distance}
            min={1}
            max={50}
            step={1}
            unit=" km"
            onChange={setDistance}
          />
          <Slider
            label="Group Size"
            value={groupSize}
            min={2}
            max={6}
            step={1}
            unit=" people"
            onChange={setGroupSize}
          />
          <Slider
            label="Chat Time"
            value={chatTime}
            min={5}
            max={30}
            step={5}
            unit=" min"
            onChange={setChatTime}
          />
        </SliderSection>
      </TopSection>
      <BottomSection>
        <Button 
          variant="primary"
          width="80%"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </BottomSection>
    </Container>
  )
}

export default GroupMatchCriteria 