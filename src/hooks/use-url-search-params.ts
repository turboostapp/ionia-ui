import qs from "qs";
import { useCallback, useEffect, useState } from "react";

export const useUrlSearchParams = (): [
  Record<string, any>,
  (params: Record<string, any>) => void,
] => {
  // 获取当前 URL 参数并解析
  const getParams = useCallback(() => {
    return qs.parse(window.location.search, { ignoreQueryPrefix: true });
  }, []);

  // 获取当前 searchParams
  const [searchParams, setSearchParams] =
    useState<Record<string, any>>(getParams);

  // 监听浏览器前进/后退，更新 searchParams
  useEffect(() => {
    const handlePopState = (): void => {
      setSearchParams(getParams());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [getParams]);

  // 更新 URL 的 searchParams
  const updateSearchParams = useCallback(
    (newParams: Record<string, any>): void => {
      const stringified = qs.stringify(newParams, { addQueryPrefix: true });
      const newUrl = `${window.location.pathname}${stringified}`;

      window.history.pushState({}, "", newUrl);

      setSearchParams(newParams);
    },
    [setSearchParams],
  );

  return [searchParams, updateSearchParams];
};
