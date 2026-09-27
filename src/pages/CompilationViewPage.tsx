import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { compilationApi } from '@/services/api';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import type { Compilation, Video } from '@/types';
import toast from 'react-hot-toast';

export default function CompilationViewPage() {
  const { token } = useParams<{ token: string }>();
  const [compilation, setCompilation] = useState<Compilation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    compilationApi.getByToken(token)
      .then(({ data }) => {
        console.log('Compilation data:', data);
        setCompilation(data.compilation);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError(err.message || 'Không tìm thấy link tổng hợp');
        toast.error(err.message || 'Không tìm thấy link tổng hợp');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !compilation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Link không hợp lệ</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link to="/" className="mt-6 inline-block btn-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Video Tổng Hợp</h1>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                {compilation.videoCount} video
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{compilation.viewCount} lượt xem</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{compilation.name}</h2>
          {compilation.expiresAt && (
            <p className="mt-1 text-gray-600">
              Hết hạn: {new Date(compilation.expiresAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        <div className="card">
          <VideoList
            videos={compilation.videos || []}
            loading={false}
            emptyMessage="Không có video nào trong link này"
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="btn-secondary">
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}

// Local VideoList component for this page
function VideoList({ videos, loading, emptyMessage, className }: { videos: Video[]; loading: boolean; emptyMessage: string; className: string }) {
  if (loading) {
    return (
      <div className={`grid gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} isOwn={true} isAdmin={true} />
      ))}
    </div>
  );
}

function VideoCard({ video, isOwn, isAdmin }: { video: Video; isOwn: boolean; isAdmin: boolean }) {
  const canView = isOwn || isAdmin;
  const thumbnailUrl = video.url;

  if (!canView) {
    return (
      <article className="card group relative overflow-hidden">
        {thumbnailUrl && (
          <div className="aspect-video relative overflow-hidden">
            <video
              src={thumbnailUrl}
              className="w-full h-full object-cover video-blur transition-all duration-300 group-hover:blur-[15px] group-hover:grayscale-75"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center">{video.title}</h3>
              <p className="text-sm opacity-75 mt-1">Video của {video.studentName}</p>
              <p className="text-xs opacity-60 mt-2">Nội dung đã được che</p>
            </div>
          </div>
        )}
        <div className="p-4">
          <p className="text-sm text-gray-500">Đăng bởi: {video.studentName}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="card overflow-hidden">
      {thumbnailUrl && (
        <VideoPlayer
          src={video.url}
          poster={thumbnailUrl}
          title={video.title}
        />
      )}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2">{video.title}</h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span>Đăng bởi: {video.studentName}</span>
          <span className="badge bg-gray-100 text-gray-700">{video.className}</span>
        </div>
        {isOwn && (
          <p className="mt-2 text-xs text-primary-600">Video của bạn</p>
        )}
      </div>
    </article>
  );
}
