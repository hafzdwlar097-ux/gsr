
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReliefRequest, PeerInfo } from '../types';

interface MapDisplayProps {
  userLocation: [number, number];
  requests: ReliefRequest[];
  peers: PeerInfo[];
}

const MapDisplay: React.FC<MapDisplayProps> = ({ userLocation, requests, peers }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // تهيئة الخريطة
    mapRef.current = L.map(mapContainerRef.current, {
      center: userLocation,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // إضافة طبقة الخريطة (أوفلاين - تستخدم كاش المتصفح أو OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    // مسح الماركرز القديمة
    markersRef.current.clearLayers();

    // ماركر المستخدم الحالي
    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #0d9488; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 7]
    });
    L.marker(userLocation, { icon: userIcon }).addTo(markersRef.current).bindPopup('موقعك الحالي');

    // ماركرز البلاغات
    requests.forEach(req => {
      const isCritical = req.priority === 'CRITICAL';
      const reqIcon = L.divIcon({
        className: 'req-icon',
        html: `<div style="background-color: ${isCritical ? '#dc2626' : '#0d9488'}; padding: 8px; border-radius: 12px; color: white; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                <i class="fas fa-${isCritical ? 'triangle-exclamation' : 'hand-holding-hand'}" style="font-size: 14px;"></i>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      L.marker([req.location.lat, req.location.lng], { icon: reqIcon })
        .addTo(markersRef.current!)
        .bindPopup(`<div style="font-family: Tajawal; text-align: right;"><b>${req.userName}</b><br/>${req.description}</div>`);
    });

    // ماركرز الجيران
    peers.forEach(peer => {
      if (peer.location) {
        const peerIcon = L.divIcon({
          className: 'peer-icon',
          html: `<div style="background-color: #3b82f6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });
        L.marker(peer.location as [number, number], { icon: peerIcon })
          .addTo(markersRef.current!)
          .bindPopup(`<span style="font-family: Tajawal;">${peer.name} (جار متصل)</span>`);
      }
    });

    // تحريك الخريطة لموقع المستخدم
    mapRef.current.panTo(userLocation);

  }, [userLocation, requests, peers]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapDisplay;
