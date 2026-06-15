/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_AVATAR_SIZE_MB = 2;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

export const storageService = {
  // ---------- AVATARS ----------
  uploadAvatar: async (
    userId: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, GIF or WebP image.');
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      throw new Error(`File too large. Maximum size is ${MAX_AVATAR_SIZE_MB}MB.`);
    }

    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    // Simulate progress since supabase-js v2 doesn't expose upload progress
    if (onProgress) onProgress(30);

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) throw error;
    if (onProgress) onProgress(100);

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  deleteAvatar: async (userId: string): Promise<void> => {
    // List all files for this user and delete them
    const { data: files } = await supabase.storage.from('avatars').list(userId);
    if (!files || files.length === 0) return;

    const paths = files.map((f) => `${userId}/${f.name}`);
    const { error } = await supabase.storage.from('avatars').remove(paths);
    if (error) throw error;
  },

  getAvatarUrl: (userId: string, ext = 'png'): string => {
    const path = `${userId}/avatar.${ext}`;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  // ---------- REPORTS ----------
  uploadReport: async (
    file: File,
    reportTitle: string,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    const ext = file.name.split('.').pop();
    const timestamp = Date.now();
    const safeName = reportTitle.replace(/\s+/g, '_');
    const path = `${timestamp}_${safeName}.${ext}`;

    if (onProgress) onProgress(40);

    const { error } = await supabase.storage
      .from('reports')
      .upload(path, file, { contentType: file.type });

    if (error) throw error;
    if (onProgress) onProgress(100);

    const { data } = supabase.storage.from('reports').getPublicUrl(path);
    return data.publicUrl;
  },

  // ---------- DOCUMENTS ----------
  uploadDocument: async (
    blob: Blob,
    filename: string,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    const path = `${Date.now()}_${filename}`;

    if (onProgress) onProgress(40);

    const { error } = await supabase.storage
      .from('documents')
      .upload(path, blob, { contentType: 'application/pdf' });

    if (error) throw error;
    if (onProgress) onProgress(100);

    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  },

  // We no longer store avatar_url in the profiles table to avoid schema issues.
  saveAvatarToProfile: async (userId: string, avatarUrl: string): Promise<void> => {
    // No-op
    return;
  },

  getProfileAvatarUrl: async (userId: string): Promise<string | null> => {
    try {
      const { data: files, error } = await supabase.storage.from('avatars').list(userId);
      if (error || !files || files.length === 0) return null;
      
      const avatarFile = files.find(f => f.name.startsWith('avatar.'));
      if (!avatarFile) return null;

      const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/${avatarFile.name}`);
      return data.publicUrl;
    } catch {
      return null;
    }
  },
};
