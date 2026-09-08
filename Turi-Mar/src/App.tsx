import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import PersonalizaExperiencia from './pages/PersonalizaExperiencia'
import TurimarLanding from './pages/TurimarLanding'
import Auth from './components/auth' // Importado con "a" minúscula igual que tu archivo
import { supabase } from './supabaseClient'

// Agregamos 'auth' a tus tipos de pantalla
type ScreenState = 'landing' | 'auth' | 'personalize' | 'dashboard'

function App() {
  const [screen, setScreen] = useState<ScreenState>('landing')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Verificar si ya hay una sesión activa en Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) setScreen('dashboard')
      setLoading(false)
    })

    // 2. Escuchar cuando el usuario se loguea o cierra sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser && screen === 'auth') {
        setScreen('personalize')
      } else if (!currentUser) {
        setScreen('landing')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [screen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setScreen('landing')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Cargando Turi-Mar...</p>
      </div>
    )
  }

  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button
          onClick={() => setScreen('landing')}
          className="mb-4 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Volver a la página principal
        </button>
        <Auth />
      </div>
    )
  }

  if (screen === 'personalize') {
    return (
      <PersonalizaExperiencia
        onContinue={() => setScreen('dashboard')}
        onSkip={() => setScreen('dashboard')}
      />
    )
  }

  if (screen === 'dashboard') {
    return <Dashboard onPinClick={() => undefined} onLogout={handleLogout} />
  }

  return <TurimarLanding onLogin={() => setScreen(user ? 'dashboard' : 'auth')} />
}

export default App