import React from "react";

export default function BasePage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ minHeight: "calc(100vh - 88px - 52px)" }}>{children}</div>
  );
}
