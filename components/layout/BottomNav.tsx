"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/dashboard", label: "Dash",     icon: "dashboard" },
  { href: "/generate",  label: "Generate", icon: "auto_awesome" },
  { href: "/history",   label: "History",  icon: "history" },
  { href: "/profile",   label: "Profile",  icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 md:hidden bg-[#131313]/90 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl">
      {navLinks.map(({ href, label, icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${
              active
                ? "bg-[#6366F1] text-white rounded-xl px-3 py-1"
                : "text-gray-500"
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-['Inter'] text-[8px] uppercase tracking-widest mt-0.5">
              {label}
            </span>
          </Link>
        );
      })}

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="flex flex-col items-center justify-center text-gray-500 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        <span className="font-['Inter'] text-[8px] uppercase tracking-widest mt-0.5">
          Exit
        </span>
      </button>
    </nav>
  );
}
