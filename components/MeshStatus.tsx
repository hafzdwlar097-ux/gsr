
import React from 'react';
import { ARABIC_LABELS } from '../constants';

interface MeshStatusProps {
  nodeCount: number;
  isSyncing: boolean;
}

export const MeshStatus: React.FC<MeshStatusProps> = ({ nodeCount, isSyncing }) => {
  return (
    <div className={`fixed top-4 left-4 z-[100] transition-all duration-700 bg-white/90 backdrop-blur-xl p-3.5 rounded-[1.25rem] shadow-2xl border border-teal-100 flex items-center gap-4 ${isSyncing ? 'mesh-glow scale-105 border-teal-400' : 'scale-100'}`}>
      <div className="relative">
        <div className={`w-3.5 h-3.5 rounded-full shadow-inner transition-colors duration-500 ${nodeCount > 0 ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
        {nodeCount > 0 && <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-teal-500 animate-ping opacity-75"></div>}
        {isSyncing && <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-teal-400 animate-pulse"></div>}
      </div>
      <div className="flex flex-col text-right">
        <span className="text-[10px] font-black text-slate-800 tracking-tight leading-none mb-1">{ARABIC_LABELS.mesh_status}</span>
        <span className="text-[10px] font-bold text-slate-500 leading-none">
          {nodeCount === 0 ? ARABIC_LABELS.no_nodes : `${nodeCount} ${ARABIC_LABELS.connected_nodes}`}
          {isSyncing && <span className="mr-1.5 text-teal-600 font-black">| مزامنة...</span>}
        </span>
      </div>
    </div>
  );
};
