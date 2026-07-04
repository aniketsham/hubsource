import { Resource, ResourceStatus } from "../types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const resourceService = {
  async getAll(filters?: {
    category?: string;
    status?: ResourceStatus;
    isFeatured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "All")
      params.set("category", filters.category);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.isFeatured !== undefined)
      params.set("featured", String(filters.isFeatured));
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const res = await fetch(`/api/resources?${params}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to fetch resources");
    const data = await res.json();
    return data.resources as Resource[];
  },

  async getById(id: string): Promise<Resource | null> {
    const res = await fetch(`/api/resources/${id}`, { headers: authHeader() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch resource");
    return res.json();
  },

  async create(resource: Partial<Resource>): Promise<string | undefined> {
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(resource),
    });
    if (!res.ok)
      throw new Error((await res.json()).error ?? "Failed to create resource");
    const data = await res.json();
    return data.id;
  },

  async updateStatus(id: string, status: ResourceStatus): Promise<void> {
    const res = await fetch(`/api/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
  },

  async toggleFeatured(id: string, isFeatured: boolean): Promise<void> {
    const res = await fetch(`/api/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ isFeatured }),
    });
    if (!res.ok) throw new Error("Failed to toggle featured");
  },

  async toggleLike(
    id: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const res = await fetch(`/api/resources/${id}/like`, {
      method: "POST",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to toggle like");
    return res.json();
  },

  async toggleSave(
    id: string,
  ): Promise<{ saved: boolean; savesCount: number }> {
    const res = await fetch(`/api/resources/${id}/save`, {
      method: "POST",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to toggle save");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/resources/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete resource");
  },
  async getComments(resourceId: string) {
    const res = await fetch(`/api/resources/${resourceId}/comments`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json();
  },

  async postComment(resourceId: string, content: string, parentId?: string) {
    const res = await fetch(`/api/resources/${resourceId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ content, ...(parentId ? { parentId } : {}) }),
    });
    if (!res.ok)
      throw new Error((await res.json()).error ?? "Failed to post comment");
    return res.json();
  },

  async deleteComment(resourceId: string, commentId: string): Promise<void> {
    const res = await fetch(
      `/api/resources/${resourceId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: authHeader(),
      },
    );
    if (!res.ok) throw new Error("Failed to delete comment");
  },

  async getSaved(): Promise<Resource[]> {
    const res = await fetch("/api/user/saved", { headers: authHeader() });
    if (!res.ok) throw new Error("Failed to fetch saved resources");
    return res.json();
  },

  async getMySubmissions(): Promise<Resource[]> {
    const res = await fetch("/api/user/submissions", { headers: authHeader() });
    if (!res.ok) throw new Error("Failed to fetch submissions");
    return res.json();
  },
};
