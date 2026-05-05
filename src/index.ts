import { IdentityManager } from './core/identity';
import { AttestationEngine } from './core/attestation';
import { SessionManager } from './core/session';
import { DriftDetector } from './core/drift';
import { AttestationChain } from './core/attestation-chain';

export * from './types';
export * from './core/identity';
export * from './core/attestation';
export * from './core/session';
export * from './core/drift';
export * from './core/attestation-chain';
export * from './utils/crypto';

/**
 * High-level Agent Identity Suite
 */
export class AgentIdentitySuite {
  public identity: IdentityManager;
  public sessions: SessionManager;
  public drift: DriftDetector;

  constructor() {
    this.identity = new IdentityManager();
    this.sessions = new SessionManager();
    this.drift = new DriftDetector();
  }

  /**
   * Helper to quickly setup a managed agent session with continuity tracking
   */
  async setupAgent(agentId: string, metadata: any = {}) {
    const identity = this.identity.createIdentity(agentId, metadata);
    const privKey = this.identity.getPrivateKey(agentId)!;
    
    const engine = new AttestationEngine(privKey, identity.publicKey);
    const chain = new AttestationChain(agentId, privKey, identity.publicKey);
    const session = this.sessions.startSession(agentId);
    
    this.drift.registerBaseProfile(agentId, metadata);

    return {
      identity,
      engine,
      chain,
      session,
    };
  }
}

// Example usage if run directly
if (require.main === module) {
  const suite = new AgentIdentitySuite();
  
  (async () => {
    console.log('--- Initializing Agent Identity Suite ---');
    const agent = await suite.setupAgent('agent-007', { role: 'orchestrator', clearance: 'high' });
    console.log(`Agent created: ${agent.identity.id}`);
    console.log(`Public Key: ${agent.identity.publicKey.substring(0, 50)}...`);

    console.log('\n--- Creating Attestations ---');
    const att1 = agent.chain.append({ action: 'process-task', taskId: 'T1' });
    suite.sessions.recordActivity(agent.session.sessionId, att1);
    console.log(`Attestation 1 created. Chain size: ${agent.chain.size()}`);

    const att2 = agent.chain.append({ action: 'send-message', to: 'agent-008' });
    suite.sessions.recordActivity(agent.session.sessionId, att2);
    console.log(`Attestation 2 created. Chain size: ${agent.chain.size()}`);

    console.log('\n--- Verifying Continuity ---');
    const isContinuous = suite.sessions.verifyContinuity(agent.session.sessionId);
    console.log(`Session continuity: ${isContinuous}`);

    const isChainValid = agent.chain.verifyChain();
    console.log(`Attestation chain valid: ${isChainValid}`);

    console.log('\n--- Analyzing Drift ---');
    const report = suite.drift.analyzeDrift(
      agent.identity.id, 
      agent.session, 
      agent.chain.getChain()
    );
    console.log(`Drift Score: ${report.driftScore}`);
    if (report.anomalies.length > 0) {
      console.log('Anomalies detected:', report.anomalies);
    } else {
      console.log('No anomalies detected.');
    }

    console.log('\n--- Exporting Identity ---');
    const exported = suite.identity.exportIdentity('agent-007');
    console.log('Identity exported successfully.');
    
    console.log('\n--- Suite Operations Complete ---');
  })();
}
