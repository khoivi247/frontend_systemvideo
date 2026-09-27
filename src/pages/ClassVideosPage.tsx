import { useStudent } from '@/contexts/AuthContext';
import { useVideos } from '@/hooks';
import { VideoList } from '@/components/video/VideoList';

export default function ClassVideosPage() {
  const { student } = useStudent();
  const { videos, loading, pagination, refetch } = useVideos({ className: student?.className });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Video Class System</h1>
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {student?.className}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Video lớp {student?.className}</h2>
          <p className="mt-1 text-gray-600">Video của các thành viên khác</p>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Video của lớp {student?.className}</span>
            </div>
          </div>
          <VideoList
            videos={videos}
            loading={loading}
            emptyMessage="Chưa có video nào trong lớp"
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => refetch(pagination.page - 1)}
              disabled={loading || pagination.page === 1}
              className="btn-secondary"
            >
              Trước
            </button>
            <span className="flex items-center px-4 text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => refetch(pagination.page + 1)}
              disabled={loading || pagination.page === pagination.totalPages}
              className="btn-secondary"
            >
              Sau
            </button>
          </div>
        )}
      </main>
    </div>
  );
}