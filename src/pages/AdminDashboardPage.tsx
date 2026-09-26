import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/contexts/AuthContext';
import { useVideos } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import type { Video } from '@/types';

export default function AdminDashboardPage() {
  const { student, clearStudent } = useStudent();
  const navigate = useNavigate();
  const { videos, loading, pagination, refetch } = useVideos();

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterStudent, setFilterStudent] = useState<string>('');

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    clearStudent();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Video Class System</h1>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{student?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Đăng xuất</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý video</h2>
          <p className="mt-1 text-gray-600">Tổng cộng {pagination.total} video</p>
        </div>

        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <Input
                label="Lọc theo lớp"
                type="text"
                placeholder="Ví dụ: 12A1, CNTT-K1..."
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              />
              <Input
                label="Lọc theo học sinh"
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A..."
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học sinh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedVideo(video)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {video.url ? (
                          <VideoPlayer 
                            playbackId={video.filename} 
                            style={{ width: '80px', height: '45px', borderRadius: '0.375rem' }} 
                          />
                        ) : (
                          <div className="w-20 h-11 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-xs">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.studentName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{video.studentName}</td>
                    <td className="px-6 py-4">
                      <span className="badge bg-gray-100 text-gray-700">{video.className}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDuration(0)}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{new Date(video.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {videos.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">Chưa có video nào</p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
              <Button variant="secondary" onClick={() => refetch(pagination.page - 1)} disabled={loading || pagination.page === 1}>
                Trước
              </Button>
              <span className="flex items-center px-4 text-gray-600">Trang {pagination.page} / {pagination.totalPages}</span>
              <Button variant="secondary" onClick={() => refetch(pagination.page + 1)} disabled={loading || pagination.page === pagination.totalPages}>
                Sau
              </Button>
            </div>
          )}
        </div>

        {selectedVideo && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedVideo.title}</h3>
                <button className="text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setSelectedVideo(null)}>&times;</button>
              </div>
              {selectedVideo.url && (
                <VideoPlayer 
                  playbackId={selectedVideo.filename} 
                  title={selectedVideo.title} 
                />
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>Học sinh: {selectedVideo.studentName}</p>
                <p>Lớp: {selectedVideo.className}</p>
                <p>Kích thước: {(selectedVideo.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                <p>Ngày tải: {new Date(selectedVideo.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}