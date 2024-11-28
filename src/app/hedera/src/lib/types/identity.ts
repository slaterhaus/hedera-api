export interface UserIdentity {
  did: string;
  email: string;
  publicKey: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface CreateIdentityDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}