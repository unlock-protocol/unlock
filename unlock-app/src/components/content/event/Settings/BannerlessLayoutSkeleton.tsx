interface BannerlessLayoutSkeletonProps {
  selectedLayout: string
  handleSelect: () => void
}

export const BannerlessLayoutSkeleton = ({
  selectedLayout,
  handleSelect,
}: BannerlessLayoutSkeletonProps) => {
  return (
    <div className="flex flex-col">
      <p>Bannerless</p>
      <div
        className={`h-full cursor-pointer border-4 rounded-lg overflow-hidden ${selectedLayout === 'bannerless' ? 'border-ui-main-500' : ''}`}
        onClick={() => handleSelect()}
      >
        <div className="h-full">
          <div className="relative h-full">
            <div className="h-full w-full flex justify-around sm:w-64 bg-slate-200 p-4">
              <div className="w-2/3 h-full">
                <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-300 rounded w-1/2"></div>
              </div>
              <div className="w-1/3 h-full flex flex-col justify-between">
                <div className="aspect-h-1 aspect-w-1 bg-slate-400 rounded-lg mb-2"></div>
                <div className="h-2/3 min-h-10 bg-slate-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
