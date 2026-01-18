import { AuditService } from './audit-service';
import { InMemoryAuditStorage } from './storage';
import { ActorType, EventCategory, EventSeverity, CreateAuditEventInput } from './types';

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
      const event1 = await service.logEvent({
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
});
