import { useState } from 'react';

interface VideoPlayerProps {
  playbackId: string;
  title?: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  onEnded?: () => void;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export function VideoPlayer({ 
  playbackId, 
  poster, 
  className, 
  style,
  onEnded,
}: VideoPlayerProps) {
  const [showError, setShowError] = useState(false);
  const videoUrl = `${API_URL}/files/${playbackId}`;
  const thumbnailUrl = poster || `${API_URL}/files/${playbackId}?thumbnail=true`;

  if (showError) {
    return (
      <div className={`w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={style}>
        <div className="text-center p-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-gray-600">Không thể tải video</p>
          <button
            onClick={() => setShowError(false)}
            className="mt-4 btn-primary"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={style}>
      <video
        src={videoUrl}
        poster={thumbnailUrl}
        controls
        preload="metadata"
        onError={() => setShowError(true)}
        onEnded={onEnded}
        style={{ width: '100%', aspectRatio: '16/9', borderRadius: '0.75rem', background: '#000' }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Đang tải video...</p>
          </div>
        </div>
      </video>
    </div>
  );
}