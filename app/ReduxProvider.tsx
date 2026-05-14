"use client";

import { ReactNode, useMemo } from "react";
import { Provider } from "react-redux";
import { initStore } from "@/store/wrapper";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => initStore(), []);
  return <Provider store={store}>{children}</Provider>;
}



