"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(typeof window !== "undefined" && !!localStorage.getItem("token"));
  }, [pathname]);

  const linkActive = "text-[var(--primary)]";
  const linkInactive = "text-[var(--muted-foreground)] hover:text-white transition-colors";

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link
            href="/"
            className="text-lg font-semibold text-white hover:text-[var(--primary)] transition-colors"
          >
            AI Job Assistant
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium ${pathname === "/dashboard" ? linkActive : linkInactive}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/jobs"
                  className={`text-sm font-medium ${pathname.startsWith("/jobs") ? linkActive : linkInactive}`}
                >
                  Jobs
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${pathname === "/profile" ? linkActive : linkInactive}`}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.replace("/login");
                  }}
                  className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors cursor-pointer bg-transparent border-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--muted-foreground)] hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-[var(--muted-foreground)] hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
