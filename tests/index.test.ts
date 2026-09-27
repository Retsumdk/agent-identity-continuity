import { describe, test, expect } from "bun:test";
import { IdentityManager } from "../src/core/identity";
import { AttestationEngine } from "../src/core/attestation";
import { SessionManager } from "../src/core/session";
import { DriftDetector } from "../src/core/drift";
import { CryptoUtils } from "../src/utils/crypto";

describe("IdentityManager", () => {
  test("creates identities with key pairs", () => {
    const mgr = new IdentityManager();
    const identity = mgr.createIdentity("agent-1", { role: "worker" });
    expect(identity.id).toBe("agent-1");
    expect(identity.publicKey.length).toBeGreaterThan(0);
    expect(mgr.getPrivateKey("agent-1")!.length).toBeGreaterThan(0);
  });

  test("round-trips identities through export/import", () => {
    const mgr = new IdentityManager();
    mgr.createIdentity("agent-2", { role: "auditor" });
    const restored = new IdentityManager();
    restored.importIdentity(mgr.exportIdentity("agent-2"));
    expect(restored.getIdentity("agent-2")?.metadata.role).toBe("auditor");
    expect(mgr.deleteIdentity("agent-2")).toBe(true);
    expect(mgr.getIdentity("agent-2")).toBeUndefined();
  });
});

describe("CryptoUtils", () => {
  test("signs and verifies data", () => {
    const { publicKey, privateKey } = CryptoUtils.generateKeyPair();
    const signature = CryptoUtils.sign(privateKey, { action: "ping" });
    expect(CryptoUtils.verify(publicKey, signature, { action: "ping" })).toBe(true);
    expect(CryptoUtils.verify(publicKey, signature, { action: "pong" })).toBe(false);
  });

  test("hashes are deterministic and nonce generation is unique", () => {
    expect(CryptoUtils.hash("a")).toBe(CryptoUtils.hash("a"));
    expect(CryptoUtils.hash("a")).not.toBe(CryptoUtils.hash("b"));
    expect(CryptoUtils.generateNonce()).not.toBe(CryptoUtils.generateNonce());
  });
});
