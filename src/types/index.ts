export interface AgentIdentity {
  id: string;
  publicKey: string;
  metadata: Record<string, any>;
  createdAt: number;
}

export interface Attestation {
  agentId: string;
  payload: any;
  signature: string;
  timestamp: number;
  nonce: string;
}

export interface SessionState {
  sessionId: string;
  agentId: string;
  startTime: number;
  lastActive: number;
  attestations: string[]; // Hashes of attestations
}

export interface DriftReport {
  agentId: string;
  driftScore: number; // 0 to 1
  anomalies: string[];
  detectedAt: number;
}
