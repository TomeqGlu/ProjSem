import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <h1 className="auth-page__title">Logowanie</h1>
        
        <form onSubmit={handleSubmit} className="auth-page__form">
          <div className="auth-page__field">
            <label className="auth-page__label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="auth-page__input"
              required
            />
          </div>
          
          <div className="auth-page__field">
            <label className="auth-page__label">Hasło</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="auth-page__input"
              required
              minLength={6}
            />
          </div>

          {error && <p className="auth-page__error">{error}</p>}
          
          <button type="submit" className="auth-page__submit" disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className="auth-page__link">
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}