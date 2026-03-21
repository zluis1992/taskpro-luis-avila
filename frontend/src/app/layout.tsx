import type { Metadata } from "next";
import "devextreme/dist/css/dx.light.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskPro",
  description: "Task and project management application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
