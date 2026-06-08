import { useCallback, useEffect, useState } from "react";

export function useAsync(asyncFunction, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState("");

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await asyncFunction();

      setData(result);
      return result;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "A apărut o eroare.";

      setError(typeof message === "string" ? message : "A apărut o eroare.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {});
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
}