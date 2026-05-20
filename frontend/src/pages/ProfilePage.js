import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI, videosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !id || (me && String(me.id) === String(id));

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatar: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const profilePromise = isOwnProfile ? authAPI.getProfile() : authAPI.getUserById(id);
    const videosPromise = isOwnProfile ? videosAPI.getMyVideos() : videosAPI.getUserVideos(id);
    Promise.all([profilePromise, videosPromise]).then(([p, v]) => {
      setProfile(p.data);
      setVideos(v.data.results || v.data);
      setEditForm({ username: p.data.username, bio: p.data.bio || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, isOwnProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const data = new FormData();
    data.append('username', editForm.username);
    data.append('bio', editForm.bio);
    if (editForm.avatar) data.append('avatar', editForm.avatar);
    try {
      await authAPI.updateProfile(data);
      const res = await authAPI.getProfile();
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.username?.[0] || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile) return <div className="container" style={{paddingTop:40}}>Пользователь не найден</div>;

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      {/* Profile Header */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24, border: '1px solid var(--border)' }}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="form-group">
                  <label className="form-label">Имя пользователя</label>
                  <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">О себе</label>
                  <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Аватар</label>
                  <input type="file" accept="image/*" onChange={e => setEditForm({...editForm, avatar: e.target.files[0]})}
                    style={{ padding: '4px 0', border: 'none', background: 'none', color: 'var(--text-secondary)' }} />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Отмена</button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{profile.username}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0' }}>{profile.email}</p>
              {profile.bio && <p style={{ fontSize: 14, marginTop: 8, color: 'var(--text-secondary)' }}>{profile.bio}</p>}
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                {profile.videos_count} видео · Зарегистрирован {new Date(profile.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
            {isOwnProfile && (
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏ Редактировать</button>
            )}
          </div>
        )}
      </div>

      {/* Videos */}
      <h2 className="page-title">{isOwnProfile ? 'Мои видео' : `Видео пользователя`}</h2>
      {videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <p>Видео ещё нет</p>
          {isOwnProfile && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/upload')}>
              Загрузить видео
            </button>
          )}
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
