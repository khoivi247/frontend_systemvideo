import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/contexts/AuthContext';
import { useVideos, useUpload } from '@/hooks';
import { VideoList } from '@/components/video/VideoList';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function StudentDashboardPage() {
  const { student, clearStudent } = useStudent();
  const navigate = useNavigate();
  const { videos, loading, pagination, refetch } = useVideos({ studentName: student?.name });
  const { uploadVideo, uploading, progress, error: uploadError } = useUpload();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 500MB');
      return;
    }
    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !student) return;
    try {
      await uploadVideo(selectedFile, {
        title: selectedFile.name.replace(/\.[^/.]+$/, ''),
        description: '',
        className: student.className,
        studentName: student.name,
      });
      toast.success('Tải video thành công!');
      setShowUploadModal(false);
      setSelectedFile(null);
      refetch();
    } catch (err) {
      toast.error('Tải video thất bại');
    }
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
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {student?.className}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{student?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Video của tôi</h2>
          <p className="mt-1 text-gray-600">Quản lý và tải lên video bài tập</p>
        </div>

        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tải video mới</h3>
                <p className="text-sm text-gray-500">Video sẽ chỉ được bạn và admin xem. Tối đa 500MB</p>
              </div>
              <label className="btn-primary cursor-pointer">
                Chọn video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </div>

        <VideoList
          videos={videos}
          loading={loading}
          emptyMessage="Bạn chưa tải video nào"
          showUpload={false}
          isOwnList={true}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => refetch(pagination.page - 1)}
              disabled={loading || pagination.page === 1}
            >
              Trước
            </Button>
            <span className="flex items-center px-4 text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => refetch(pagination.page + 1)}
              disabled={loading || pagination.page === pagination.totalPages}
            >
              Sau
            </Button>
          </div>
        )}

        {showUploadModal && selectedFile && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Xác nhận tải lên</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {progress && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Đang tải...</span>
                    <span className="font-medium text-primary-600">{progress.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
                  </div>
                </div>
              )}
              {uploadError && <p className="text-red-600 text-sm mb-4">{uploadError}</p>}
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>Hủy</Button>
                <Button onClick={handleUpload} loading={uploading} disabled={!selectedFile}>
                  {uploading ? 'Đang tải...' : 'Tải lên'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}