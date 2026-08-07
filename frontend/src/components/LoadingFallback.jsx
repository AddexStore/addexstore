import Spinner from './ui/Spinner'

export default function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" label="Loading..." />
    </div>
  )
}
