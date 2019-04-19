import styled from 'styled-components'
import Media from '../../theme/media'

export const OptimisticLogo = styled.div`
  grid-row 1 / span 2;
  margin-left: -14px;
  align-self: center;
`

export const ProgressBar = styled.div`
  align-self: start;
  width: 74px;
  height: 8px;
  background: var(--lightgrey);
  position: relative;
  grid-column: 2;
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

export const OptimisticFlag = styled.div`
  height: 80px;
  width: 120px;
  float: right;
  box-shadow: 14px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
  margin: auto;
  display: grid;
  grid-template-columns: 25px 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;

  & > p {
    margin-bottom: 5px;
    font-size: 12px;
    text-align: center;
  }

  & > ${Progress}, & > ${ProgressBar} {
    margin-left: 10px;
  }

  ${Media.phone`
    font-size: 10px;
    display: grid;
    height: 60px;
    grid-template-columns: 1.6fr 1fr 1fr;
    grid-template-rows: 60px;
    width: 100%;
    align-items: center;

    & > ${OptimisticLogo} {
      display: none;
    }

    & > ${Progress}, & > ${ProgressBar} {
      align-self: center;
    }

    & > p {
      margin-bottom: inherit;
    }
  `}
`

export const PoweredByUnlock = styled.div`
  display: none;
  ${Media.phone`
    font-size: 10px;
    width: 170px;
    display: grid;
    grid-template-columns: 1fr 18px 1fr;
    grid-template-rows: 1fr;

    font-size: 12px;


    & > div {
      grid-row: 1;
      grid-column: 2;
      margin-left: 0;
      align-self: center;
    }

    & > p {
      width: 100%;
      color: var(--slate);
      grid-row: 1;
      grid-column: 1;
      text-align: right;
      margin: 0;
      align-self: center;
      padding-right: 2px;
    }

    & > a {
      grid-row: 1;
      grid-column: 3;
      justify-self: start;
      align-self: center;
      color: var(--red);
    }
`}
`

export const ConfirmedKeyWrapper = styled.div`
  width: 100%;
  display: flex;
  align-content: center;
  justify-content: center;
  align-self: start;
  ${Media.phone`
    align-self: initial;
  `}
`
