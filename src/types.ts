export type UserRole = "USER" | "ADMIN";
export type ResourceStatus = "PENDING" | "APPROVED" | "REJECTED";
export type DifficultyLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  postedBy: string; // User ID
  postedByName: string; // Denormalized for display
  difficulty: DifficultyLevel;
  status: ResourceStatus;
  isFeatured: boolean;
  likesCount: number;
  savesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  resourceId: string;
  parentId?: string | null;
  replies?: Comment[];
  createdAt: string;
}

export interface Like {
  id: string; // userId_resourceId
  userId: string;
  resourceId: string;
  createdAt: string;
}

export interface Save {
  id: string; // userId_resourceId
  userId: string;
  resourceId: string;
  createdAt: string;
}
