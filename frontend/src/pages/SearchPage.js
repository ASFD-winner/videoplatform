import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videosAPI } from '../services/api';
import VideoCard from '../components/VideoCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    videosAPI.getAll({ search: query }).then(res => {
      setVideos(res.data.results || res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <h1 className="page-title">
        {query ? `Результаты по запросу: "${query}"` : 'Поиск'}
      </h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : videos.length === 0 && query ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p>По запросу «{query}» ничего не найдено</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
