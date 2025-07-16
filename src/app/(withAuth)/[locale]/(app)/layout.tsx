"use client";

import Footer from "@/components/navbar/Footer";
import Navbar from "@/components/navbar/Navbar";
import { CssBaseline } from "@mui/material";
import { usePathname } from "@/server/i18n/routing";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CssBaseline />
      {pathname.endsWith("/editor") ? null : <Navbar />}
      {children}
      {pathname.endsWith("/editor") ? null : <Footer />}
    </div>
  );
}
