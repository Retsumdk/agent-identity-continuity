import { SessionState, Attestation } from '../types';
import { CryptoUtils } from '../utils/crypto';

export class SessionManager {
  private sessions: Map<string, SessionState> = new Map();

  startSession(agentId: string): SessionState {
    const sessionId = CryptoUtils.generateNonce();
    const session: SessionState = {
      sessionId,
      agentId,
      startTime: Date.now(),
      lastActive: Date.now(),
      attestations: [],
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  recordActivity(sessionId: string, attestation: Attestation): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    if (attestation.agentId !== session.agentId) {
      throw new Error(`Agent ID mismatch: ${attestation.agentId} vs ${session.agentId}`);
    }

    session.lastActive = Date.now();
    session.attestations.push(CryptoUtils.hash(attestation));
  }

  verifyContinuity(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // A session is continuous if there has been activity within the last hour
    const timeout = 60 * 60 * 1000;
    return Date.now() - session.lastActive < timeout;
  }

  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
