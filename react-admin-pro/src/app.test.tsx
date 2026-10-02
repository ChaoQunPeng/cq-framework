import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all heavy dependencies before importing app
const mockReplace = vi.fn();
const mockHistory = {
  location: {
    pathname: '/welcome',
    search: '',
    hash: '',
  },
  replace: mockReplace,
};

const mockGetStoredCurrentUser = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock('@umijs/max', () => ({
  history: mockHistory,
  Link: ({ children }: any) => children,
}));

vi.mock('@/utils/auth', () => ({
  getStoredCurrentUser: mockGetStoredCurrentUser,
}));

vi.mock('@/services/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock('@/components', () => ({
  AvatarDropdown: () => null,
  DocLink: () => null,
  ErrorBoundary: ({ children }: any) => children,
  Footer: () => null,
  LangDropdown: () => null,
  OfflineBanner: () => null,
  VersionDropdown: () => null,
}));

vi.mock('@ant-design/pro-components', () => ({
  SettingDrawer: () => null,
}));

vi.mock('@ant-design/icons', () => ({
  LinkOutlined: () => null,
}));

vi.mock('./requestErrorConfig', () => ({
  errorConfig: {},
}));

vi.mock('../config/defaultSettings', () => ({
  default: { navTheme: 'light' },
}));

describe('app getInitialState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: 'admin-id',
      username: 'Test User',
      phone: '13800000000',
      roleCodes: [],
      permissionCodes: [],
    });
    mockHistory.location = {
      pathname: '/welcome',
      search: '',
      hash: '',
    };
  });

  it('should restore currentUser when not on login page', async () => {
    const { getInitialState } = await import('./app');
    mockGetStoredCurrentUser.mockReturnValue({
      name: 'Test User',
    });

    const state = await getInitialState();

    expect(mockGetStoredCurrentUser).toHaveBeenCalled();
    expect(state.currentUser).toEqual({
      userid: 'admin-id',
      name: 'Test User',
      phone: '13800000000',
      roleCodes: [],
      permissionCodes: [],
    });
    expect(state.settingDrawerOpen).toBe(false);
    expect(state.fetchUserInfo).toBeDefined();
  });

  it('should redirect to login when currentUser is unavailable', async () => {
    const { getInitialState } = await import('./app');
    mockGetStoredCurrentUser.mockReturnValue(undefined);

    const state = await getInitialState();

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('/user/login?redirect='),
    );
    expect(state.currentUser).toBeUndefined();
  });

  it('should not fetch currentUser on login page', async () => {
    const { getInitialState } = await import('./app');
    mockHistory.location = {
      pathname: '/user/login',
      search: '',
      hash: '',
    };

    const state = await getInitialState();

    expect(mockGetStoredCurrentUser).not.toHaveBeenCalled();
    expect(state.currentUser).toBeUndefined();
    expect(state.fetchUserInfo).toBeDefined();
  });

  it('should encode redirect path correctly when the session is unavailable', async () => {
    const { getInitialState } = await import('./app');
    mockHistory.location = {
      pathname: '/admin/users',
      search: '?page=2',
      hash: '#section',
    };
    mockGetStoredCurrentUser.mockReturnValue(undefined);

    await getInitialState();

    expect(mockReplace).toHaveBeenCalledWith(
      `/user/login?redirect=${encodeURIComponent('/admin/users?page=2#section')}`,
    );
  });

  it('should include default settings in initial state', async () => {
    const { getInitialState } = await import('./app');
    mockGetStoredCurrentUser.mockReturnValue({ name: 'User' });

    const state = await getInitialState();

    expect(state.settings).toEqual({ navTheme: 'light' });
  });

  it('fetchUserInfo should return user data on success', async () => {
    const { getInitialState } = await import('./app');
    mockGetStoredCurrentUser.mockReturnValue({
      name: 'Fetched User',
    });

    const state = await getInitialState();

    const user = await state.fetchUserInfo?.();
    expect(user).toEqual({
      userid: 'admin-id',
      name: 'Test User',
      phone: '13800000000',
      roleCodes: [],
      permissionCodes: [],
    });
  });
});
