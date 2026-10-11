import { appConfig } from "@/config/app-config";
import { ApiResponse, ApiError } from "@/types";

interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiGetCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 15000; // 15s cache TTL for GET requests

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = appConfig.apiUrl) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("dentalcare_token") || localStorage.getItem("auth_token") : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          success: false,
          message: data.message || "Terjadi kesalahan pada server",
          errors: data.errors,
        };
        throw error;
      }

      // If response has both data and meta (PaginatedResult), preserve the wrapper
      if (data && typeof data === "object" && "data" in data && "meta" in data) {
        return data as T;
      }

      return (data.data ?? data) as T;
    } catch (err: any) {
      if (err.success === false) throw err;
      throw {
        success: false,
        message: err.message || "Gagal terhubung ke REST API backend",
      };
    }
  }

  private invalidateCache(endpoint: string) {
    const resource = endpoint.split("?")[0].split("/")[1] || "";
    for (const key of apiGetCache.keys()) {
      if (!resource || key.includes(`/${resource}`)) {
        apiGetCache.delete(key);
      }
    }
  }

  clearCache(prefix?: string) {
    if (!prefix) {
      apiGetCache.clear();
      return;
    }
    for (const key of apiGetCache.keys()) {
      if (key.includes(prefix)) {
        apiGetCache.delete(key);
      }
    }
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const cleanParams: Record<string, string> = {};
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== "" && val !== "undefined" && val !== "all") {
          cleanParams[key] = String(val);
        }
      }
    }
    const searchString = new URLSearchParams(cleanParams).toString();
    const query = searchString ? `?${searchString}` : "";
    const fullKey = `${endpoint}${query}`;

    // 1. Check in-memory cache
    const cached = apiGetCache.get(fullKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return Promise.resolve(cached.data as T);
    }

    // 2. Check in-flight requests (deduplication)
    if (inFlightRequests.has(fullKey)) {
      return inFlightRequests.get(fullKey)! as Promise<T>;
    }

    // 3. Make HTTP request and cache result
    const promise = this.request<T>(fullKey, { method: "GET" })
      .then((res) => {
        apiGetCache.set(fullKey, { data: res, timestamp: Date.now() });
        inFlightRequests.delete(fullKey);
        return res;
      })
      .catch((err) => {
        inFlightRequests.delete(fullKey);
        throw err;
      });

    inFlightRequests.set(fullKey, promise);
    return promise;
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    this.invalidateCache(endpoint);
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    this.invalidateCache(endpoint);
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    this.invalidateCache(endpoint);
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    this.invalidateCache(endpoint);
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

