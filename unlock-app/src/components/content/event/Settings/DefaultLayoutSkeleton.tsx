interface DefaultLayoutSkeletonProps {
  selectedLayout: string
  handleSelect: () => void
}

export const DefaultLayoutSkeleton = ({
  selectedLayout,
  handleSelect,
}: DefaultLayoutSkeletonProps) => {
  return (
    <div className="flex flex-col">
      <p>Default</p>
      <div
        className={`h-full cursor-pointer border-4  rounded-lg overflow-hidden ${selectedLayout === 'default' ? 'border-ui-main-500' : ''}`}
        onClick={() => handleSelect()}
      >
        <div className="h-full">
          <div className="h-full relative">
            <div className="h-full w-full sm:w-64 bg-slate-200 p-4">
              <div className="h-1/3 min-h-10 bg-slate-300 rounded-lg"></div>
              <div className="w-full h-3/5 flex mt-2">
                <div className="w-2/3 h-2/3">
                  <div className="w-1/3 h-1/3 mb-8">
                    <div className="aspect-h-1 aspect-w-1 bg-slate-400 rounded-lg"></div>
                  </div>
                  <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-300 rounded w-1/2"></div>
                </div>
                <div className="w-1/3 bg-slate-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
