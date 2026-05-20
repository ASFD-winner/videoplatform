import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try {
      await register(form);
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.email?.[0] || data?.username?.[0] || data?.password?.[0] ||
        data?.detail || 'Ошибка регистрации'
      );
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({...form, [field]: e.target.value});

  return (
    <div className="container">
      <div className="auth-card">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Имя пользователя</label>
            <input type="text" required value={form.username} onChange={set('username')} placeholder="username" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input type="password" required value={form.password} onChange={set('password')} placeholder="Минимум 8 символов" />
          </div>
          <div className="form-group">
            <label className="form-label">Повторите пароль</label>
            <input type="password" required value={form.password2} onChange={set('password2')} placeholder="••••••••" />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button
            type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--accent)' }}>Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
