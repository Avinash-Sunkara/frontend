"use client";
import { createContext, useContext, useEffect, useState } from "react";
const Ctx = createContext<{ theme: "dark" | "light"; toggle: () => void }>({ theme: "dark", toggle: () => {} });
export const useTheme = () => useContext(Ctx);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  useEffect(() => {
    const saved = localStorage.getItem("rb-theme");
    const t = saved === "dark" || saved === "light" ? saved : "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.classList.toggle("light", t === "light");
  }, []);
  const toggle = () => setTheme((p) => {
    const n = p === "dark" ? "light" : "dark";
    localStorage.setItem("rb-theme", n);
    document.documentElement.classList.toggle("dark", n === "dark");
    document.documentElement.classList.toggle("light", n === "light");
    return n;
  });
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
