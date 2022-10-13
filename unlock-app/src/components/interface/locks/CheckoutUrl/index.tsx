import { CheckoutForm } from './elements/CheckoutForm'

const Header = () => {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Checkout Builder</h1>
      <span className="text-base text-gray-700">
        Easily customize your checkout experience right here.
      </span>
    </header>
  )
}

export const CheckoutUrlPage = () => {
  return (
    <div className="grid grid-cols-5 gap-10">
      <div className="col-span-2">{/* preview component space*/}</div>
      <div className="col-span-3">
        <Header />
        <CheckoutForm />
      </div>
    </div>
  )
}
