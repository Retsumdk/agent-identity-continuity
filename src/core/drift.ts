import { DriftReport, Attestation, SessionState } from '../types';

export class DriftDetector {
  private baseMetadata: Map<string, any> = new Map();

  registerBaseProfile(agentId: string, metadata: any): void {
    this.baseMetadata.set(agentId, metadata);
  }

  analyzeDrift(agentId: string, currentSession: SessionState, recentAttestations: Attestation[]): DriftReport {
    const base = this.baseMetadata.get(agentId) || {};
    let driftScore = 0;
    const anomalies: string[] = [];

    // 1. Time-based drift
    const sessionDuration = Date.now() - currentSession.startTime;
    if (sessionDuration > 24 * 60 * 60 * 1000) {
      driftScore += 0.2;
      anomalies.push('Extended session duration detected');
    }

    // 2. Behavioral frequency drift
    if (recentAttestations.length > 100) {
      driftScore += 0.3;
      anomalies.push('High frequency of attestations detected');
    }

    // 3. Metadata consistency check (simplified)
    recentAttestations.forEach(att => {
      if (att.payload && att.payload.metadata) {
        Object.keys(att.payload.metadata).forEach(key => {
          if (base[key] !== undefined && base[key] !== att.payload.metadata[key]) {
            driftScore += 0.1;
            anomalies.push(`Metadata mismatch for key: ${key}`);
          }
        });
      }
    });

    // Cap drift score
    driftScore = Math.min(driftScore, 1.0);

    return {
      agentId,
      driftScore,
      anomalies,
      detectedAt: Date.now(),
    };
  }
}
