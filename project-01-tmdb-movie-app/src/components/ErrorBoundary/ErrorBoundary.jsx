import { Component } from 'react'

/**
 * ErrorBoundary — catches render errors anywhere in the component tree
 * and shows a fallback UI instead of crashing the whole app.
 *
 * React requires this to be a class component; hooks cannot implement
 * componentDidCatch or getDerivedStateFromError.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  /** Called when a descendant throws during rendering. */
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message }
  }

  /** Log the error for debugging; in production send to an error service. */
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontFamily: 'sans-serif',
          background: '#080810',
          color: '#F0EDE8',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '32px', lineHeight: 1 }}>✦</p>
          <p style={{ fontSize: '20px', fontWeight: 700 }}>Something went wrong</p>
          <p style={{ fontSize: '14px', color: '#5A5A72', maxWidth: '400px' }}>
            {this.state.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              background: '#E8C87A',
              color: '#080810',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
