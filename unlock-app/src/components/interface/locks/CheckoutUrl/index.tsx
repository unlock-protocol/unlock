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
    <div className="grid grid-cols-5 gap-8 pb-20">
      <div className="col-span-2">
        <div className="flex items-center justify-center w-full h-screen bg-gray-300 rounded-xl">
          <span className="text-sm">preview</span>
        </div>
      </div>
      <div className="flex flex-col col-span-3 gap-4">
        <Header />
        <CheckoutForm />
      </div>
    </div>
  )
}
