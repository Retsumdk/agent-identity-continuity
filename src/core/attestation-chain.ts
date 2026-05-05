import { Attestation } from '../types';
import { CryptoUtils } from '../utils/crypto';

export class AttestationChain {
  private chain: Attestation[] = [];

  constructor(private agentId: string, private privateKey: string, private publicKey: string) {}

  append(payload: any): Attestation {
    const lastHash = this.chain.length > 0 
      ? CryptoUtils.hash(this.chain[this.chain.length - 1]) 
      : 'genesis';
    
    const enrichedPayload = {
      ...payload,
      previousHash: lastHash,
      chainIndex: this.chain.length,
    };

    const timestamp = Date.now();
    const nonce = CryptoUtils.generateNonce();
    const dataToSign = { agentId: this.agentId, payload: enrichedPayload, timestamp, nonce };
    const signature = CryptoUtils.sign(this.privateKey, dataToSign);

    const attestation: Attestation = {
      agentId: this.agentId,
      payload: enrichedPayload,
      signature,
      timestamp,
      nonce,
    };

    this.chain.push(attestation);
    return attestation;
  }

  verifyChain(): boolean {
    for (let i = 0; i < this.chain.length; i++) {
      const current = this.chain[i];
      
      // 1. Verify signature
      const dataToVerify = {
        agentId: current.agentId,
        payload: current.payload,
        timestamp: current.timestamp,
        nonce: current.nonce,
      };
      if (!CryptoUtils.verify(this.publicKey, current.signature, dataToVerify)) {
        return false;
      }

      // 2. Verify link
      if (i > 0) {
        const previous = this.chain[i - 1];
        if (current.payload.previousHash !== CryptoUtils.hash(previous)) {
          return false;
        }
        if (current.payload.chainIndex !== i) {
          return false;
        }
      } else {
        if (current.payload.previousHash !== 'genesis') {
          return false;
        }
      }
    }
    return true;
  }

  getLatest(): Attestation | undefined {
    return this.chain[this.chain.length - 1];
  }

  getChain(): Attestation[] {
    return [...this.chain];
  }

  size(): number {
    return this.chain.length;
  }
}
