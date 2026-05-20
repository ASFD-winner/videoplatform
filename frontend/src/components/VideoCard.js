import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatDuration = (sec) => {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatViews = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n;
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} дн. назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU');
};

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  return (
    <div className="video-card" onClick={() => navigate(`/video/${video.id}`)}>
      <div className="video-card__thumb">
        {video.thumbnail_url
          ? <img src={video.thumbnail_url} alt={video.title} loading="lazy" />
          : <div className="video-card__thumb-placeholder">▶</div>
        }
        {video.duration > 0 && (
          <span className="video-card__duration">{formatDuration(video.duration)}</span>
        )}
      </div>
      <div className="video-card__body">
        <div style={{ display: 'flex', gap: 10 }}>
          <div
            className="video-card__avatar"
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${video.author.id}`); }}
          >
            {video.author.avatar_url
              ? <img src={video.author.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : video.author.username?.[0]?.toUpperCase()
            }
          </div>
          <div>
            <div className="video-card__title">{video.title}</div>
            <div className="video-card__meta">
              <span
                style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${video.author.id}`); }}
              >
                {video.author.username}
              </span>
              <span>·</span>
              <span>{formatViews(video.views_count)} просм.</span>
              <span>·</span>
              <span>{timeAgo(video.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
