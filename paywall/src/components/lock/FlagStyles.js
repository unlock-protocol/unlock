import styled from 'styled-components'
import Media from '../../theme/media'

export const OptimisticFlag = styled.div`
  height: 80px;
  width: 120px;
  float: right;
  box-shadow: 14px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  ${Media.phone`
    justify-self: center;
    box-shadow: 14px 0px 40px rgba(0, 0, 0, 0.14);
  `}
`

export const OptimisticLogo = styled.div`
  position: absolute;
  top: 26px;
  left: -14px;
  height: 28px;
  width: 28px;
`

export const ProgressBar = styled.div`
  width: 74px;
  height: 8px;
  background: var(--lightgrey);
  position: relative;
`

export const Progress = styled(ProgressBar)`
  position: absolute;
  background: ${({ confirmations, requiredConfirmations }) => {
    if (confirmations >= requiredConfirmations) {
      return 'var(--green)}'
    }
    return 'var(--yellow)}'
  }};
  width: ${({ confirmations, requiredConfirmations }) => {
    const width = Math.min(
      Math.floor(confirmations * (74 / requiredConfirmations)),
      74
    )
    return `${width}px`
  }};
`

export const FlagContent = styled.div`
  display: flex;
  width: 74px;
  flex-direction: column;
  margin-left: 14px;
  font-size: 12px;
  & > p {
    text-align: center;
    margin-bottom: 3px;
  }
`
