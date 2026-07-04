import { logAudit } from '@/lib/audit';
import { db } from '@/db';

jest.mock('@/db', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue({}),
  },
}));

describe('Audit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log an audit event correctly', async () => {
    await logAudit('org-1', 'user-1', 'CREATE_TASK', 'task', 'task-1', null, null);

    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith({
      organizationId: 'org-1',
      userId: 'user-1',
      action: 'CREATE_TASK',
      entityType: 'task',
      entityId: 'task-1',
      oldValues: null,
      newValues: null,
      ipAddress: '127.0.0.1',
      userAgent: 'unknown',
    });
  });
});
