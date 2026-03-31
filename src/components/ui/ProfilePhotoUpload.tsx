import { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  userId: string;
  currentUrl?: string | null;
  displayName?: string;
  onUploaded?: (url: string) => void;
}

export default function ProfilePhotoUpload({ userId, currentUrl, displayName, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = (displayName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setUploading(true);
    setError(null);
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('ct-profile-photos').upload(path, file, { upsert: true });
    if (upErr) { setError('Upload failed. Try again.'); setUploading(false); return; }
    const { data } = supabase.storage.from('ct-profile-photos').getPublicUrl(path);
    const url = data.publicUrl + '?t=' + Date.now();
    await supabase.from('ct_users').update({ avatar_url: data.publicUrl }).eq('id', userId);
    setPreview(url);
    onUploaded?.(data.publicUrl);
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24">
        {preview ? (
          <img src={preview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-primary font-lexend font-bold text-2xl border-4 border-primary/20">
            {initials}
          </div>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-md hover:bg-secondary/90 transition-colors"
          disabled={uploading}
        >
          <Camera size={14} className="text-white" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant text-on-surface text-sm font-jakarta font-600 hover:bg-surface-container transition-colors disabled:opacity-50"
      >
        <Upload size={14} />
        {uploading ? 'Uploading...' : 'Change Photo'}
      </button>
      {error && <p className="text-red-500 text-xs font-jakarta">{error}</p>}
    </div>
  );
}
