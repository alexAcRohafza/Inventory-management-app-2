export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
  VENDOR = 'VENDOR'
}

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
} 