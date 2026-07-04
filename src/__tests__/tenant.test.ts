import { validateApiKey } from '@/lib/tenant';
import { db } from '@/db';

jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    headers: any;
    constructor(url: string, init?: any) {
      this.headers = init?.headers || new Headers();
    }
  }
}));

import { NextRequest } from 'next/server';

describe('Tenant Middleware Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if no auth header', async () => {
    const req = new NextRequest('http://localhost', {
      headers: new Headers(),
    });
    const result = await validateApiKey(req);
    expect(result).toBeNull();
  });

  it('should validate valid API key', async () => {
    const req = new NextRequest('http://localhost', {
      headers: new Headers({
        'Authorization': 'Bearer nx_testkey123',
      }),
    });
    (db.limit as jest.Mock).mockResolvedValueOnce([{ id: 'key-1', organizationId: 'org-1', userId: 'user-1' }]);

    const result = await validateApiKey(req);
    expect(result).toEqual({
      organizationId: 'org-1',
      userId: 'user-1',
      keyId: 'key-1'
    });
  });
});
