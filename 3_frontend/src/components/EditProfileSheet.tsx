import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Creator } from '../types';
import { updateCreatorProfile } from '../lib/firestore/creators';

interface EditProfileSheetProps {
  user: Creator;
  onClose: () => void;
}

export const EditProfileSheet: React.FC<EditProfileSheetProps> = ({ user, onClose }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateCreatorProfile(user.id, { name: name.trim(), bio: bio.trim(), avatar });
      onClose();
    } catch (err) {
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-[#0A0A0A] border border-[#27272A] rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white">Edit Profile</h3>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center">
          <img
            src={avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.id}
            alt="avatar preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-[#E6FF00]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#71717A] uppercase">Avatar URL</label>
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#E6FF00]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#71717A] uppercase">Display Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#E6FF00]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#71717A] uppercase">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={160}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#E6FF00] resize-none"
          />
          <span className="text-[10px] text-[#71717A]">{bio.length}/160</span>
        </div>

        {error && <p className="text-xs text-[#FF3366] font-bold">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] disabled:opacity-50 text-[#0A0A0A] text-sm font-black flex items-center justify-center space-x-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
};