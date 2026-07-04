import { hasPermission, requirePermission } from '@/lib/rbac';
import { db } from '@/db';

jest.mock('@/db', () => {
  return {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn(),
    }
  }
});

describe('RBAC Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if user has required permission', async () => {
    // first call returns limit object, second call returns array
    (db.where as jest.Mock)
      .mockReturnValueOnce({
        limit: jest.fn().mockResolvedValue([{ roleId: 'role-1' }])
      })
      .mockResolvedValueOnce([{ permissionName: 'create:task' }]);

    const result = await hasPermission('user-1', 'org-1', 'create:task');
    expect(result).toBe(true);
  });

  it('should return true if user has wildcard permission', async () => {
    (db.where as jest.Mock)
      .mockReturnValueOnce({
        limit: jest.fn().mockResolvedValue([{ roleId: 'role-1' }])
      })
      .mockResolvedValueOnce([{ permissionName: '*' }]);

    const result = await hasPermission('user-1', 'org-1', 'create:task');
    expect(result).toBe(true);
  });

  it('should return false if user does not have permission', async () => {
    (db.where as jest.Mock)
      .mockReturnValueOnce({
        limit: jest.fn().mockResolvedValue([{ roleId: 'role-1' }])
      })
      .mockResolvedValueOnce([{ permissionName: 'read:task' }]);

    const result = await hasPermission('user-1', 'org-1', 'create:task');
    expect(result).toBe(false);
  });

  it('should throw error when requiring permission user lacks', async () => {
    (db.where as jest.Mock)
      .mockReturnValueOnce({
        limit: jest.fn().mockResolvedValue([{ roleId: 'role-1' }])
      })
      .mockResolvedValueOnce([{ permissionName: 'read:task' }]);

    await expect(requirePermission('user-1', 'org-1', 'create:task')).rejects.toThrow('Forbidden: Requires create:task permission');
  });
});
