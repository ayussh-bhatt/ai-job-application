import "./globals.css";
import { ResumeProvider } from "@/context/ResumeContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>

        <ResumeProvider>
          <Navbar />
          {children}
        </ResumeProvider>

      </body>
    </html>
  );
}