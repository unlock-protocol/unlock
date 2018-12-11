import React from 'react'
import styled from 'styled-components'
import PreviousButtons from './Previous'
import NextButtons from './Next'
import PageNumbers from './PageNumbers'

class Paginate extends React.Component {
  constructor(props) {
    super(props)
    const itemCount = props.items.length,
      itemsPerPage = 10
    this.state = {
      currentPage: 1,
      itemsPerPage: itemsPerPage,
      count: itemCount,
      numberOfPages: Math.ceil(itemCount / itemsPerPage),
    }
  }

  itemList = () => {
    const { currentPage, itemsPerPage } = this.state
    const { items, renderItems } = this.props
    return renderItems(
      [...items].splice((currentPage - 1) * itemsPerPage, itemsPerPage)
    )
  }

  goToPage = page => {
    this.setState(state => {
      return {
        ...state,
        currentPage: page,
      }
    })
  }

  render() {
    const { count } = this.state
    return (
      <PaginationWrapper>
        {this.itemList()}
        <LockDivider />
        {count > 10 && (
          <Pagination>
            <PreviousButtons {...this.state} goToPage={this.goToPage} />
            <PageNumbers {...this.state} goToPage={this.goToPage} />
            <NextButtons {...this.state} goToPage={this.goToPage} />
          </Pagination>
        )}
      </PaginationWrapper>
    )
  }
}

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-left: 48px;
  margin-right: 8px;
`

const PaginationWrapper = styled.div`
  margin-top: 20px;
`

export const ArrowGroup = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  color: #72accf;
  font-weight: bold;
`

export const LeftArrow = styled.div`
  margin-right: 20px;
`

export const RightArrow = styled.div`
  margin-left: 20px;
`

export const PageGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: spread
  cursor: pointer;
  color: #72ACCF;
  font-weight: bold;
`

export const PageNumber = styled.div`
  margin: 0 10px;
  cursor: pointer;
`

export const PageNumberActive = styled.div`
  margin: 0 10px;
  color: red;
`

export const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
  margin-bottom: 10px;
`

export default Paginate
