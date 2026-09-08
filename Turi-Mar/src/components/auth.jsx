import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('¡Registro exitoso! Revisa tu correo o inicia sesión.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4">
      {/* Contenedor principal con animación de entrada (fade-in y escala suave) */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 transform transition-all duration-500 animate-fadeIn scale-100">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg shadow-blue-500/30">
            Turi-Mar
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isSignUp ? 'Empieza a explorar la costa y sus sabores' : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-white placeholder-slate-500 transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-white placeholder-slate-500 transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <div className="p-3 text-sm font-medium text-blue-300 bg-blue-950/50 border border-blue-800 rounded-xl text-center animate-pulse">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </span>
            ) : (
              isSignUp ? 'Registrarse' : 'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Alternar modo */}
        <div className="mt-8 text-center text-sm text-slate-400">
          {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors ml-1 underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </div>

      </div>
    </div>
  );
}