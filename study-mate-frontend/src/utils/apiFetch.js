export const apiFetch = async (
  url,
  options = {},
  { accessToken, refreshAccessToken, logout }
) => {
  const doFetch = async (token) => {
    const headers = { ...(options.headers || {}) };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const newToken = await refreshAccessToken(accessToken);

    if (!newToken) {
      await logout();
      throw new Error("Unauthorized");
    }

    res = await doFetch(newToken);
  }

  return res;
};
