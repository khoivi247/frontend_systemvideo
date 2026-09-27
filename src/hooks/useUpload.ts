import { useState, useCallback } from 'react';
import { videoApi } from '../services/api';
import type { Video } from '../types';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(async (
    file: File,
    metadata: { title: string; description: string; className: string; studentName: string },
    onComplete?: (video: Video) => void
  ) => {
    setUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });
    setError(null);

    try {
      const response = await videoApi.upload(file, metadata);

      const video = response.data.video;

      // Simulate progress completion
      setProgress({ loaded: file.size, total: file.size, percentage: 100 });

      if (onComplete) onComplete(video);
      return video;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, []);

  return { uploadVideo, uploading, progress, error };
}