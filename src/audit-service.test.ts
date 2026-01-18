import { AuditService } from './audit-service';
import { InMemoryAuditStorage } from './storage';
import { ActorType, EventCategory, EventSeverity, CreateAuditEventInput, AuditEvent } from './types';
import { computeEventHash, verifyEventHash, computeChainHash, verifyChainIntegrity } from './hash-utils';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    service = new AuditService({
      storage: new InMemoryAuditStorage(),
    });
  });

  describe('logEvent', () => {
    it('should log a security event', async () => {
      const input: CreateAuditEventInput = {
        tenantId: 'tenant-1',
        actor: {
          type: ActorType.USER,
          id: 'user-1',
          tenantId: 'tenant-1',
        },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const event = await service.logEvent(input);

      expect(event.eventId).toBeDefined();
      expect(event.tenantId).toBe('tenant-1');
      expect(event.actor.id).toBe('user-1');
      expect(event.category).toBe(EventCategory.SECURITY);
      expect(event.action).toBe('user.login');
      expect(event.outcome).toBe('success');
    });

    it('should log a financial event', async () => {
      const input: CreateAuditEventInput = {
        tenantId: 'tenant-1',
        actor: {
          type: ActorType.USER,
          id: 'user-1',
          tenantId: 'tenant-1',
        },
        category: EventCategory.FINANCIAL,
        severity: EventSeverity.INFO,
        action: 'sale.created',
        resource: 'sale:12345',
        outcome: 'success',
        details: {
          amount: 1000,
          currency: 'NGN',
        },
      };

      const event = await service.logEvent(input);

      expect(event.category).toBe(EventCategory.FINANCIAL);
      expect(event.resource).toBe('sale:12345');
      expect(event.details).toEqual({ amount: 1000, currency: 'NGN' });
    });

    it('should log an administrative event', async () => {
      const input: CreateAuditEventInput = {
        tenantId: 'tenant-1',
        actor: {
          type: ActorType.USER,
          id: 'admin-1',
          tenantId: 'tenant-1',
        },
        category: EventCategory.ADMINISTRATIVE,
        severity: EventSeverity.WARNING,
        action: 'role.assigned',
        resource: 'user:user-2',
        outcome: 'success',
        details: {
          roleId: 'role-123',
          roleName: 'Manager',
        },
      };

      const event = await service.logEvent(input);

      expect(event.category).toBe(EventCategory.ADMINISTRATIVE);
      expect(event.severity).toBe(EventSeverity.WARNING);
    });

    it('should log a system event', async () => {
      const input: CreateAuditEventInput = {
        tenantId: 'tenant-1',
        actor: {
          type: ActorType.SYSTEM,
          id: 'system',
        },
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        action: 'backup.completed',
        outcome: 'success',
      };

      const event = await service.logEvent(input);

      expect(event.actor.type).toBe(ActorType.SYSTEM);
      expect(event.actor.id).toBe('system');
    });
  });

  describe('getEvent', () => {
    it('should retrieve an event by ID', async () => {
      const input: CreateAuditEventInput = {
        tenantId: 'tenant-1',
        actor: {
          type: ActorType.USER,
          id: 'user-1',
          tenantId: 'tenant-1',
        },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      };

      const logged = await service.logEvent(input);
      const retrieved = await service.getEvent('tenant-1', logged.eventId);

      expect(retrieved).toEqual(logged);
    });

    it('should enforce tenant isolation', async () => {
      const input: CreateAuditEventInput = {
        tenantId: 'tenant-1',
        actor: {
          type: ActorType.USER,
          id: 'user-1',
          tenantId: 'tenant-1',
        },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      };

      const logged = await service.logEvent(input);
      const retrieved = await service.getEvent('tenant-2', logged.eventId);

      expect(retrieved).toBeNull();
    });
  });

  describe('queryEvents', () => {
    beforeEach(async () => {
      // Log multiple events for testing
      await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      });

      await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.FINANCIAL,
        severity: EventSeverity.INFO,
        action: 'sale.created',
        outcome: 'success',
      });

      await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-2', tenantId: 'tenant-1' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.ERROR,
        action: 'user.login',
        outcome: 'failure',
      });
    });

    it('should query all events for a tenant', async () => {
      const result = await service.queryEvents({
        tenantId: 'tenant-1',
      });

      expect(result.events).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by actor', async () => {
      const result = await service.queryEvents({
        tenantId: 'tenant-1',
        actorId: 'user-1',
      });

      expect(result.events).toHaveLength(2);
      expect(result.events.every(e => e.actor.id === 'user-1')).toBe(true);
    });

    it('should filter by category', async () => {
      const result = await service.queryEvents({
        tenantId: 'tenant-1',
        category: EventCategory.SECURITY,
      });

      expect(result.events).toHaveLength(2);
      expect(result.events.every(e => e.category === EventCategory.SECURITY)).toBe(true);
    });

    it('should filter by outcome', async () => {
      const result = await service.queryEvents({
        tenantId: 'tenant-1',
        outcome: 'failure',
      });

      expect(result.events).toHaveLength(1);
      expect(result.events[0].outcome).toBe('failure');
    });

    it('should support pagination', async () => {
      const result = await service.queryEvents({
        tenantId: 'tenant-1',
        limit: 2,
        offset: 0,
      });

      expect(result.events).toHaveLength(2);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('verifyIntegrity', () => {
    it('should verify intact audit log', async () => {
      // Log multiple events
      await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      });

      await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.FINANCIAL,
        severity: EventSeverity.INFO,
        action: 'sale.created',
        outcome: 'success',
      });

      const result = await service.verifyIntegrity('tenant-1');

      expect(result.intact).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return intact for empty log', async () => {
      const result = await service.verifyIntegrity('tenant-1');

      expect(result.intact).toBe(true);
    });
  });

  describe('proveEvent', () => {
    it('should provide proof for an event', async () => {
      await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      });

      const event2 = await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.FINANCIAL,
        severity: EventSeverity.INFO,
        action: 'sale.created',
        outcome: 'success',
      });

      const proof = await service.proveEvent('tenant-1', event2.eventId);

      expect(proof).toBeDefined();
      expect(proof!.event.eventId).toBe(event2.eventId);
      expect(proof!.hash).toBeDefined();
      expect(proof!.previousHash).toBeDefined(); // Should have previous event
    });

    it('should return null for non-existent event', async () => {
      const proof = await service.proveEvent('tenant-1', 'non-existent');

      expect(proof).toBeNull();
    });
  });

  describe('tenant isolation', () => {
    it('should enforce strict tenant boundaries', async () => {
      // Log events in different tenants
      await service.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      });

      await service.logEvent({
        tenantId: 'tenant-2',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-2' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      });

      // Query each tenant
      const result1 = await service.queryEvents({ tenantId: 'tenant-1' });
      const result2 = await service.queryEvents({ tenantId: 'tenant-2' });

      expect(result1.events).toHaveLength(1);
      expect(result2.events).toHaveLength(1);
      expect(result1.events[0].tenantId).toBe('tenant-1');
      expect(result2.events[0].tenantId).toBe('tenant-2');
    });
  });

  describe('immutability', () => {
    it('should not allow duplicate event IDs', async () => {
      const storage = new InMemoryAuditStorage();
      const testService = new AuditService({ storage });

      const input: CreateAuditEventInput = {
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      };

      const event = await testService.logEvent(input);

      // Try to append the same event again (simulating tampering)
      await expect(
        storage.appendEvent(event, 'fake-hash')
      ).rejects.toThrow('Event already exists');
    });
  });

  describe('hard stop condition', () => {
    it('module can emit audit event and later cryptographically prove integrity', async () => {
      // This test proves the hard stop condition:
      // "Any module can emit an audit event and later prove who did what,
      // when, under which tenant context, and detect if the audit trail was tampered with."

      const storage = new InMemoryAuditStorage();
      const auditService = new AuditService({ storage });

      // 1. Emit audit events from different actors
      const userEvent = await auditService.logEvent({
        tenantId: 'tenant-acme',
        actor: { type: ActorType.USER, id: 'user-john', tenantId: 'tenant-acme' },
        category: EventCategory.FINANCIAL,
        severity: EventSeverity.INFO,
        action: 'sale.created',
        resource: 'sale:12345',
        outcome: 'success',
        details: { amount: 5000, currency: 'NGN' },
        ipAddress: '192.168.1.100',
      });

      const systemEvent = await auditService.logEvent({
        tenantId: 'tenant-acme',
        actor: { type: ActorType.SYSTEM, id: 'system' },
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        action: 'backup.completed',
        outcome: 'success',
      });

      const serviceEvent = await auditService.logEvent({
        tenantId: 'tenant-acme',
        actor: { type: ActorType.SERVICE, id: 'payment-gateway', tenantId: 'tenant-acme' },
        category: EventCategory.FINANCIAL,
        severity: EventSeverity.INFO,
        action: 'payment.processed',
        resource: 'payment:67890',
        outcome: 'success',
        details: { transactionId: 'txn-abc123' },
      });

      // 2. Verify we can prove WHO did WHAT
      expect(userEvent.actor.type).toBe(ActorType.USER);
      expect(userEvent.actor.id).toBe('user-john');
      expect(userEvent.action).toBe('sale.created');

      expect(systemEvent.actor.type).toBe(ActorType.SYSTEM);
      expect(serviceEvent.actor.type).toBe(ActorType.SERVICE);
      expect(serviceEvent.actor.id).toBe('payment-gateway');

      // 3. Verify we can prove WHEN it happened
      expect(userEvent.timestamp).toBeInstanceOf(Date);
      expect(systemEvent.timestamp).toBeInstanceOf(Date);
      expect(serviceEvent.timestamp).toBeInstanceOf(Date);

      // 4. Verify tenant context is preserved
      expect(userEvent.tenantId).toBe('tenant-acme');
      expect(systemEvent.tenantId).toBe('tenant-acme');
      expect(serviceEvent.tenantId).toBe('tenant-acme');

      // 5. Verify integrity is intact (no tampering)
      const integrityResult = await auditService.verifyIntegrity('tenant-acme');
      expect(integrityResult.intact).toBe(true);

      // 6. Prove specific event with cryptographic proof
      const proof = await auditService.proveEvent('tenant-acme', serviceEvent.eventId);
      expect(proof).not.toBeNull();
      expect(proof!.event.eventId).toBe(serviceEvent.eventId);
      expect(proof!.hash).toBeDefined();
      expect(proof!.hash.length).toBe(64); // SHA-256 produces 64 hex characters
      expect(proof!.previousHash).toBeDefined(); // Links to previous event

      // 7. Verify the proof is cryptographically valid
      const { computeEventHash } = await import('./hash-utils');
      const recomputedHash = computeEventHash(proof!.event, proof!.previousHash || undefined);
      expect(recomputedHash).toBe(proof!.hash);
    });

    it('should detect tampering when audit log is modified', async () => {
      // Create a custom storage that allows direct manipulation for testing
      class TamperableStorage extends InMemoryAuditStorage {
        private internalEvents: Map<string, { event: import('./types').AuditEvent; hash: string }> = new Map();
        private internalEventsByTenant: Map<string, Array<{ event: import('./types').AuditEvent; hash: string }>> = new Map();

        override async appendEvent(event: import('./types').AuditEvent, hash: string): Promise<import('./types').AuditEvent> {
          const key = `${event.tenantId}:${event.eventId}`;
          if (this.internalEvents.has(key)) {
            throw new Error(`Event already exists: ${event.eventId}`);
          }
          const record = { event, hash };
          this.internalEvents.set(key, record);
          if (!this.internalEventsByTenant.has(event.tenantId)) {
            this.internalEventsByTenant.set(event.tenantId, []);
          }
          this.internalEventsByTenant.get(event.tenantId)!.push(record);
          return event;
        }

        override async getAllEvents(tenantId: string): Promise<Array<{ event: import('./types').AuditEvent; hash: string }>> {
          const tenantEvents = this.internalEventsByTenant.get(tenantId) || [];
          return [...tenantEvents].sort((a, b) =>
            a.event.timestamp.getTime() - b.event.timestamp.getTime()
          );
        }

        override async getEvent(tenantId: string, eventId: string): Promise<{ event: import('./types').AuditEvent; hash: string } | null> {
          const key = `${tenantId}:${eventId}`;
          return this.internalEvents.get(key) || null;
        }

        override async queryEvents(input: import('./types').QueryAuditEventsInput): Promise<import('./types').AuditEventQueryResult> {
          const tenantEvents = this.internalEventsByTenant.get(input.tenantId) || [];
          return {
            events: tenantEvents.map(r => r.event),
            total: tenantEvents.length,
            hasMore: false,
          };
        }

        override async getPreviousEventHash(tenantId: string): Promise<string | null> {
          const tenantEvents = this.internalEventsByTenant.get(tenantId) || [];
          if (tenantEvents.length === 0) return null;
          return tenantEvents[tenantEvents.length - 1].hash;
        }

        // Tampering method - directly modify an event
        tamperWithEvent(tenantId: string, eventId: string, newAction: string): void {
          const key = `${tenantId}:${eventId}`;
          const record = this.internalEvents.get(key);
          if (record) {
            // Modify the event without updating the hash (tampering!)
            record.event.action = newAction;
          }
        }
      }

      const storage = new TamperableStorage();
      const auditService = new AuditService({ storage });

      // Log some events
      const event1 = await auditService.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.SECURITY,
        severity: EventSeverity.INFO,
        action: 'user.login',
        outcome: 'success',
      });

      await auditService.logEvent({
        tenantId: 'tenant-1',
        actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
        category: EventCategory.FINANCIAL,
        severity: EventSeverity.INFO,
        action: 'sale.created',
        outcome: 'success',
      });

      // Verify integrity before tampering
      const beforeTampering = await auditService.verifyIntegrity('tenant-1');
      expect(beforeTampering.intact).toBe(true);

      // Now tamper with the first event
      storage.tamperWithEvent('tenant-1', event1.eventId, 'malicious.action');

      // Verify integrity after tampering - should detect the modification
      const afterTampering = await auditService.verifyIntegrity('tenant-1');
      expect(afterTampering.intact).toBe(false);
      expect(afterTampering.reason).toContain('Chain integrity broken');
      expect(afterTampering.affectedEvents).toBeDefined();
      expect(afterTampering.affectedEvents!.length).toBeGreaterThan(0);
    });
  });
});

describe('Hash Utilities', () => {
  const createMockEvent = (overrides: Partial<AuditEvent> = {}): AuditEvent => ({
    eventId: 'event-1',
    tenantId: 'tenant-1',
    timestamp: new Date('2026-01-18T12:00:00Z'),
    actor: { type: ActorType.USER, id: 'user-1', tenantId: 'tenant-1' },
    category: EventCategory.SECURITY,
    severity: EventSeverity.INFO,
    action: 'user.login',
    outcome: 'success',
    ...overrides,
  });

  describe('verifyEventHash', () => {
    it('should return true for valid hash', () => {
      const event = createMockEvent();
      const hash = computeEventHash(event);
      expect(verifyEventHash(event, hash)).toBe(true);
    });

    it('should return false for invalid hash', () => {
      const event = createMockEvent();
      expect(verifyEventHash(event, 'invalid-hash')).toBe(false);
    });

    it('should verify hash with previous hash', () => {
      const event = createMockEvent();
      const previousHash = 'abc123previoushash';
      const hash = computeEventHash(event, previousHash);
      expect(verifyEventHash(event, hash, previousHash)).toBe(true);
    });
  });

  describe('computeChainHash', () => {
    it('should compute hashes for a chain of events', () => {
      const events = [
        createMockEvent({ eventId: 'event-1' }),
        createMockEvent({ eventId: 'event-2', timestamp: new Date('2026-01-18T12:01:00Z') }),
        createMockEvent({ eventId: 'event-3', timestamp: new Date('2026-01-18T12:02:00Z') }),
      ];

      const hashes = computeChainHash(events);

      expect(hashes).toHaveLength(3);
      expect(hashes[0]).toBe(computeEventHash(events[0]));
      expect(hashes[1]).toBe(computeEventHash(events[1], hashes[0]));
      expect(hashes[2]).toBe(computeEventHash(events[2], hashes[1]));
    });

    it('should return empty array for empty events', () => {
      const hashes = computeChainHash([]);
      expect(hashes).toHaveLength(0);
    });
  });

  describe('verifyChainIntegrity', () => {
    it('should detect mismatched lengths', () => {
      const events = [createMockEvent()];
      const hashes = computeChainHash(events);

      const result = verifyChainIntegrity(events, [...hashes, 'extra-hash']);
      expect(result.intact).toBe(false);
      expect(result.firstBrokenIndex).toBe(0);
    });

    it('should verify valid chain', () => {
      const events = [
        createMockEvent({ eventId: 'event-1' }),
        createMockEvent({ eventId: 'event-2', timestamp: new Date('2026-01-18T12:01:00Z') }),
      ];
      const hashes = computeChainHash(events);

      const result = verifyChainIntegrity(events, hashes);
      expect(result.intact).toBe(true);
    });

    it('should detect corrupted hash in chain', () => {
      const events = [
        createMockEvent({ eventId: 'event-1' }),
        createMockEvent({ eventId: 'event-2', timestamp: new Date('2026-01-18T12:01:00Z') }),
      ];
      const hashes = computeChainHash(events);
      hashes[1] = 'corrupted-hash';

      const result = verifyChainIntegrity(events, hashes);
      expect(result.intact).toBe(false);
      expect(result.firstBrokenIndex).toBe(1);
    });
  });
});
