import { refreshToken } from "../features/auth/api";
import type { AuthUser } from "../features/auth/types/authUser";

type QueueEntry = {
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

export class RefreshCoordinator {
  private inflightRequest: Promise<AuthUser> | null = null;
  private queue: QueueEntry[] = [];

  refresh(): Promise<AuthUser> {
    if (this.inflightRequest) return this.inflightRequest;

    this.inflightRequest = refreshToken().finally(() => {
      this.inflightRequest = null;
    });

    return this.inflightRequest;
  }

  get isRefreshing(): boolean {
    return this.inflightRequest !== null;
  }

  enqueue(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  flush(error: unknown = null): void {
    this.queue.forEach(({ resolve, reject }) =>
      error ? reject(error) : resolve(),
    );
    this.queue = [];
  }
}

export const refreshCoordinator = new RefreshCoordinator();
