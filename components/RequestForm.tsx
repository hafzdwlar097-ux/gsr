
import React, { useState, useRef } from 'react';
import { RequestType, Priority, ReliefRequest } from '../types';
import { ARABIC_LABELS } from '../constants';

interface RequestFormProps {
  onSubmit: (request: Partial<ReliefRequest>) => void;
  onClose: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onClose }) => {
  const [type, setType] = useState<RequestType>(RequestType.AMBULANCE);
  const [priority, setPriority] = useState<Priority>(Priority.URGENT);
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert(ARABIC_LABELS.camera_error);
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.7);
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const emergencies = [RequestType.AMBULANCE, RequestType.POLICE, RequestType.FIRE, RequestType.SECURITY];
  const resources = [RequestType.MEDICAL, RequestType.FOOD, RequestType.WATER, RequestType.SHELTER, RequestType.MISSING, RequestType.VOLUNTEER, RequestType.REPAIR];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">{ARABIC_LABELS.create_request}</h2>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors border border-slate-100">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {showCamera ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button onClick={takePhoto} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl border-4 border-slate-200">
                  <i className="fas fa-camera"></i>
                </button>
                <button onClick={stopCamera} className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ) : (
            <>
              {image && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video group">
                  <img src={image} className="w-full h-full object-cover" alt="Captured" />
                  <button onClick={() => setImage(null)} className="absolute top-2 left-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              )}
              
              {!image && (
                <button onClick={startCamera} className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all flex flex-col items-center gap-2">
                  <i className="fas fa-camera text-2xl"></i>
                  <span className="text-xs font-bold">{ARABIC_LABELS.take_photo}</span>
                </button>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />

          <section>
            <label className="block text-xs font-black text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              خدمات الطوارئ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {emergencies.map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setPriority(Priority.CRITICAL); }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    type === t ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-100 hover:border-red-200 text-slate-600 bg-white'
                  }`}
                >
                  <span className="text-lg">{t === 'AMBULANCE' && '🚑'}{t === 'POLICE' && '👮'}{t === 'FIRE' && '🚒'}{t === 'SECURITY' && '🛡️'}</span>
                  <span className="font-bold text-xs">{ARABIC_LABELS[t.toLowerCase()]}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-xs font-black text-teal-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              المساعدات والموارد
            </label>
            <div className="grid grid-cols-3 gap-2">
              {resources.map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setPriority(Priority.NORMAL); }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                    type === t ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                  }`}
                >
                  <span className="text-lg mb-1">{t === 'MEDICAL' && '💊'}{t === 'SHELTER' && '🏠'}{t === 'FOOD' && '🍱'}{t === 'WATER' && '💧'}{t === 'MISSING' && '🔍'}{t === 'VOLUNTEER' && '🤝'}{t === 'REPAIR' && '🛠️'}</span>
                  <span className="text-[9px] font-bold">{ARABIC_LABELS[t.toLowerCase()]}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-2xl border-slate-100 bg-slate-50 focus:ring-teal-500 focus:border-teal-500 h-24 p-4 border text-sm text-slate-700 resize-none transition-all focus:bg-white"
              placeholder="اكتب التفاصيل هنا..."
            />
          </section>
        </div>

        <div className="p-6 bg-slate-50/50">
          <button
            onClick={() => onSubmit({ type, priority, description: desc, image: image || undefined })}
            className={`w-full font-black py-4 rounded-2xl transition-all shadow-xl text-white text-lg flex items-center justify-center gap-3 ${
              emergencies.includes(type) ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
            }`}
          >
            إرسال البلاغ
          </button>
        </div>
      </div>
    </div>
  );
};
