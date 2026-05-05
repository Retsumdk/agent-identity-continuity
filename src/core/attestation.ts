import { CryptoUtils } from '../utils/crypto';
import { Attestation } from '../types';

export class AttestationEngine {
  constructor(private privateKey: string, private publicKey: string) {}

  createAttestation(agentId: string, payload: any): Attestation {
    const timestamp = Date.now();
    const nonce = CryptoUtils.generateNonce();
    const dataToSign = { agentId, payload, timestamp, nonce };
    const signature = CryptoUtils.sign(this.privateKey, dataToSign);

    return {
      agentId,
      payload,
      signature,
      timestamp,
      nonce,
    };
  }

  verifyAttestation(attestation: Attestation): boolean {
    const dataToVerify = {
      agentId: attestation.agentId,
      payload: attestation.payload,
      timestamp: attestation.timestamp,
      nonce: attestation.nonce,
    };
    return CryptoUtils.verify(this.publicKey, attestation.signature, dataToVerify);
  }

  static verifyExternal(attestation: Attestation, publicKey: string): boolean {
    const dataToVerify = {
      agentId: attestation.agentId,
      payload: attestation.payload,
      timestamp: attestation.timestamp,
      nonce: attestation.nonce,
    };
    return CryptoUtils.verify(publicKey, attestation.signature, dataToVerify);
  }
}
