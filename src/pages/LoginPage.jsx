import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(form);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    navigate(from, { replace: true });
  };

  return (
    <main className="auth-layout">
      <section className="card auth-card" aria-label="Formulario de inicio de sesi\u00f3n">
        <span className="eyebrow">Control Center</span>
        <h1>Iniciar sesi\u00f3n</h1>
        <p className="auth-copy">
          Ingresa para acceder al dashboard de productos con una vista clara,
          r\u00e1pida y elegante.
        </p>
        <div className="auth-hint">
          <span>Demo</span>
          <strong>Usuario libre + cualquier contrase\u00f1a</strong>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            placeholder="admin"
          />

          <label htmlFor="password">Contrase\u00f1a</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="******"
          />

          {error ? <p className="error-message">{error}</p> : null}

          <button type="submit">Entrar al panel</button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
