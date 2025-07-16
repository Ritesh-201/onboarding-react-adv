import { ThemeProvider } from './contexts/ThemeContext'
import Dashboard from './components/dashboard/Dashboard'
import ErrorBoundary from './components/common/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="app">
          <Dashboard />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
