
export enum Priority {
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  MEDIUM = 'MEDIUM',
  NORMAL = 'NORMAL'
}

export enum RequestType {
  AMBULANCE = 'AMBULANCE',
  POLICE = 'POLICE',
  FIRE = 'FIRE',
  MEDICAL = 'MEDICAL',
  SHELTER = 'SHELTER',
  FOOD = 'FOOD',
  WATER = 'WATER',
  MISSING = 'MISSING',
  VOLUNTEER = 'VOLUNTEER',
  REPAIR = 'REPAIR',
  SECURITY = 'SECURITY'
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: string;
  skills: string[];
  currentStatus: 'HEALTHY' | 'SICK' | 'HELPING' | 'IN_DANGER';
  shareMedicalInEmergency: boolean;
  medicalInfo?: {
    bloodType: string;
    allergies: string;
    conditions: string;
  };
}

export interface ReliefRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: RequestType;
  description: string;
  priority: Priority;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  image?: string; 
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface PeerInfo {
  id: string;
  name: string;
  phone: string;
  status: string;
  lastSeen: number;
  location?: [number, number];
}

export interface AppState {
  profile: UserProfile | null;
  requests: ReliefRequest[];
  messages: Message[];
  meshNodes: number;
  isSyncing: boolean;
  nearbyPeers: PeerInfo[];
}
