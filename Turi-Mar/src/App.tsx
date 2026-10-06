import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import PersonalizaExperiencia from './pages/PersonalizaExperiencia'
import TurimarLanding from './pages/TurimarLanding'
import { supabase } from './supabaseClient'
import { generarRutaIA } from './services/routeService'

type ScreenState = 'landing' | 'personalize' | 'dashboard'

type RouteData = {
  titulo_ruta: string
  descripcion: string
  duracion_total_horas: number
  presupuesto_total_estimado: number
  paradas: Array<unknown>
  tramos: Array<unknown>
}

function App() {
  const [screen, setScreen] = useState<ScreenState>('landing')
  const [loading, setLoading] = useState(true)
  const [generatingRoute, setGeneratingRoute] = useState(false)
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [routeError, setRouteError] = useState('')

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

  const completePersonalization = async (preferences = {}) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      localStorage.setItem(`has_personalized_${user.id}`, 'true')
    }

    setGeneratingRoute(true)
    setRouteError('')

    try {
      const generatedRoute = await generarRutaIA(preferences)
      setRouteData(generatedRoute)
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : 'No se pudo generar la ruta')
    } finally {
      setGeneratingRoute(false)
    }

    setScreen('dashboard')
  }

  const handleLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const hasPersonalized = localStorage.getItem(`has_personalized_${user.id}`)
    setScreen(hasPersonalized ? 'dashboard' : 'personalize')
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

  if (generatingRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-4xl animate-pulse">◌</p>
          <p className="mt-4">Nuestra IA está diseñando tu ruta ideal...</p>
          <small className="text-slate-400">Esto puede tardar unos segundos.</small>
        </div>
      </div>
    )
  }

  if (screen === 'personalize') {
    return <PersonalizaExperiencia
      onContinue={completePersonalization}
      onSkip={() => completePersonalization({})}
    />
  }

  if (screen === 'dashboard') {
    return (
      <Dashboard
        onLogout={handleLogout}
        rutaData={routeData}
        routeError={routeError}
      />
    )
  }

  return <TurimarLanding onLogin={handleLogin} />
}

export default App
