import React, { useRef, useState } from 'react';
import { Upload, Trash2, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { storageService } from '../../services/storageService';

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  onUploaded?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { wrapper: 'w-16 h-16', icon: 24, btn: 'p-1' },
  md: { wrapper: 'w-24 h-24', icon: 36, btn: 'p-1.5' },
  lg: { wrapper: 'w-32 h-32', icon: 56, btn: 'p-2' },
};

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentUrl,
  onUploaded,
  size = 'md',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { wrapper, icon, btn } = sizeMap[size];

  const handleFile = async (file: File) => {
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setProgress(0);
    try {
      const url = await storageService.uploadAvatar(userId, file, (pct) => setProgress(pct));
      await storageService.saveAvatarToProfile(userId, url);
      setPreview(url);
      onUploaded?.(url);
      toast.success('Avatar updated successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    setUploading(true);
    try {
      await storageService.deleteAvatar(userId);
      await storageService.saveAvatarToProfile(userId, '');
      setPreview(null);
      toast.success('Avatar removed.');
    } catch {
      toast.error('Failed to remove avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          className={`${wrapper} rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer`}
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          aria-label="Change avatar"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 size={icon / 2} className="animate-spin text-primary" />
              <span className="text-xs text-slate-500">{progress}%</span>
            </div>
          ) : preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={icon} className="text-slate-400" />
          )}
        </div>

        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          className={`absolute bottom-0 right-0 ${btn} bg-primary text-white rounded-full hover:bg-blue-700 transition-colors shadow`}
          aria-label="Upload avatar"
          disabled={uploading}
        >
          <Upload size={14} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      <div>
        <p className="font-medium text-slate-800">Profile Photo</p>
        <p className="text-xs text-slate-500">JPG, PNG, GIF or WebP — max 2MB</p>
        {preview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 size={12} /> Remove photo
          </button>
        )}
      </div>
    </div>
  );
};
