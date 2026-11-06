const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    status!: number;
    details?: Record<string, string[]>;

    constructor(message: string, status: number, details?: Record<string, string[]>){
        super(message);
        this.status = status;
        this.details = details;
    }
}

type RequestOptions = {
    method?: string;
    body?: unknown;
    token?: string | null;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.error ?? "Something went wrong", response.status, data?.details);
  }

  return data as T;
}