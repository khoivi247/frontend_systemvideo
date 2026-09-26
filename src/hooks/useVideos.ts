import { useState, useEffect, useCallback } from 'react';
import { videoApi } from '../services/api';
import type { Video } from '../types';

export function useVideos(filters?: { className?: string; studentName?: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await videoApi.list({ 
        className: filters?.className, 
        studentName: filters?.studentName,
        page, 
        limit: 20 
      });
      setVideos(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters?.className, filters?.studentName]);

  useEffect(() => { fetch(1); }, [fetch]);

  return { videos, loading, pagination, refetch: fetch };
}

export function useClasses() {
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videoApi.getClasses();
      setClasses(data.classes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { classes, loading, refetch: fetch };
}

export function useStudents(className?: string) {
  const [students, setStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videoApi.getStudents(className);
      setStudents(data.students);
    } finally {
      setLoading(false);
    }
  }, [className]);

  useEffect(() => { fetch(); }, [fetch]);

  return { students, loading, refetch: fetch };
}