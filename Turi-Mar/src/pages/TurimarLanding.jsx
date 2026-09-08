import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TurimarLanding({ onLogin }) {
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
      // Validación estricta de contraseña para el registro
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

      if (!passwordRegex.test(password)) {
        setMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un signo especial.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Correo o contraseña errones. Por favor, verifica tus credenciales.');
        onLogin();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-white">
      {/* Lado izquierdo: Información y diseño */}
      <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-between bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950">
        <div>
          <div className="flex items-center space-x-2 mb-12">
            <span className="bg-blue-600 px-3 py-1 rounded font-bold text-lg">TM</span>
            <span className="text-xl font-semibold tracking-wide">Turi-Mar</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-blue-400 mb-2 font-semibold">
            Turismo & Gastronomía Local
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Descubre los sabores ocultos del mar
          </h1>
          <p className="text-slate-300 text-lg max-w-lg mb-8">
            Rutas gastronómicas, huariques auténticos y puntos históricos costeros — todo en un solo mapa.
          </p>
        </div>

        <div className="flex space-x-12 pt-6 border-t border-slate-800">
          <div>
            <p className="text-3xl font-bold text-white">142+</p>
            <p className="text-xs text-slate-400">NEGOCIOS</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">38</p>
            <p className="text-xs text-slate-400">RUTAS PARA EXPLORAR</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">4.9 ★</p>
            <p className="text-xs text-slate-400">VALORACIÓN</p>
          </div>
        </div>
      </div>

      {/* Lado derecho: Formulario funcional de Autenticación integrado */}
      <div className="md:w-5/12 bg-white text-slate-800 p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isSignUp ? 'Crea tu cuenta en Turi-Mar' : 'Iniciar Sesión'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isSignUp ? 'Regístrate para comenzar la aventura (Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 signo)' : 'Ingresa tus datos para continuar'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && (
              <div className="p-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null);
              }}
              className="font-semibold text-blue-600 hover:underline ml-1"
            >
              {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}