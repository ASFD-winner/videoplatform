import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videosAPI } from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: '', status: 'published',
    video_file: null, thumbnail: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    videosAPI.getCategories().then(res => setCategories(res.data.results || res.data || []));
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setFile = (field) => (e) => setForm({ ...form, [field]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.video_file) { setError('Выберите видеофайл'); return; }
    if (!form.title.trim()) { setError('Введите название'); return; }
    setError(''); setLoading(true); setProgress(10);

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('status', form.status);
    if (form.category) data.append('category', form.category);
    data.append('video_file', form.video_file);
    if (form.thumbnail) data.append('thumbnail', form.thumbnail);

    try {
      setProgress(40);
      const res = await videosAPI.create(data);
      setProgress(100);
      navigate(`/video/${res.data.id}`);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.video_file?.[0] || d?.title?.[0] || d?.detail || 'Ошибка загрузки');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, maxWidth: 680 }}>
      <h1 className="page-title">Загрузить видео</h1>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 28, border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Название *</label>
            <input type="text" required maxLength={255} value={form.title} onChange={set('title')} placeholder="Введите название видео" />
          </div>
          <div className="form-group">
            <label className="form-label">Описание</label>
            <textarea
              rows={4} value={form.description} onChange={set('description')}
              placeholder="Расскажите о видео..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select value={form.category} onChange={set('category')}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)', padding: '10px 14px', width: '100%' }}>
                <option value="">Без категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Доступность</label>
              <select value={form.status} onChange={set('status')}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)', padding: '10px 14px', width: '100%' }}>
                <option value="published">Публичное</option>
                <option value="private">Приватное</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Видеофайл *</label>
            <input type="file" accept="video/*" onChange={setFile('video_file')}
              style={{ padding: '8px 0', border: 'none', background: 'none', color: 'var(--text-secondary)' }} />
            {form.video_file && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {form.video_file.name} ({(form.video_file.size / 1024 / 1024).toFixed(1)} МБ)
            </p>}
          </div>
          <div className="form-group">
            <label className="form-label">Превью (необязательно)</label>
            <input type="file" accept="image/*" onChange={setFile('thumbnail')}
              style={{ padding: '8px 0', border: 'none', background: 'none', color: 'var(--text-secondary)' }} />
          </div>

          {loading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ background: 'var(--accent)', height: '100%', width: `${progress}%`, transition: 'width 0.4s' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Загрузка...</p>
            </div>
          )}

          {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Загрузка...' : '⬆ Опубликовать'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
