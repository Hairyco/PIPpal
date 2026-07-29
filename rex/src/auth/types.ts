export type AuthProviderId = 'email' | 'google';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  provider: AuthProviderId;
  createdAt: string;
};

export type AuthSession = {
  user: AuthUser;
  signedInAt: string;
};
