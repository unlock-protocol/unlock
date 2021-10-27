import { render, screen, waitFor } from '@testing-library/react';
import user  from '@testing-library/user-event'
import '@testing-library/jest-dom/extend-expect'
import Forms from '../components/Forms';

describe('Unlock paywall', () => {
 
  const onSubmit = jest.fn();
  
  beforeEach(() => {
    onSubmit.mockClear();
   render(<Forms onSubmit={onSubmit} />);
  });

  it('If lock address field is empty will call a required validation', async () => {
    
    clickSubmit()
    await waitFor(()=>
      expect(screen.queryByTestId('locksAddressError0')).toHaveTextContent("Required"), 
    )
  })

  it('No more than 1 lock', async ()=> {
    //In this state there is only 1 lock = {'locksAddress0'}
    expect(screen.queryByTestId('locksAddress1')).toBeNull()
  })
  

  it('Adding Multiple locks', async () => {
   //Add 1 more lock
    clickAddLock()
    //Adding 1 more(3 with this one)
    clickAddLock()
    await waitFor(() =>
    //Click 1 time and there is 2 locks slots now
  
      expect(screen.getByTestId('locksAddress0')).toBeInTheDocument(),
      expect(screen.getByTestId('locksAddress1')).toBeInTheDocument(),
      expect(screen.getByTestId('locksAddress2')).toBeInTheDocument()
      )
  })

  it('form with no metadata', async () => {
    //the forms has no metada field
    await waitFor(()=>{
      expect(screen.queryByTestId('metadataTypes0')).toBeNull()
    })
  })

  it('Adding multiple metadata', async () => {
    //adding 2 metadata fields for fill 
    clickAddMetadata()
    const metaName = screen.queryByTestId('metadataName0')
    
    clickAddMoreMeta()
    await waitFor(()=>{
      expect(metaName).toBeInTheDocument()
      expect(screen.getByTestId('metadataName1')).toBeInTheDocument()
    })
    
  })


})

const clickSubmit = () => {
  user.click(screen.getByTestId('submit'))
}

const clickAddLock = () => {
 user.click(screen.getByTestId('AddLocks'))
}

const clickAddMetadata = () => {
  user.click(screen.getByRole('button', {name: /Add metadata/i}))
}

const clickAddMoreMeta = () => {
  user.click(screen.getByTestId('AddMeta'))
}
