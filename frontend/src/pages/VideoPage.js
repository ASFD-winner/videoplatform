import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { videosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import './VideoPage.css';

const VideoPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    videosAPI.getById(id).then(res => {
      setVideo(res.data);
      setLiked(res.data.is_liked);
      setLikesCount(res.data.likes_count);
      setComments(res.data.comments || []);
      setLoading(false);
      // Load related
      videosAPI.getAll({ page: 1 }).then(r => {
        setRelated((r.data.results || r.data).filter(v => v.id !== res.data.id).slice(0, 8));
      });
    }).catch(() => { setLoading(false); });
  }, [id]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await videosAPI.like(id);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await videosAPI.addComment(id, { text: comment });
      setComments(prev => [res.data, ...prev]);
      setComment('');
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить это видео?')) return;
    await videosAPI.delete(id);
    navigate('/profile');
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!video) return <div className="container" style={{paddingTop:40}}>Видео не найдено</div>;

  return (
    <div className="container videopage">
      <div className="videopage__main">
        {/* Player */}
        <div className="videopage__player">
          <video
            ref={videoRef}
            controls
            src={video.video_url}
            className="videopage__video"
            poster={video.thumbnail_url}
          />
        </div>

        <h1 className="videopage__title">{video.title}</h1>

        {/* Meta row */}
        <div className="videopage__meta">
          <div className="videopage__author" onClick={() => navigate(`/profile/${video.author.id}`)}>
            <div className="video-card__avatar" style={{ width: 36, height: 36, fontSize: 15 }}>
              {video.author.avatar_url
                ? <img src={video.author.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : video.author.username?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{video.author.username}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{video.views_count} просмотров</div>
            </div>
          </div>

          <div className="videopage__actions">
            <button className={`btn ${liked ? 'btn-primary' : 'btn-secondary'}`} onClick={handleLike}>
              ♥ {likesCount}
            </button>
            {user?.id === video.author.id && (
              <button className="btn btn-secondary" onClick={handleDelete} style={{ color: 'var(--accent)' }}>
                🗑 Удалить
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {video.description && (
          <div className="videopage__desc">
            <p>{video.description}</p>
          </div>
        )}

        {/* Comments */}
        <div className="videopage__comments">
          <h3 style={{ marginBottom: 16 }}>Комментарии ({comments.length})</h3>
          {user && (
            <form onSubmit={handleComment} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Написать комментарий..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting || !comment.trim()}>
                {submitting ? '...' : 'Отправить'}
              </button>
            </form>
          )}
          {comments.map(c => (
            <div key={c.id} className="videopage__comment">
              <div className="video-card__avatar" style={{ width: 30, height: 30, fontSize: 12, flexShrink: 0 }}>
                {c.user.avatar_url
                  ? <img src={c.user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : c.user.username?.[0]?.toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.user.username}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{c.text}</div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Комментариев пока нет. Будьте первым!</p>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="videopage__sidebar">
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Похожие видео</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {related.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
