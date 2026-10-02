import { describe, expect, it } from 'vitest';
import access from './access';

describe('access', () => {
  it('should map backend permission codes to operation access', () => {
    const initialState = {
      currentUser: {
        name: 'User Manager',
        roleCodes: [],
        permissionCodes: ['user:read', 'user:update'],
      },
    };

    const result = access(initialState);

    expect(result.canReadUser).toBe(true);
    expect(result.canUpdateUser).toBe(true);
    expect(result.canCreateUser).toBe(false);
    expect(result.canDeleteUser).toBe(false);
  });

  it('should keep role mutation actions exclusive to super administrators', () => {
    const initialState = {
      currentUser: {
        name: 'Role Manager',
        roleCodes: [],
        permissionCodes: ['role:read', 'role:update'],
      },
    };

    const result = access(initialState);

    expect(result.canReadRole).toBe(true);
    expect(result.canUpdateRole).toBe(false);
    expect(result.canCreateRole).toBe(false);
    expect(result.canDeleteRole).toBe(false);
  });

  it('should allow a super administrator to create users and manage roles', () => {
    const result = access({
      currentUser: {
        roleCodes: ['super_admin'],
        permissionCodes: ['user:create', 'role:create', 'role:update', 'role:delete'],
      },
    });

    expect(result.canCreateUser).toBe(true);
    expect(result.canCreateRole).toBe(true);
    expect(result.canUpdateRole).toBe(true);
    expect(result.canDeleteRole).toBe(true);
  });

  it('should deny permissions that are not assigned', () => {
    const initialState = {
      currentUser: {
        name: 'Read-only User',
        roleCodes: [],
        permissionCodes: ['user:read'],
      },
    };

    const result = access(initialState);

    expect(result.canReadUser).toBe(true);
    expect(result.canUpdateUser).toBe(false);
    expect(result.canReadRole).toBe(false);
  });

  it('should deny all access when currentUser is undefined', () => {
    const initialState = {
      currentUser: undefined,
    };

    const result = access(initialState);

    expect(result.canReadUser).toBe(false);
    expect(result.canReadRole).toBe(false);
  });

  it('should deny all access when initialState is undefined', () => {
    const result = access(undefined);

    expect(result.canReadUser).toBe(false);
    expect(result.canReadRole).toBe(false);
  });
});
