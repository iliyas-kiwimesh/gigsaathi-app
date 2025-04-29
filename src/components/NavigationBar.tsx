"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavigationBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Users" },
    { href: "/earnings", label: "Weekly" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center">
          <div className="mr-8">
            <h1 className="text-xl font-bold">GigSaathi</h1>
          </div>
          <div className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
