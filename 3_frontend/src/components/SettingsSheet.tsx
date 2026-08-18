import React, { useState } from 'react';
import { X, LogOut, Trash2, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

interface SettingsSheetProps {
  onClose: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ onClose }) => {
  const { signOut, deleteAccount } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteAccount();
    } catch (err: any) {
      setError(err?.message || 'Could not delete account. Please try again.');
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-[#0A0A0A] border border-[#27272A] rounded-t-2xl sm:rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-black text-white">Settings</h3>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="w-full flex items-center space-x-3 py-3 px-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white hover:border-[#E6FF00] transition-colors">
          <FileText className="w-4 h-4 text-[#A1A1AA]" />
          <span className="text-sm font-bold">Privacy Policy</span>
        </a>

        <button onClick={signOut} className="w-full flex items-center space-x-3 py-3 px-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white hover:border-[#E6FF00] transition-colors">
          <LogOut className="w-4 h-4 text-[#A1A1AA]" />
          <span className="text-sm font-bold">Sign Out</span>
        </button>

        {!confirmingDelete ? (
          <button onClick={() => setConfirmingDelete(true)} className="w-full flex items-center space-x-3 py-3 px-3 rounded-xl bg-[#18181B] border border-[#FF3366]/40 text-[#FF3366] hover:bg-[#FF3366]/10 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-bold">Delete Account</span>
          </button>
        ) : (
          <div className="space-y-2 p-3 rounded-xl bg-[#FF3366]/10 border border-[#FF3366]/40">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#FF3366] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white font-bold">
                This permanently deletes your account. This cannot be undone. Are you sure?
              </p>
            </div>
            {error && <p className="text-xs text-[#FF3366]">{error}</p>}
            <div className="flex space-x-2">
              <button onClick={() => setConfirmingDelete(false)} disabled={deleting} className="flex-1 py-2 rounded-full bg-[#27272A] text-white text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-full bg-[#FF3366] text-white text-xs font-black flex items-center justify-center space-x-1.5 disabled:opacity-50">
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
