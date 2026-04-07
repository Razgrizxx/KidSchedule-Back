import { createHash } from 'crypto';
import { Test } from '@nestjs/testing';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { NotificationsService } from '../notifications/notifications.service';

// ── Helpers ────────────────────────────────────────────────────────────────────

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Build a minimal message row as Prisma would return it. */
function makeMessage(overrides: Partial<{
  id: string;
  content: string;
  contentHash: string;
  previousHash: string;
  familyId: string;
  senderId: string;
  isSystemMessage: boolean;
}> = {}) {
  return {
    id:              overrides.id            ?? 'msg-1',
    content:         overrides.content       ?? 'hello',
    contentHash:     overrides.contentHash   ?? 'hash-abc',
    previousHash:    overrides.previousHash  ?? '0',
    familyId:        overrides.familyId      ?? 'fam-1',
    senderId:        overrides.senderId      ?? 'user-1',
    isSystemMessage: overrides.isSystemMessage ?? false,
    attachmentUrl:   null,
    status:          'SENT',
    createdAt:       new Date(),
    updatedAt:       new Date(),
    sender: {
      id:        overrides.senderId ?? 'user-1',
      firstName: 'Ana',
      lastName:  'García',
      avatarUrl: null,
    },
  };
}

// ── Mocks ──────────────────────────────────────────────────────────────────────

const prismaMock = {
  message: {
    findFirst:   jest.fn(),
    create:      jest.fn(),
    findMany:    jest.fn(),
    updateMany:  jest.fn(),
  },
  familyMember: {
    findFirst: jest.fn(),
  },
};

const familyServiceMock = {
  assertMember: jest.fn().mockResolvedValue(undefined),
};

const notificationsMock = {
  sendToFamily: jest.fn().mockResolvedValue(undefined),
};

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('MessagingService', () => {
  let service: MessagingService;

  beforeEach(async () => {
    // resetAllMocks clears calls AND resets implementations (unlike clearAllMocks)
    jest.resetAllMocks();

    // Re-apply safe defaults after reset
    familyServiceMock.assertMember.mockResolvedValue(undefined);
    notificationsMock.sendToFamily.mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        MessagingService,
        { provide: PrismaService,       useValue: prismaMock },
        { provide: FamilyService,       useValue: familyServiceMock },
        { provide: NotificationsService, useValue: notificationsMock },
      ],
    }).compile();

    service = module.get(MessagingService);
  });

  // ── send() ───────────────────────────────────────────────────────────────────

  describe('send()', () => {
    it('first message of a conversation gets previousHash of "0"', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null); // no previous message
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage({ contentHash: data.contentHash, previousHash: data.previousHash })),
      );

      await service.send('fam-1', 'user-1', { content: 'Hola' });

      const { previousHash } = prismaMock.message.create.mock.calls[0][0].data;
      expect(previousHash).toBe('0');
    });

    it('subsequent message gets previousHash equal to the last contentHash', async () => {
      const lastHash = 'a'.repeat(64); // simulated previous hash
      prismaMock.message.findFirst.mockResolvedValue({ contentHash: lastHash });
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage({ contentHash: data.contentHash, previousHash: data.previousHash })),
      );

      await service.send('fam-1', 'user-1', { content: 'Segundo mensaje' });

      const { previousHash } = prismaMock.message.create.mock.calls[0][0].data;
      expect(previousHash).toBe(lastHash);
    });

    it('contentHash is a valid SHA-256 hex string (64 lowercase hex chars)', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage({ contentHash: data.contentHash })),
      );

      await service.send('fam-1', 'user-1', { content: 'Test' });

      const { contentHash } = prismaMock.message.create.mock.calls[0][0].data;
      expect(contentHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('contentHash changes when message content changes', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage({ contentHash: data.contentHash })),
      );

      await service.send('fam-1', 'user-1', { content: 'Mensaje A' });
      const hashA = prismaMock.message.create.mock.calls[0][0].data.contentHash;

      jest.clearAllMocks();
      familyServiceMock.assertMember.mockResolvedValue(undefined);
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage({ contentHash: data.contentHash })),
      );

      await service.send('fam-1', 'user-1', { content: 'Mensaje B' });
      const hashB = prismaMock.message.create.mock.calls[0][0].data.contentHash;

      expect(hashA).not.toBe(hashB);
    });

    it('notification preview is truncated to 80 chars with ellipsis', async () => {
      const longContent = 'x'.repeat(100);
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.message.create.mockResolvedValue(makeMessage({ content: longContent }));

      await service.send('fam-1', 'user-1', { content: longContent });

      const { body } = notificationsMock.sendToFamily.mock.calls[0][2];
      expect(body).toHaveLength(81); // 80 chars + '…'
      expect(body.endsWith('…')).toBe(true);
    });

    it('short content is not truncated', async () => {
      const shortContent = 'Corto';
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.message.create.mockResolvedValue(makeMessage({ content: shortContent }));

      await service.send('fam-1', 'user-1', { content: shortContent });

      const { body } = notificationsMock.sendToFamily.mock.calls[0][2];
      expect(body).toBe(shortContent);
    });

    it('notification is sent to the family excluding the sender', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.message.create.mockResolvedValue(makeMessage());

      await service.send('fam-1', 'user-1', { content: 'Hola' });

      expect(notificationsMock.sendToFamily).toHaveBeenCalledWith(
        'fam-1',
        'user-1',
        expect.objectContaining({ data: { type: 'MESSAGE', familyId: 'fam-1' } }),
      );
    });

    it('assertMember is called before anything else', async () => {
      familyServiceMock.assertMember.mockRejectedValue(new Error('Not a member'));

      await expect(
        service.send('fam-1', 'outsider', { content: 'Hi' }),
      ).rejects.toThrow('Not a member');

      expect(prismaMock.message.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });
  });

  // ── verifyChain() ────────────────────────────────────────────────────────────

  describe('verifyChain()', () => {
    it('returns isValid: true and no violations for an empty conversation', async () => {
      prismaMock.message.findMany.mockResolvedValue([]);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result).toEqual({ isValid: true, totalMessages: 0, violations: [] });
    });

    it('single message with previousHash "0" is valid', async () => {
      prismaMock.message.findMany.mockResolvedValue([
        makeMessage({ id: 'msg-1', previousHash: '0', contentHash: 'hash-1' }),
      ]);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.totalMessages).toBe(1);
    });

    it('a chain of N messages with correct links is valid', async () => {
      prismaMock.message.findMany.mockResolvedValue([
        makeMessage({ id: 'msg-1', previousHash: '0',     contentHash: 'hash-1' }),
        makeMessage({ id: 'msg-2', previousHash: 'hash-1', contentHash: 'hash-2' }),
        makeMessage({ id: 'msg-3', previousHash: 'hash-2', contentHash: 'hash-3' }),
      ]);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.totalMessages).toBe(3);
    });

    it('detects a single broken link (tampered previousHash)', async () => {
      prismaMock.message.findMany.mockResolvedValue([
        makeMessage({ id: 'msg-1', previousHash: '0',          contentHash: 'hash-1' }),
        makeMessage({ id: 'msg-2', previousHash: 'TAMPERED',   contentHash: 'hash-2' }), // should be hash-1
        makeMessage({ id: 'msg-3', previousHash: 'hash-2',     contentHash: 'hash-3' }),
      ]);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('msg-2');
    });

    it('detects multiple broken links', async () => {
      prismaMock.message.findMany.mockResolvedValue([
        makeMessage({ id: 'msg-1', previousHash: '0',        contentHash: 'hash-1' }),
        makeMessage({ id: 'msg-2', previousHash: 'WRONG',    contentHash: 'hash-2' }),
        makeMessage({ id: 'msg-3', previousHash: 'ALSO-WRONG', contentHash: 'hash-3' }),
      ]);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(2);
      expect(result.violations[0]).toContain('msg-2');
      expect(result.violations[1]).toContain('msg-3');
    });

    it('first message with wrong previousHash (should be "0") is a violation', async () => {
      prismaMock.message.findMany.mockResolvedValue([
        makeMessage({ id: 'msg-1', previousHash: 'not-zero', contentHash: 'hash-1' }),
      ]);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('msg-1');
    });

    it('a gap in the middle (deleted message) is detected', async () => {
      // msg-2 references hash-1, msg-3 references hash-2, but msg-2 is missing.
      // From verifyChain's perspective msg-2.previousHash should equal msg-1.contentHash,
      // and msg-3.previousHash should equal msg-2.contentHash — the gap shows as a broken link.
      prismaMock.message.findMany.mockResolvedValue([
        makeMessage({ id: 'msg-1', previousHash: '0',      contentHash: 'hash-1' }),
        // msg-2 deleted — msg-3 still references hash-2 which no longer has a predecessor
        makeMessage({ id: 'msg-3', previousHash: 'hash-2', contentHash: 'hash-3' }),
      ]);

      const result = await service.verifyChain('fam-1', 'user-1');

      // msg-3's previousHash is 'hash-2' but the previous message has contentHash 'hash-1'
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.includes('msg-3'))).toBe(true);
    });

    it('violation message includes the message id', async () => {
      const targetId = 'target-message-uuid';
      prismaMock.message.findMany.mockResolvedValue([
        makeMessage({ id: 'msg-1',    previousHash: '0',       contentHash: 'hash-1' }),
        makeMessage({ id: targetId,   previousHash: 'tampered', contentHash: 'hash-2' }),
      ]);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result.violations[0]).toContain(targetId);
    });

    it('totalMessages reflects the actual count regardless of validity', async () => {
      const messages = Array.from({ length: 10 }, (_, i) =>
        makeMessage({ id: `msg-${i}`, previousHash: 'broken', contentHash: `hash-${i}` }),
      );
      prismaMock.message.findMany.mockResolvedValue(messages);

      const result = await service.verifyChain('fam-1', 'user-1');

      expect(result.totalMessages).toBe(10);
    });
  });

  // ── sendSystemMessage() ──────────────────────────────────────────────────────

  describe('sendSystemMessage()', () => {
    it('returns undefined if no family member exists', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.familyMember.findFirst.mockResolvedValue(null);

      const result = await service.sendSystemMessage('fam-1', 'System: test');

      expect(result).toBeUndefined();
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it('first system message gets previousHash "0"', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.familyMember.findFirst.mockResolvedValue({ userId: 'user-1' });
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage({ contentHash: data.contentHash, previousHash: data.previousHash })),
      );

      await service.sendSystemMessage('fam-1', 'System: custodia cambiada');

      const { previousHash } = prismaMock.message.create.mock.calls[0][0].data;
      expect(previousHash).toBe('0');
    });

    it('system message is flagged with isSystemMessage: true', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.familyMember.findFirst.mockResolvedValue({ userId: 'user-1' });
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage(data)),
      );

      await service.sendSystemMessage('fam-1', 'System: test');

      const { isSystemMessage } = prismaMock.message.create.mock.calls[0][0].data;
      expect(isSystemMessage).toBe(true);
    });

    it('system message continues the chain from the last regular message', async () => {
      const lastHash = 'b'.repeat(64);
      prismaMock.message.findFirst.mockResolvedValue({ contentHash: lastHash });
      prismaMock.familyMember.findFirst.mockResolvedValue({ userId: 'user-1' });
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage(data)),
      );

      await service.sendSystemMessage('fam-1', 'System: test');

      const { previousHash } = prismaMock.message.create.mock.calls[0][0].data;
      expect(previousHash).toBe(lastHash);
    });

    it('contentHash is a valid SHA-256 hex string', async () => {
      prismaMock.message.findFirst.mockResolvedValue(null);
      prismaMock.familyMember.findFirst.mockResolvedValue({ userId: 'user-1' });
      prismaMock.message.create.mockImplementation(({ data }) =>
        Promise.resolve(makeMessage(data)),
      );

      await service.sendSystemMessage('fam-1', 'System: audit');

      const { contentHash } = prismaMock.message.create.mock.calls[0][0].data;
      expect(contentHash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  // ── SHA-256 algorithm properties (pure logic, no mocks) ──────────────────────

  describe('SHA-256 hash properties', () => {
    it('same inputs always produce the same hash (deterministic)', () => {
      const input = 'contenidoFECHAprevHash';
      expect(sha256(input)).toBe(sha256(input));
    });

    it('different content produces a different hash', () => {
      const ts = new Date().toISOString();
      const prev = '0';
      expect(sha256(`Mensaje A${ts}${prev}`)).not.toBe(sha256(`Mensaje B${ts}${prev}`));
    });

    it('different previousHash produces a different hash', () => {
      const content = 'mismo contenido';
      const ts = new Date().toISOString();
      expect(sha256(`${content}${ts}hash-v1`)).not.toBe(sha256(`${content}${ts}hash-v2`));
    });

    it('output is always exactly 64 hex characters', () => {
      const inputs = ['a', '', 'x'.repeat(10_000), '🇦🇷'];
      for (const input of inputs) {
        expect(sha256(input)).toMatch(/^[a-f0-9]{64}$/);
      }
    });

    it('a one-character change in content produces a completely different hash (avalanche effect)', () => {
      const hashA = sha256('Hola mundo');
      const hashB = sha256('Hola mund0'); // '0' instead of 'o'

      // Hamming distance: at least 20% of bits should differ
      const diffBits = [...hashA].filter((c, i) => c !== hashB[i]).length;
      expect(diffBits).toBeGreaterThan(hashA.length * 0.2);
    });
  });

  // ── findAll() ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns messages in ascending chronological order (reversed from DB query)', async () => {
      // Prisma returns DESC, service reverses to ASC
      const msgs = [
        makeMessage({ id: 'msg-3' }),
        makeMessage({ id: 'msg-2' }),
        makeMessage({ id: 'msg-1' }),
      ];
      prismaMock.message.findMany.mockResolvedValue(msgs);

      const result = await service.findAll('fam-1', 'user-1');

      expect(result.messages.map((m) => m.id)).toEqual(['msg-1', 'msg-2', 'msg-3']);
    });

    it('nextCursor is null when fewer messages than take limit are returned', async () => {
      prismaMock.message.findMany.mockResolvedValue([makeMessage()]);

      const result = await service.findAll('fam-1', 'user-1', undefined, 50);

      expect(result.nextCursor).toBeNull();
    });

    it('nextCursor is the oldest message id (for loading earlier pages)', async () => {
      const take = 3;
      // Prisma returns DESC (newest first): msg-3, msg-2, msg-1
      const msgs = [
        makeMessage({ id: 'msg-3' }),
        makeMessage({ id: 'msg-2' }),
        makeMessage({ id: 'msg-1' }),
      ];
      prismaMock.message.findMany.mockResolvedValue(msgs);

      const result = await service.findAll('fam-1', 'user-1', undefined, take);

      // .reverse() mutates the array in-place before nextCursor is evaluated,
      // so messages[0] after the reverse is the oldest message (msg-1).
      // This is the correct cursor: the next page loads messages older than msg-1.
      expect(result.nextCursor).toBe('msg-1');
    });
  });
});
