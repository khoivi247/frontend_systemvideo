import { supabase } from '../lib/supabase';
import type { Video } from '../types';

export const videoApi = {
  upload: async (
    file: File,
    data: { title: string; description: string; className: string; studentName: string }
  ) => {
    const fileExt = file.name.split('.').pop() || 'mp4';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const storagePath = `${data.className}/${data.studentName}/${fileName}`;

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

export function getVideoUrl(video: Video): string {
  return video.url;
}