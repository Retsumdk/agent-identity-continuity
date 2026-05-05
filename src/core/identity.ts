import { CryptoUtils } from '../utils/crypto';
import { AgentIdentity } from '../types';

export class IdentityManager {
  private identities: Map<string, { identity: AgentIdentity; privateKey: string }> = new Map();

  createIdentity(id: string, metadata: Record<string, any> = {}): AgentIdentity {
    const { publicKey, privateKey } = CryptoUtils.generateKeyPair();
    const identity: AgentIdentity = {
      id,
      publicKey,
      metadata,
      createdAt: Date.now(),
    };
    this.identities.set(id, { identity, privateKey });
    return identity;
  }

  getIdentity(id: string): AgentIdentity | undefined {
    return this.identities.get(id)?.identity;
  }

  getPrivateKey(id: string): string | undefined {
    return this.identities.get(id)?.privateKey;
  }

  exportIdentity(id: string): string {
    const data = this.identities.get(id);
    if (!data) throw new Error(`Identity ${id} not found`);
    return JSON.stringify(data);
  }

  importIdentity(data: string): AgentIdentity {
    const parsed = JSON.parse(data);
    this.identities.set(parsed.identity.id, parsed);
    return parsed.identity;
  }

  listIdentities(): AgentIdentity[] {
    return Array.from(this.identities.values()).map(d => d.identity);
  }

  deleteIdentity(id: string): boolean {
    return this.identities.delete(id);
  }
}
