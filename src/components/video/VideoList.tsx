import { VideoCard } from './VideoCard';
import { VideoUpload } from './VideoUpload';
import type { Video } from '../../types';

interface VideoListProps {
  videos: Video[];
  loading?: boolean;
  emptyMessage?: string;
  showUpload?: boolean;
  isOwnList?: boolean;
  isAdmin?: boolean;
  onUploadSuccess?: (video: Video) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function VideoList({
  videos,
  loading = false,
  emptyMessage = 'Chưa có video nào',
  showUpload = false,
  isOwnList = false,
  isAdmin = false,
  onUploadSuccess,
  onLoadMore,
  hasMore,
  className = '',
}: VideoListProps) {
  if (loading && videos.length === 0) {
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
        <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="mt-4 text-gray-500 text-lg">{emptyMessage}</p>
        {showUpload && !isOwnList && (
          <p className="mt-2 text-sm text-gray-400">Hãy tải video đầu tiên của bạn!</p>
        )}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          isOwn={isOwnList}
          isAdmin={isAdmin}
        />
      ))}

      {showUpload && isOwnList && (
        <VideoUpload onSuccess={onUploadSuccess} />
      )}

      {hasMore && onLoadMore && (
        <div className="col-span-full text-center pt-4">
          <button
            onClick={onLoadMore}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Xem thêm'}
          </button>
        </div>
      )}
    </div>
  );
}