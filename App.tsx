
import React, { useState, useEffect } from 'react';
import { ReliefRequest, UserProfile, Priority, RequestType, AppState, PeerInfo } from './types';
import { localDB } from './services/localDB';
import { EMERGENCY_NUMBERS, ARABIC_LABELS } from './constants';
import { MeshStatus } from './components/MeshStatus';
import { RequestCard } from './components/RequestCard';
import { RequestForm } from './components/RequestForm';
import MapDisplay from './components/MapDisplay';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Local Mesh Network Simulation via BroadcastChannel
const MESH_CHANNEL = new BroadcastChannel('bridges_v1_mesh_network');

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    profile: localDB.getProfile(),
    requests: localDB.getRequests(),
    messages: [],
    meshNodes: 0,
    isSyncing: false,
    nearbyPeers: []
  });

  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'peers' | 'sos'>('map');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [peerData, setPeerData] = useState<Record<string, PeerInfo>>({});
  const [userLocation, setUserLocation] = useState<[number, number]>([30.0444, 31.2357]);

  // 1. Radar and Peer Discovery System
  useEffect(() => {
    // Get initial geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn("Location access denied. Using default Cairo coordinates."),
        { enableHighAccuracy: true }
      );
    }

    // Broadcast user presence to the local "mesh"
    const broadcastPresence = () => {
      if (!state.profile) return;
      MESH_CHANNEL.postMessage({ 
        type: 'PEER_PULSE', 
        payload: {
          id: state.profile.id,
          name: state.profile.name,
          phone: state.profile.phone,
          status: state.profile.currentStatus,
          lastSeen: Date.now(),
          location: userLocation
        }
      });
    };

    // Handle incoming mesh messages
    const handleNetwork = (e: MessageEvent) => {
      const { type, payload } = e.data;
      if (type === 'PEER_PULSE' && payload.id !== state.profile?.id) {
        setPeerData(prev => ({ ...prev, [payload.id]: payload }));
      }
      if (type === 'SYNC_REQS') {
        const merged = localDB.syncRequests(payload);
        setState(prev => ({ ...prev, requests: merged, isSyncing: true }));
        setTimeout(() => setState(prev => ({ ...prev, isSyncing: false })), 1000);
      }
    };

    MESH_CHANNEL.addEventListener('message', handleNetwork);
    const pulseTimer = setInterval(broadcastPresence, 4000);
    
    return () => {
      MESH_CHANNEL.removeEventListener('message', handleNetwork);
      clearInterval(pulseTimer);
    };
  }, [state.profile, userLocation]);

  // 2. Peer tracking and cleanup
  useEffect(() => {
    const peers = (Object.values(peerData) as PeerInfo[]).filter(p => Date.now() - p.lastSeen < 15000);
    setState(prev => ({ ...prev, nearbyPeers: peers, meshNodes: peers.length }));
  }, [peerData]);

  // 3. User Registration
  const handleRegister = (name: string, phone: string) => {
    const newP: UserProfile = { 
      id: `u_${Date.now()}`, 
      name, 
      phone, 
      role: 'متطوع', 
      skills: [], 
      currentStatus: 'HEALTHY',
      shareMedicalInEmergency: true,
      medicalInfo: { bloodType: '-', allergies: '-', conditions: '-' }
    };
    localDB.saveProfile(newP);
    setState(prev => ({ ...prev, profile: newP }));
  };

  // 4. Create New Relief Request
  const handleNewRequest = (data: Partial<ReliefRequest>) => {
    if (!state.profile) return;
    const req: ReliefRequest = {
      id: `r_${Date.now()}`,
      userId: state.profile.id,
      userName: state.profile.name,
      userPhone: state.profile.phone,
      type: data.type || RequestType.VOLUNTEER,
      description: data.description || '',
      priority: data.priority || Priority.NORMAL,
      location: { lat: userLocation[0], lng: userLocation[1] },
      timestamp: Date.now(),
      status: 'OPEN',
      image: data.image
    };
    localDB.saveRequest(req);
    setState(prev => ({ ...prev, requests: [req, ...prev.requests] }));
    setIsFormOpen(false);
    // Broadcast sync to other mesh nodes
    MESH_CHANNEL.postMessage({ type: 'SYNC_REQS', payload: [req] });
  };

  // 5. Utility: Download source code as ZIP
  const downloadFullAppZip = async () => {
    const zip = new JSZip();
    zip.file("index.html", document.documentElement.outerHTML);
    zip.file("README.txt", "جسور - شبكة إغاثة P2P. تم استخراج هذا الكود للرفع اليدوي.");
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "Bridges_Source_Export.zip");
  };

  if (!state.profile) {
    return (
      <div className="min-h-screen bg-teal-600 flex items-center justify-center p-6 text-right font-['Tajawal']" dir="rtl">
        <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6 shadow-inner ring-8 ring-teal-50">
            <i className="fas fa-bridge"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">تفعيل جسور</h2>
          <p className="text-xs text-slate-400 text-center mb-8 font-bold">شبكة إغاثة محلية مستقلة تماماً</p>
          <form onSubmit={(e: any) => { e.preventDefault(); handleRegister(e.target.name.value, e.target.phone.value); }}>
            <div className="space-y-4">
              <input name="name" required placeholder="الاسم الكامل" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-teal-500" />
              <input name="phone" required type="tel" placeholder="رقم الهاتف" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black focus:ring-2 ring-teal-500" />
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-lg">دخول الشبكة</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-slate-50 text-right font-['Tajawal']" dir="rtl">
      <MeshStatus nodeCount={state.meshNodes} isSyncing={state.isSyncing} />

      <header className="bg-white/80 backdrop-blur-xl pt-14 pb-4 px-6 border-b border-slate-100 sticky top-0 z-[100] flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
            <i className="fas fa-bridge"></i>
          </div>
          <div>
            <h1 className="text-md font-black text-slate-800 leading-none">جسور</h1>
            <span className="text-[9px] text-teal-600 font-black tracking-widest">{state.profile.name}</span>
          </div>
        </div>
        <button onClick={downloadFullAppZip} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
          <i className="fas fa-file-archive"></i> ZIP
        </button>
      </header>

      <main className="max-w-xl mx-auto p-4">
        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 mb-6 shadow-sm sticky top-28 z-[90]">
          {[
            { id: 'map', label: 'الخريطة', icon: 'fa-map-location-dot' },
            { id: 'list', label: 'البلاغات', icon: 'fa-bullhorn' },
            { id: 'peers', label: 'الرادار', icon: 'fa-satellite-dish' },
            { id: 'sos', label: 'طوارئ', icon: 'fa-phone-volume' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-4 rounded-xl text-[10px] font-black flex flex-col items-center gap-2 transition-all ${activeTab === t.id ? 'bg-teal-600 text-white shadow-xl' : 'text-slate-400'}`}>
              <i className={`fas ${t.icon} text-sm`}></i>
              {t.label}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'map' && (
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white h-[60vh] relative">
               <MapDisplay 
                userLocation={userLocation} 
                requests={state.requests} 
                peers={state.nearbyPeers}
               />
               <button onClick={() => setUserLocation([...userLocation])} className="absolute bottom-6 left-6 z-[1000] bg-white w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-teal-600 border border-teal-50"><i className="fas fa-crosshairs"></i></button>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              {state.requests.map(r => <RequestCard key={r.id} request={r} onHelp={() => {}} />)}
              {state.requests.length === 0 && (
                <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                  <i className="fas fa-bullhorn text-5xl"></i>
                  <p className="font-bold">لا توجد بلاغات حالياً في منطقتك</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'peers' && (
            <div className="space-y-4">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden mb-4 shadow-xl">
                  <h3 className="text-xl font-black">الرادار المحلي</h3>
                  <p className="text-xs opacity-60 font-bold mt-1">اكتشاف الأجهزة القريبة المتصلة بنفس الشبكة</p>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
               </div>
               {state.nearbyPeers.map(p => (
                 <div key={p.id} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-teal-50 shadow-sm animate-in zoom-in duration-300">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-xl shadow-inner"><i className="fas fa-user-astronaut"></i></div>
                       <div><h4 className="font-black text-slate-800">{p.name}</h4><span className="text-[10px] text-green-500 font-black uppercase tracking-widest">متصل الآن</span></div>
                    </div>
                    <a href={`tel:${p.phone}`} className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-phone-alt"></i></a>
                 </div>
               ))}
               {state.meshNodes === 0 && <p className="text-center text-slate-300 py-10 font-bold text-sm">جاري البحث عن أجهزة قريبة...</p>}
            </div>
          )}

          {activeTab === 'sos' && (
            <div className="grid gap-3">
              {EMERGENCY_NUMBERS.map(n => (
                <a key={n.number} href={`tel:${n.number}`} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 flex items-center justify-between group active:scale-95 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 ${n.color} text-white rounded-3xl flex items-center justify-center text-2xl shadow-lg shadow-red-50`}><i className={`fas ${n.icon}`}></i></div>
                    <div><h4 className="font-black text-slate-800">{n.name}</h4><p className="text-red-600 font-black text-2xl tracking-widest">{n.number}</p></div>
                  </div>
                  <i className="fas fa-phone-flip text-slate-200 text-xl group-hover:text-red-500 transition-colors"></i>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Primary SOS Action Button */}
      <div className="fixed bottom-12 left-0 right-0 flex justify-center z-[110] pointer-events-none px-6">
        <button 
          onClick={() => setIsFormOpen(true)}
          className="pointer-events-auto w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-[2.8rem] shadow-2xl shadow-red-200 flex flex-col items-center justify-center hover:scale-105 active:scale-90 transition-all border-8 border-white/50 backdrop-blur-md"
        >
          <i className="fas fa-plus text-3xl mb-1"></i>
          <span className="text-[8px] font-black uppercase tracking-widest">إضافة بلاغ</span>
        </button>
      </div>

      {/* Bottom Navigation (Modern) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 p-8 flex justify-around items-center z-[100] rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'map' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
            <i className="fas fa-location-dot text-2xl"></i>
            <span className="text-[9px] font-black">{ARABIC_LABELS.map}</span>
         </button>
         <div className="w-16"></div>
         <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'list' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
            <i className="fas fa-bullhorn text-2xl"></i>
            <span className="text-[9px] font-black">البلاغات</span>
         </button>
      </nav>

      {isFormOpen && <RequestForm onSubmit={handleNewRequest} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default App;
