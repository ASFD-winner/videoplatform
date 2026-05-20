import React, { useEffect, useState } from 'react';
import { videosAPI } from '../services/api';
import VideoCard from '../components/VideoCard';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    videosAPI.getCategories().then(res => setCategories(res.data.results || res.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    setVideos([]);
    setPage(1);
    const params = { page: 1 };
    if (activeCategory) params.category = activeCategory;
    videosAPI.getAll(params).then(res => {
      setVideos(res.data.results || res.data);
      setHasMore(!!res.data.next);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeCategory]);

  const loadMore = () => {
    const nextPage = page + 1;
    const params = { page: nextPage };
    if (activeCategory) params.category = activeCategory;
    videosAPI.getAll(params).then(res => {
      setVideos(prev => [...prev, ...(res.data.results || [])]);
      setHasMore(!!res.data.next);
      setPage(nextPage);
    });
  };

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      {/* Categories filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
        <button
          className={`btn ${!activeCategory ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flexShrink: 0, fontSize: 13 }}
          onClick={() => setActiveCategory('')}
        >
          Все
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`btn ${activeCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flexShrink: 0, fontSize: 13 }}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>Видео пока нет. Станьте первым!</p>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map(v => <VideoCard key={v.id} video={v} />)}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button className="btn btn-secondary" onClick={loadMore}>Загрузить ещё</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
