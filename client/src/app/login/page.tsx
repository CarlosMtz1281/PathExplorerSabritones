"use client";

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function SplitPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'top' | 'bottom'>('top');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goToTop = () => setActiveSection('top');
  const goToBottom = () => setActiveSection('bottom');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/general/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: email,
          password: password
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('sessionId', data.sessionId);
        console.log('Login successful, sessionId:', data.sessionId);
        router.push("/dashboard");
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="relative w-full h-screen overflow-hidden bg-base-200 font-sans">
        {/* Background image container (200% height) */}
        <div 
          className={`absolute top-0 left-0 w-[100vw] h-[200vh] bg-cover bg-center transition-transform duration-700 ease-in-out ${activeSection === 'top' ? 'translate-y-0' : '-translate-y-1/2'}`}
          style={{ backgroundImage: 'url(/AccentureBack.png)' }}
        >

          {/* Top section (100% height) */}
          <div className="absolute top-0 w-full h-screen flex items-center justify-center pb-30">
            <div className="text-center font-[Kantumruy Pro]">
              <h1 className="text-8xl font-bold mb-1 pr-140 text-base-100" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>Path</h1>
              <p className="text-7xl font-light mb-4 pr-40" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>Explorer</p>
              <button 
                onClick={goToBottom}
                className="ml-120 px-12 py-6 bg-accent hover:bg-accent-focus rounded-md transition-all duration-300 text-4xl text-white shadow-md hover:shadow-2xl"
                style={{ 
                  fontFamily: "'Kantumruy Pro', sans-serif",
                  minWidth: '250px'
                }}
              >
                Login
              </button>
            </div>
          </div>

          {/* Bottom section (100% height) */}
          <div className="absolute top-[100vh] w-full h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-bold text-center mb-6 text-secondary">Path Explorer</h2>
              <div className="mb-4">
                <label className="block text-secondary mb-2">Correo</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="email"
                    placeholder="email@accenture.com"
                    className="w-full outline-none px-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-secondary mb-2">Contraseña</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password" 
                    className="w-full outline-none px-2"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-purple-500 text-right cursor-pointer">
                ¿Olvidaste la contraseña?
              </div>
            
              <button 
                onClick={handleLogin}
                disabled={loading}
                className="mt-6 w-full bg-primary text-white py-2 rounded-lg shadow-md hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </button>
              <button
                onClick={goToTop}
                className="mt-4 w-full bg-gray-300 text-black py-2 rounded-lg shadow-md hover:bg-gray-400 transition"
              >
                Regresar
              </button>
              {error && (
                <div className="mt-2 mb-1 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}