import type { User } from '../entities/user'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByClerkId(clerkUserId: string): Promise<User | null>
  getOrCreate(clerkUserId: string, email: string, name: string): Promise<string>
}
