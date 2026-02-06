
import React from 'react';

export const COLORS = {
  primary: '#0d9488', 
  secondary: '#0f172a',
  critical: '#dc2626',
  urgent: '#ea580c',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const EMERGENCY_NUMBERS = [
  { name: 'الإسعاف', number: '123', icon: 'fa-ambulance', color: 'bg-red-600' },
  { name: 'الشرطة', number: '122', icon: 'fa-shield-halved', color: 'bg-blue-700' },
  { name: 'المطافئ', number: '180', icon: 'fa-fire-extinguisher', color: 'bg-orange-600' },
  { name: 'الكهرباء', number: '121', icon: 'fa-bolt', color: 'bg-yellow-600' },
  { name: 'الغاز', number: '129', icon: 'fa-gas-pump', color: 'bg-slate-700' },
];

export const REQUEST_ICONS: Record<string, React.ReactNode> = {
  AMBULANCE: <i className="fas fa-ambulance"></i>,
  POLICE: <i className="fas fa-shield-halved"></i>,
  FIRE: <i className="fas fa-fire-extinguisher"></i>,
  MEDICAL: <i className="fas fa-heart-pulse"></i>,
  SHELTER: <i className="fas fa-house-chimney"></i>,
  FOOD: <i className="fas fa-bowl-food"></i>,
  WATER: <i className="fas fa-faucet-drip"></i>,
  MISSING: <i className="fas fa-person-circle-question"></i>,
  VOLUNTEER: <i className="fas fa-hands-holding"></i>,
  REPAIR: <i className="fas fa-screwdriver-wrench"></i>,
  SECURITY: <i className="fas fa-user-ninja"></i>,
};

export const ARABIC_LABELS: Record<string, string> = {
  app_name: 'جسور | Bridges',
  tagline: 'شبكة إغاثة محلية مستقلة',
  ambulance: 'إسعاف',
  police: 'شرطة',
  fire: 'مطافئ',
  medical: 'طبية',
  shelter: 'مأوى',
  food: 'غذاء',
  water: 'ماء',
  missing: 'مفقود',
  volunteer: 'متطوع',
  repair: 'إصلاحات',
  security: 'أمن',
  critical: 'حرج جداً',
  urgent: 'عاجل',
  medium: 'متوسط',
  normal: 'عادي',
  create_request: 'إضافة بلاغ جديد',
  nearby_requests: 'البلاغات القريبة',
  mesh_status: 'حالة الاتصال المحلي',
  connected_nodes: 'أجهزة قريبة منك',
  no_nodes: 'لا توجد أجهزة متصلة',
  help_now: 'استجابة سريعة',
  take_photo: 'التقاط صورة',
  camera_error: 'الكاميرا غير متاحة',
  emergency_numbers: 'أرقام الطوارئ',
  download_zip: 'تحميل كود التطبيق ZIP',
  messages: 'الرسائل',
  profile: 'الملف الشخصي',
  medical_id: 'الهوية الطبية',
  blood_type: 'فصيلة الدم',
  allergies: 'حساسية',
  conditions: 'أمراض مزمنة',
  save: 'حفظ',
  sos: 'إشارة استغاثة SOS',
};
