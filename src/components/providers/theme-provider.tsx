import { useLayoutEffect, type PropsWithChildren } from "react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeProvider({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#0b0f0e" : "#f4f6f5",
      );
  }, [resolvedTheme]);
  return children;
}
