import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "recce",
  description: "Recce: a dbt tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
