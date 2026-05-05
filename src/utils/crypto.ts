import * as crypto from 'node:crypto';

export class CryptoUtils {
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  static sign(privateKey: string, data: any): string {
    const signer = crypto.createSign('RSA-SHA256'); // Note: Ed25519 uses different signing, but crypto.sign is easier
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.sign(null, Buffer.from(content), privateKey).toString('base64');
  }

  static verify(publicKey: string, signature: string, data: any): boolean {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.verify(null, Buffer.from(content), publicKey, Buffer.from(signature, 'base64'));
  }

  static hash(data: any): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  static generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
