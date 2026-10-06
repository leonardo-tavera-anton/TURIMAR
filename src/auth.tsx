import React, { useState } from 'react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Endpoint de tu servidor Rust/Axum en Render
    const endpoint = isLogin
      ? 'https://turimar-backend.onrender.com/api/v1/usuarios/login'
      : 'https://turimar-backend.onrender.com/api/v1/usuarios';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      setMessage({
        text: isLogin ? '¡Inicio de sesión exitoso!' : '¡Registro exitoso!',
        isError: false,
      });

      // Si es login y recibes un token o datos de usuario, los puedes guardar aquí
      if (isLogin && data.token) {
        localStorage.setItem('token', data.token);
      }

      setEmail('');
      setPassword('');
    } catch (err: any) {
      setMessage({
        text: err.message || 'Ocurrió un error al conectar con el servidor',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sección Izquierda - Panel Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 p-12 flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="bg-white text-blue-900 font-black px-2 py-1 rounded text-xl">TM</span>
            <span className="font-bold text-2xl tracking-wide">Turi-Mar</span>
          </div>
          <p className="text-blue-200 text-sm tracking-widest uppercase mb-4">Turismo & Gastronomía Local</p>
          <h1 className="text-5xl font-black leading-tight mb-6">
            Descubre los sabores ocultos del mar
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Rutas gastronómicas, huariques auténticos y puntos históricos costeros — todo en un solo mapa.
          </p>
        </div>

        <div className="relative z-10 text-xs text-blue-300">
          © {new Date().getFullYear()} Turi-Mar. Todos los derechos reservados.
        </div>
      </div>

      {/* Sección Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? 'Inicia Sesión en Turi-Mar' : 'Crea tu cuenta en Turi-Mar'}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              {isLogin
                ? 'Ingresa tus credenciales para acceder a tu cuenta'
                : 'Regístrate para comenzar la aventura (Mín. 8 caracteres)'}
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-md text-sm ${
                message.isError
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-green-500/10 border border-green-500/20 text-green-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition duration-200"
            >
              {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
              }}
              className="text-blue-400 hover:underline font-medium"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}