import { Component } from 'react'
import Icon from './ui/Icon'
import Button from './ui/Button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-page px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-danger">
              <Icon name="AlertTriangle" size={32} />
            </div>
            <h2 className="heading-display text-2xl text-ink">Something went wrong</h2>
            <p className="mb-6 mt-2 text-sm text-sub">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <Button onClick={() => window.location.reload()} icon="RefreshCw">
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
