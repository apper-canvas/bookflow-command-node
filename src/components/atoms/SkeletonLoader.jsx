const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const renderCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex space-x-4">
        <div className="w-16 h-20 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )

  const renderListSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  )

  const renderRowSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 py-3">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-16 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  const skeletonTypes = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    row: renderRowSkeleton
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {skeletonTypes[type]()}
        </div>
      ))}
    </div>
  )
}

export default SkeletonLoader