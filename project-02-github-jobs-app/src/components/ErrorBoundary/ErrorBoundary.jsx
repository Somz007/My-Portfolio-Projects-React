import { Component } from 'react'

/**
 * ErrorBoundary — catches render errors anywhere in the component tree
 * and shows a fallback UI instead of crashing the whole app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message }
  }

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
          fontFamily: 'monospace',
          background: '#0D1117',
          color: '#E6EDF3',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '32px', lineHeight: 1 }}>{'</>'}</p>
          <p style={{ fontSize: '20px', fontWeight: 600 }}>Something went wrong</p>
          <p style={{ fontSize: '13px', color: '#7D8590', maxWidth: '400px' }}>
            {this.state.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              background: '#58A6FF',
              color: '#0D1117',
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
