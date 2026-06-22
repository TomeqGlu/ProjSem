import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'candidate' as 'recruiter' | 'candidate'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Błąd tworzenia konta');
      setLoading(false);
      return;
    }

    // 2. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: form.full_name,
        role: form.role,
      });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <h1 className="auth-page__title">Rejestracja</h1>
        
        <form onSubmit={handleSubmit} className="auth-page__form">
          <div className="auth-page__field">
            <label htmlFor="full_name" className="auth-page__label">Imię i nazwisko</label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="auth-page__input"
              required
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="email" className="auth-page__label">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="auth-page__input"
              required
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="password" className="auth-page__label">Hasło (min. 6 znaków)</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="auth-page__input"
              required
              minLength={6}
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="role" className="auth-page__label">Rola</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="auth-page__select"
            >
              <option value="candidate">Kandydat</option>
              <option value="recruiter">Rekruter</option>
            </select>
          </div>

          {error && <p className="auth-page__error">{Array.isArray(error) ? error.join(' ') : error}</p>}
          
          <button type="submit" className="auth-page__submit" disabled={loading}>
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="auth-page__link">
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}