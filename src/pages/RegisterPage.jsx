import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { isAuthenticated, isBootstrapping, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isBootstrapping) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard/products" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await register(form);

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setError('');
    navigate('/dashboard/products', { replace: true });
  };

  return (
    <main className="auth-layout">
      <section className="card auth-card" aria-label="Formulario de registro">
        <span className="eyebrow">Control Center</span>
        <h1>Crear cuenta</h1>
        <p className="auth-copy">
          Registra un usuario nuevo usando el servicio del backend y entra directo
          al dashboard de productos.
        </p>
        <div className="auth-hint">
          <span>API</span>
          <strong>El registro consume `POST /api/auth/register`</strong>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Shenick"
          />

          <label htmlFor="email">Correo</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="shenick@example.com"
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimo 6 caracteres"
          />

          {error ? <p className="error-message">{error}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-switch">
          Ya tienes cuenta? <Link to="/login">Inicia sesion aqui</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
