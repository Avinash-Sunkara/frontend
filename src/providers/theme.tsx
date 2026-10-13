"use client";
import { createContext, useContext, useEffect } from "react";

const Ctx = createContext<{ theme: "dark" }>({ theme: "dark" });
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);

  return <Ctx.Provider value={{ theme: "dark" }}>{children}</Ctx.Provider>;
}
