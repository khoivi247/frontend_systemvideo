import { VideoPlayer } from './VideoPlayer';
import type { Video } from '../../types';

interface VideoCardProps {
  video: Video;
  isOwn: boolean;
  isAdmin: boolean;
  onClick?: () => void;
}

export function VideoCard({ video, isOwn, isAdmin, onClick }: VideoCardProps) {
  const canView = isOwn || isAdmin;
  const thumbnailUrl = video.url;

  if (!canView) {
    return (
      <article className="card group relative overflow-hidden" onClick={onClick}>
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
    <article className="card overflow-hidden" onClick={onClick}>
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