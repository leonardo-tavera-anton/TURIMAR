import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://turimar-backend.onrender.com';

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

    try {
      if (isSignUp) {
        // Petición POST al endpoint de registro en Rust
        const response = await fetch(`${API_URL}/api/v1/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: email.split('@')[0],
            email: email,
            password_hash: password, // o 'password' según lo tengas en tu backend Rust
            rol: 'cliente',
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.message || 'Error al guardar en la base de datos');
        }

        const usuarioCreado = await response.json();
        setMessage('¡Usuario registrado con éxito en public.usuarios!');
        localStorage.setItem('user', JSON.stringify(usuarioCreado));
      } else {
        // Petición POST o GET para Login según tu endpoint de backend
        const response = await fetch(`${API_URL}/api/v1/usuarios/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Credenciales incorrectas o problema de conexión');
        }

        const usuario = await response.json();
        setMessage('¡Sesión iniciada con éxito!');
        localStorage.setItem('user', JSON.stringify(usuario));
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Crear cuenta en Turi-Mar' : 'Iniciar Sesión'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-400 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          {message && (
            <div className="p-3 text-sm bg-blue-900/50 border border-blue-700 rounded-lg text-center">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg transition-colors"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-sm text-slate-400 hover:underline text-center"
        >
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}