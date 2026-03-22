import type { Metadata } from "next";
import "devextreme/dist/css/dx.light.css";
import "./globals.css";
import { DevExtremeLicenseProvider } from "@/app/core/providers/DevExtremeLicenseProvider";

export const metadata: Metadata = {
  title: "TaskPro",
  description: "Gestión de tareas y proyectos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <DevExtremeLicenseProvider />
        {children}
      </body>
    </html>
  );
}
