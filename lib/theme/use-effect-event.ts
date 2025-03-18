"use client";

import { useCallback, useRef } from "react";

export function useEffectEvent<F extends (...params: never[]) => unknown>(callback: F): F {
  const ref = useRef(callback);
  ref.current = callback;

  return useCallback(((...params) => ref.current(...params)) as F, []);
}
