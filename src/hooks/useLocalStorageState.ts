import { useEffect, useState } from "react";

type SetStateAction<T> = T | ((current: T) => T);

function resolveInitialValue<T>(key: string, initialValue: T) {
  if (typeof window === "undefined") {
    return initialValue;
  }

  const storedValue = window.localStorage.getItem(key);

  if (storedValue === null) {
    return initialValue;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return initialValue;
  }
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => resolveInitialValue(key, initialValue));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  function updateValue(action: SetStateAction<T>) {
    setValue((current) =>
      typeof action === "function" ? (action as (current: T) => T)(current) : action,
    );
  }

  return [value, updateValue] as const;
}
