import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../utils/apiFetch";
import { useCallback } from "react";

export const useApi = () => {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const request = useCallback(
    async (url, options = {}) => {
      return apiFetch(
        url,
        options,
        { accessToken, refreshAccessToken, logout }
      );
    },
    [accessToken, refreshAccessToken, logout]
  );

  return request;
};
