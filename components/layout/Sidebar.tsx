"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUserQuota } from "@/hooks/useUserQuota";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/generate",  label: "Generate",  icon: "auto_awesome" },
  { href: "/history",   label: "History",   icon: "history" },
  { href: "/profile",   label: "Profile",   icon: "person" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { credits, max, plan, pctUsed } = useUserQuota();
  const { profile } = useUserProfile();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <aside className="hidden md:flex flex-col h-screen sticky left-0 top-0 p-4 gap-4 bg-[#1C1B1B] w-64 border-r border-outline-variant/10 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-on-primary-container text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter text-white">tailor.ai</h1>
          <p className="text-[10px] text-outline font-label uppercase tracking-widest">
            Professional Identity
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navLinks.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                active
                  ? "bg-[#201F1F] text-[#C0C1FF]"
                  : "text-gray-500 hover:text-gray-200 hover:bg-[#2A2A2A]"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Quota + Upgrade */}
      <div className="mt-auto flex flex-col gap-3">
        {/* Quota bar */}
        <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-2">
            <span className="material-symbols-outlined text-tertiary text-sm">database</span>
            <span className="text-[10px] font-label text-outline">
              Quota: {credits}/{max}
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-tertiary h-full transition-all"
              style={{ width: `${pctUsed}%` }}
            />
          </div>
          {plan === "free" && (
            <Link
              href="/upgrade"
              className="w-full mt-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-container text-xs font-bold py-2 rounded-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">upgrade</span>
              Upgrade Credits
            </Link>
          )}
        </div>

        {/* User info */}
        {profile && (
          <div className="flex items-center gap-3 px-2">
            <div className="relative w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden shrink-0">
              {profile.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt={profile.name ?? "Avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-sm">
                  {profile.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white">{profile.name || "User"}</p>
              <p className="text-[10px] text-outline truncate capitalize">{profile.plan} Member</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="text-outline hover:text-error transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
