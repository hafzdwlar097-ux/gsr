
import { ReliefRequest, UserProfile, Message } from "../types";

const STORAGE_KEYS = {
  PROFILE: 'bridges_profile',
  REQUESTS: 'bridges_requests',
  MESSAGES: 'bridges_messages',
};

export const localDB = {
  saveProfile(profile: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getProfile(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveRequest(request: ReliefRequest) {
    const requests = this.getRequests();
    requests.unshift(request);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  getRequests(): ReliefRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  updateRequest(updatedReq: ReliefRequest) {
    const requests = this.getRequests().map(r => r.id === updatedReq.id ? updatedReq : r);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  saveMessage(msg: Message) {
    const messages = this.getMessages();
    messages.push(msg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  getMessages(): Message[] {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  // Simulated P2P Sync: Merges two lists of requests based on timestamp (LWW - Last Writer Wins)
  syncRequests(remoteRequests: ReliefRequest[]) {
    const local = this.getRequests();
    const map = new Map<string, ReliefRequest>();
    
    [...local, ...remoteRequests].forEach(req => {
      const existing = map.get(req.id);
      if (!existing || req.timestamp > existing.timestamp) {
        map.set(req.id, req);
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(merged));
    return merged;
  }
};
