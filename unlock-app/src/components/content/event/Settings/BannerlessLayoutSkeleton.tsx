import { SmallPrimeCard } from '~/components/interface/prime/PrimeOnly'
import { useUnlockPrime } from '~/hooks/useUnlockPrime'

interface BannerlessLayoutSkeletonProps {
  selectedLayout: string
  handleSelect: () => void
}

export const BannerlessLayoutSkeleton = ({
  selectedLayout,
  handleSelect,
}: BannerlessLayoutSkeletonProps) => {
  const { isPrime } = useUnlockPrime()

  const disabled = !isPrime
  const colors = {
    bg: disabled ? 'bg-slate-100' : 'bg-slate-200',
    box1: disabled ? 'bg-slate-200' : 'bg-slate-300',
    box2: disabled ? 'bg-slate-300' : 'bg-slate-400',
  }
  const buttonClasses = disabled
    ? ''
    : `cursor-pointer  ${selectedLayout === 'bannerless' ? 'border-ui-main-500' : ''}`
  return (
    <div className="flex flex-col">
      <p className={disabled ? 'text-slate-400' : ''}>Bannerless</p>
      <div
        className={`h-full border-4 rounded-lg overflow-hidden ${buttonClasses}`}
        onClick={!disabled ? () => handleSelect() : () => {}}
      >
        <div className="h-full relative">
          {!isPrime && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <SmallPrimeCard />
            </div>
          )}

          <div className="relative h-full">
            <div
              className={`h-full w-full flex justify-around sm:w-64 ${colors.bg} p-4`}
            >
              <div className="w-2/3 h-full">
                <div className={`h-4  rounded w-3/4 mb-2 ${colors.box1}`}></div>
                <div className={`h-4  rounded w-3/4 mb-2 ${colors.box1}`}></div>
                <div className={`h-4  rounded w-3/4 mb-2 ${colors.box1}`}></div>
                <div className={`h-4  rounded w-3/4 mb-2 ${colors.box1}`}></div>
                <div className={`h-4  rounded w-1/2 ${colors.box1}`}></div>
              </div>
              <div className="w-1/3 h-full flex flex-col justify-between">
                <div
                  className={`aspect-h-1 aspect-w-1 ${colors.box2} rounded-lg mb-2`}
                ></div>
                <div
                  className={`h-2/3 min-h-10 ${colors.box1} rounded-lg`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
