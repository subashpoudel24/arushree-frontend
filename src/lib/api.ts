const BASE = '/api/v1';
const SAFE_METHODS = ['GET', 'HEAD'];

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const readCookie = (name: string) =>
  document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.slice(name.length + 1);

const ensureCsrfToken = async () => {
  const existing = readCookie('csrf_token');
  if (existing) return existing;
  const res = await fetch(`${BASE}/auth/csrf`, { credentials: 'same-origin' });
  const body = await res.json();
  return body.csrfToken as string;
};

const send = async (path: string, init: RequestInit) => {
  const method = init.method ?? 'GET';
  const headers = new Headers(init.headers);
  // The browser sets the multipart boundary itself for FormData.
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (!SAFE_METHODS.includes(method)) {
    headers.set('x-csrf-token', await ensureCsrfToken());
  }
  return fetch(`${BASE}${path}`, { ...init, method, headers, credentials: 'same-origin' });
};

// Several requests can hit an expired token together; they share one refresh.
let refreshing: Promise<boolean> | null = null;

const refreshSession = () => {
  refreshing ??= (async () => {
    try {
      let res = await send('/auth/refresh', { method: 'POST' });
      if (res.status === 409) {
        // Another tab is refreshing. Its new cookies apply here too.
        await new Promise((resolve) => setTimeout(resolve, 600));
        return true;
      }
      if (res.status === 403) {
        document.cookie = 'csrf_token=; Max-Age=0; path=/';
        res = await send('/auth/refresh', { method: 'POST' });
      }
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  skipRefresh?: boolean;
  // For routes open to guests: if the session has truly ended, carry on as a guest.
  guestOk?: boolean;
}

export const api = async <T = unknown>(path: string, options: RequestOptions = {}): Promise<T> => {
  const isForm = options.body instanceof FormData;
  const init: RequestInit = {
    method: options.method ?? 'GET',
    body: isForm ? (options.body as FormData) : options.body === undefined ? undefined : JSON.stringify(options.body),
  };

  let res: Response;
  try {
    res = await send(path, init);
    if (res.status === 401 && !options.skipRefresh) {
      const refreshed = await refreshSession();
      if (refreshed || options.guestOk) res = await send(path, init);
    }
    if (res.status === 403) {
      const copy = await res.clone().json().catch(() => null);
      if (copy?.error?.code === 'csrf_invalid') {
        document.cookie = 'csrf_token=; Max-Age=0; path=/';
        res = await send(path, init);
      }
    }
  } catch {
    throw new ApiRequestError(0, 'network_error', 'Cannot reach the server. Please check your connection.');
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiRequestError(
      res.status,
      data?.error?.code ?? 'server_error',
      data?.error?.message ?? 'Something went wrong. Please try again.'
    );
  }
  return data as T;
};

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';
