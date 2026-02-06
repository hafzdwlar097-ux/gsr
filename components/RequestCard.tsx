
import React from 'react';
import { ReliefRequest, Priority } from '../types';
import { ARABIC_LABELS, REQUEST_ICONS } from '../constants';

interface RequestCardProps {
  request: ReliefRequest;
  onHelp: (id: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onHelp }) => {
  const isCritical = request.priority === Priority.CRITICAL;

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    return `منذ ${minutes} د`;
  };

  return (
    <div className={`bg-white rounded-[2rem] p-5 shadow-xl border transition-all hover:translate-y-[-4px] ${
      isCritical ? 'border-red-500 bg-red-50/10' : 'border-slate-100'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
            isCritical ? 'bg-red-600 text-white shadow-red-100' : 'bg-teal-50 text-teal-600'
          }`}>
            {REQUEST_ICONS[request.type]}
          </div>
          <div>
            <h4 className={`font-black text-lg ${isCritical ? 'text-red-700' : 'text-slate-800'}`}>
              {ARABIC_LABELS[request.type.toLowerCase()]}
            </h4>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-slate-400 font-bold">{timeAgo(request.timestamp)}</span>
               <span className="text-[10px] text-teal-600 font-black">| {request.userName}</span>
            </div>
          </div>
        </div>
        <span className={`text-[9px] px-3 py-1.5 rounded-full font-black ${
          isCritical ? 'bg-red-600 text-white animate-pulse shadow-lg' : 'bg-teal-100 text-teal-600'
        }`}>
          {ARABIC_LABELS[request.priority.toLowerCase()]}
        </span>
      </div>
      
      {request.image && (
        <div className="mb-4 rounded-2xl overflow-hidden aspect-video border border-slate-100 shadow-inner">
          <img src={request.image} className="w-full h-full object-cover" alt="Context" />
        </div>
      )}

      <p className="text-sm text-slate-600 mb-5 leading-relaxed font-bold bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
        {request.description}
      </p>

      <div className="flex gap-3">
        {request.userPhone && (
          <a 
            href={`tel:${request.userPhone}`}
            className="flex-[2] bg-teal-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-teal-100 active:scale-95 transition-all"
          >
            <i className="fas fa-phone-alt"></i> استجابة واتصال
          </a>
        )}
        <button className="flex-1 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all">
          <i className="fas fa-location-arrow"></i>
        </button>
      </div>
    </div>
  );
};
