import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">▶</span>
          <span className="navbar__logo-text">YADRO</span>
        </Link>

        <form className="navbar__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Поиск видео..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="navbar__search-btn">🔍</button>
        </form>

        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/upload" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 14px' }}>
                + Загрузить
              </Link>
              <div className="navbar__user" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="navbar__avatar">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" />
                    : <span>{user.username?.[0]?.toUpperCase()}</span>
                  }
                </div>
                {menuOpen && (
                  <div className="navbar__dropdown">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>Мой профиль</Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>Мои видео</Link>
                    <hr />
                    <button onClick={handleLogout}>Выйти</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: 13 }}>Войти</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 14px' }}>
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
