export type AccessType = 'PUBLIC' | 'PASSWORD';
export type ShareType = 'ONE_TIME' | 'TIME_BASED';
export type LinkStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'USED' | 'INVALID';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface ShareLinkMeta {
  url: string;
  accessType: AccessType;
  shareType: ShareType;
  expiresAt: string;
  viewCount: number;
  status: LinkStatus;
  accessKey?: string;
}
