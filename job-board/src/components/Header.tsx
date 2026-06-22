
import { Link, useNavigate } from 'react-router-dom';//powinno byc w liscie
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          PracaCzyniWolnym
        </Link>
        
        <nav className="header__nav">
          <Link to="/jobs" className="header__link">Oferty</Link>
          {user && (
            <>
              <Link to="/dashboard" className="header__link">Panel</Link>
              {profile?.role === 'recruiter' && (
                <Link to="/jobs/new" className="header__link header__link--primary">
                  + Nowa oferta
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="header__auth">
          {user ? (
            <div className="header__user">
              <span className="header__username">{profile?.full_name || user.email}</span>
              <button onClick={handleLogout} className="header__logout">
                Wyloguj
              </button>
            </div>
          ) : (
            <div className="header__auth-links">
              <Link to="/login" className="header__link">Zaloguj</Link>
              <Link to="/register" className="header__link header__link--primary">Rejestracja</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}