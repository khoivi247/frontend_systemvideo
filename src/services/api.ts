import { supabase } from '../lib/supabase';
import type { Video } from '../types';

export interface Compilation {
  id: string;
  name: string;
  token: string;
  videoIds: string[];
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  viewCount: number;
  shareUrl: string;
  videoCount: number;
}

function sanitizePath(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with _
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, ''); // Trim underscores
}

export const videoApi = {
  upload: async (
    file: File,
    data: { title: string; description: string; className: string; studentName: string }
  ) => {
    const fileExt = file.name.split('.').pop() || 'mp4';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const safeClassName = sanitizePath(data.className);
    const safeStudentName = sanitizePath(data.studentName);
    const storagePath = `${safeClassName}/${safeStudentName}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(storagePath);

    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        title: data.title,
        description: data.description,
        filename: fileName,
        class_name: data.className,
        student_name: data.studentName,
        file_size: file.size,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    const videoData: Video = {
      id: video.id,
      title: video.title,
      description: video.description,
      filename: video.filename,
      className: video.class_name,
      studentName: video.student_name,
      fileSize: video.file_size,
      createdAt: video.created_at,
      url: publicUrl,
    };

    return {
      data: {
        video: videoData,
      },
    };
  },

  list: async (params?: {
    className?: string;
    studentName?: string;
    page?: number;
    limit?: number;
  }) => {
    let query = supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params?.className) query = query.eq('class_name', params.className);
    if (params?.studentName) query = query.eq('student_name', params.studentName);

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const videosWithUrl: Video[] = (data || []).map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      filename: v.filename,
      className: v.class_name,
      studentName: v.student_name,
      fileSize: v.file_size,
      createdAt: v.created_at,
      url: supabase.storage.from('videos').getPublicUrl(v.storage_path).data.publicUrl,
    }));

    return {
      data: {
        data: videosWithUrl,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    };
  },

  getClasses: async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('class_name');
    if (error) throw error;
    const classes = [...new Set(data?.map(v => v.class_name) || [])];
    return { data: { classes } };
  },

  getStudents: async (className?: string) => {
    let query = supabase.from('videos').select('student_name');
    if (className) query = query.eq('class_name', className);
    const { data, error } = await query;
    if (error) throw error;
    const students = [...new Set(data?.map(v => v.student_name) || [])];
    return { data: { students } };
  },
};

export const compilationApi = {
  create: async (data: { name: string; videoIds: string[]; expiresInDays?: number }) => {
    const token = crypto.randomUUID();
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: compilation, error } = await supabase
      .from('compilations')
      .insert({
        name: data.name,
        token,
        video_ids: data.videoIds,
        expires_at: expiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    const shareUrl = `${window.location.origin}/compilation/${token}`;

    return {
      data: {
        compilation: {
          ...compilation,
          shareUrl,
          videoCount: compilation.video_ids.length,
        } as Compilation,
      },
    };
  },

  list: async () => {
    const { data, error } = await supabase
      .from('compilations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: {
        data: data?.map(c => ({
          ...c,
          shareUrl: `${window.location.origin}/compilation/${c.token}`,
          videoCount: c.video_ids.length,
        })) || [],
      },
    };
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('compilations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      data: {
        compilation: {
          ...data,
          shareUrl: `${window.location.origin}/compilation/${data.token}`,
          videoCount: data.video_ids.length,
        } as Compilation,
      },
    };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('compilations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: { message: 'Deleted' } };
  },

  getByToken: async (token: string) => {
    const { data: compilation, error } = await supabase
      .from('compilations')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    if (compilation.expires_at && new Date(compilation.expires_at) < new Date()) {
      throw new Error('Link đã hết hạn');
    }

    // Get videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .in('id', compilation.video_ids)
      .order('created_at', { ascending: true });

    if (videosError) throw videosError;

    // Increment view count
    await supabase
      .from('compilations')
      .update({ view_count: compilation.view_count + 1 })
      .eq('id', compilation.id);

    const videosWithUrl = (videos || []).map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      filename: v.filename,
      className: v.class_name,
      studentName: v.student_name,
      fileSize: v.file_size,
      createdAt: v.created_at,
      url: supabase.storage.from('videos').getPublicUrl(v.storage_path).data.publicUrl,
    }));

    return {
      data: {
        compilation: {
          ...compilation,
          shareUrl: `${window.location.origin}/compilation/${compilation.token}`,
          videoCount: compilation.video_ids.length,
          videos: videosWithUrl,
        } as Compilation & { videos: Video[] },
      },
    };
  },
};

export function getVideoUrl(video: Video): string {
  return video.url;
}
