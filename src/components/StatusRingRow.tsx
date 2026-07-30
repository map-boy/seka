import React from 'react';
import { Plus } from 'lucide-react';
import { StatusItem } from '../types';

interface StatusRingRowProps {
  statuses: StatusItem[];
  onSelectStatus: (status: StatusItem) => void;
  onAddStatusClick: () => void;
}

export const StatusRingRow: React.FC<StatusRingRowProps> = ({
  statuses,
  onSelectStatus,
  onAddStatusClick,
}) => {
  const myStatus = statuses.find((s) => s.isMine);
  const friendStatuses = statuses.filter((s) => !s.isMine);

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-4 border-b border-[#27272A] bg-[#0A0A0A]">
      <div className="flex items-center space-x-4 min-w-max">
        {/* My Status Item */}
        <div className="flex flex-col items-center space-y-1 group cursor-pointer" onClick={() => myStatus ? onSelectStatus(myStatus) : onAddStatusClick()}>
          <div className="relative">
            {/* Dashed or solid lime ring for My Status */}
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#E6FF00] via-[#22D3EE] to-[#E6FF00] flex items-center justify-center shadow-[0_0_12px_rgba(230,255,0,0.2)]">
              <img
                src={myStatus?.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt="My Status"
                className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0A]"
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddStatusClick();
              }}
              className="absolute bottom-0 right-0 w-5 h-5 bg-[#E6FF00] text-[#0A0A0A] rounded-full flex items-center justify-center border-2 border-[#0A0A0A] font-bold shadow-sm hover:scale-110 transition-transform"
              title="Add to Status"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-[11px] font-semibold text-white max-w-[64px] truncate">
            My Status
          </span>
        </div>

        {/* Friend Status Items */}
        {friendStatuses.map((status) => (
          <div
            key={status.id}
            onClick={() => onSelectStatus(status)}
            className="flex flex-col items-center space-y-1 cursor-pointer group"
          >
            <div
              className={`w-16 h-16 rounded-full p-[2.5px] flex items-center justify-center transition-transform group-hover:scale-105 ${
                status.isViewed
                  ? 'bg-[#27272A]'
                  : 'animate-sweep-ring shadow-[0_0_12px_rgba(34,211,238,0.3)]'
              }`}
            >
              <img
                src={status.creatorAvatar}
                alt={status.creatorName}
                className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0A]"
              />
            </div>
            <span
              className={`text-[11px] max-w-[64px] truncate font-medium ${
                status.isViewed ? 'text-[#71717A]' : 'text-white font-semibold'
              }`}
            >
              {status.creatorName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
