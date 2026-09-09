import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import PersonalizaExperiencia from './pages/PersonalizaExperiencia'
import TurimarLanding from './pages/TurimarLanding'
import { supabase } from './supabaseClient'

type ScreenState = 'landing' | 'personalize' | 'dashboard'

function App() {
  const [screen, setScreen] = useState<ScreenState>('landing')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const hasPersonalized = localStorage.getItem(`has_personalized_${user.id}`)
        setScreen(hasPersonalized ? 'dashboard' : 'personalize')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const hasPersonalized = localStorage.getItem(`has_personalized_${session.user.id}`)
        setScreen(hasPersonalized ? 'dashboard' : 'personalize')
      } else if (event === 'SIGNED_OUT') {
        setScreen('landing')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const completePersonalization = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      localStorage.setItem(`has_personalized_${user.id}`, 'true')
    }
    setScreen('dashboard')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setScreen('landing')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="animate-pulse">Cargando Turi-Mar...</p>
      </div>
    )
  }

  if (screen === 'personalize') {
    return <PersonalizaExperiencia onContinue={completePersonalization} onSkip={completePersonalization} />
  }

  if (screen === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />
  }

  return <TurimarLanding onLogin={() => setScreen('dashboard')} />
}

export default App
