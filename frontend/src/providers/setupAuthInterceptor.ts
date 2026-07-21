import { type AxiosInstance } from "axios";
import type { AuthUser } from "../features/auth/types/authUser";
import { refreshCoordinator } from "./refreshCoordinator";

const SKIP_REFRESH_URLS = ["/auth/refresh", "/auth/login", "/auth/logout"];

type InterceptorCallbacks = {
  onRefreshSuccess: (user: AuthUser) => void;
  onRefreshFailure: () => Promise<void>;
};

export function setupAuthInterceptor(
  axiosInstance: AxiosInstance,
  { onRefreshSuccess, onRefreshFailure }: InterceptorCallbacks,
): () => void {
  const interceptorId = axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const requestUrl: string = error.config?.url ?? "";
      const isAuthError = error.response?.status === 401;
      const isSkippedUrl = SKIP_REFRESH_URLS.some((url) =>
        requestUrl.includes(url),
      );

      if (!isAuthError || isSkippedUrl || error.config._retry) {
        return Promise.reject(error);
      }

      if (refreshCoordinator.isRefreshing) {
        return refreshCoordinator
          .enqueue()
          .then(() => axiosInstance.request(error.config));
      }

      error.config._retry = true;

      try {
        const refreshedUser = await refreshCoordinator.refresh();
        onRefreshSuccess(refreshedUser);
        refreshCoordinator.flush();
        return axiosInstance.request(error.config);
      } catch (refreshError) {
        refreshCoordinator.flush(refreshError);
        await onRefreshFailure();
        return Promise.reject(refreshError);
      }
    },
  );

  return () => axiosInstance.interceptors.response.eject(interceptorId);
}
