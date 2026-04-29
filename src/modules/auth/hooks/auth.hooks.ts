import { useModel, useRequest } from "@umijs/max";
import { flushSync } from "react-dom";
import { authService } from "../service/auth.service";
import type { LoginDto, RegisterDto } from "../types/auth.types";

export const useLogin = () => {
  return useRequest((data: LoginDto) => authService.login(data), {
    manual: true,
  });
};

export const useRegister = () => {
  return useRequest((data: RegisterDto) => authService.register(data), {
    manual: true,
  });
};

export const useLogout = () => {
  const { setInitialState } = useModel("@@initialState");

  return useRequest(() => authService.logout(), {
    manual: true,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("accessExpireAt");
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: undefined,
        }));
      });
      window.location.href = "/auth/login";
    },
  });
};

export const useRefreshToken = () => {
  return useRequest(
    (refreshToken: string) => authService.refreshToken(refreshToken),
    { manual: true }
  );
};

export const useIsAuthenticated = () => {
  const { initialState } = useModel("@@initialState");
  return !!initialState?.currentUser;
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const isTokenExpired = (): boolean => {
  const expireAt = localStorage.getItem("accessExpireAt");
  if (!expireAt) return true;
  return new Date(expireAt) < new Date();
};
