# agent-identity-continuity

Cryptographic identity verification for AI agents across sessions with attestation and drift detection.

## Overview

This repository provides a robust framework for managing AI agent identities using Ed25519 cryptography. It ensures that an agent's identity remains consistent across different session boundaries through verifiable attestation chains and drift detection mechanisms.

## Features

- **Cryptographic Identity:** Secure Ed25519 key generation and management for AI agents.
- **Verifiable Attestations:** Create signed payloads that prove an agent's identity and state at a specific point in time.
- **Attestation Chains:** Link attestations together in a cryptographic chain to ensure session continuity and prevent tampering.
- **Session Management:** Track agent activity and verify that sessions haven't timed out or been hijacked.
- **Drift Detection:** Monitor for behavioral or metadata drift that might indicate an identity compromise or significant change.

## Installation

```bash
bun install agent-identity-continuity
```

## Usage

```typescript
import { AgentIdentitySuite } from 'agent-identity-continuity';

const suite = new AgentIdentitySuite();

// Setup a new agent
const agent = await suite.setupAgent('agent-uuid', { role: 'analyzer' });

// Record activity with a chained attestation
const att = agent.chain.append({ action: 'data-processing', status: 'success' });
agent.session.recordActivity(agent.session.sessionId, att);

// Verify continuity
const isContinuous = suite.sessions.verifyContinuity(agent.session.sessionId);
console.log(`Continuous: ${isContinuous}`);

// Check for drift
const report = suite.drift.analyzeDrift(agent.identity.id, agent.session, agent.chain.getChain());
console.log(`Drift Score: ${report.driftScore}`);
```

## Architecture

- **IdentityManager:** Handles the lifecycle of agent keys and metadata.
- **AttestationEngine:** Responsible for signing and verifying individual attestations.
- **AttestationChain:** Manages a sequential history of attestations linked by hashes.
- **SessionManager:** Oversees active agent sessions and activity recording.
- **DriftDetector:** Implements logic to score and report on identity drift.

## License

MIT - See [LICENSE](./LICENSE) for details.

## Author

Retsumdk
