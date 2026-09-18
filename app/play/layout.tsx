import type { Metadata } from "next";
import PlayClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "KamKhoj Play — Games, Puzzles & Challenges",
  description:
    "KamKhoj Play: 20 free browser games — typing test, reaction test, Sudoku, 2048, Snake, memory games and a Nepal quiz. No account needed; progress stays on your device.",
  openGraph: {
    title: "KamKhoj Play — Games, Puzzles & Challenges",
    description: "20 free browser games. No account needed; progress stays on your device.",
  },
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <PlayClientLayout>{children}</PlayClientLayout>;
}
