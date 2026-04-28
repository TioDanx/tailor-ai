// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";

global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: mocks.useAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/auth/AuthModal", () => ({
  AuthModal: () => null,
}));

import LandingPage from "@/app/page";

const mockUser = { uid: "user-123", email: "test@example.com" };

function makeAuth(user: typeof mockUser | null, loading = false) {
  return {
    user,
    loading,
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    signOut: vi.fn(),
  };
}

describe("Landing page redirect to /dashboard", () => {
  beforeEach(() => {
    vi.stubGlobal("location", { replace: vi.fn() });
    mocks.useAuth.mockReturnValue(makeAuth(null));
  });

  it("redirects immediately when a logged-in user visits /", async () => {
    mocks.useAuth.mockReturnValue(makeAuth(mockUser));

    await act(async () => { render(<LandingPage />); });

    expect(window.location.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects after successful login (auth state changes to logged-in)", async () => {
    const { rerender } = await act(async () => render(<LandingPage />));

    expect(window.location.replace).not.toHaveBeenCalled();

    mocks.useAuth.mockReturnValue(makeAuth(mockUser));

    await act(async () => { rerender(<LandingPage />); });

    expect(window.location.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("does not redirect while auth state is still loading", async () => {
    mocks.useAuth.mockReturnValue(makeAuth(mockUser, true));

    await act(async () => { render(<LandingPage />); });

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it("does not redirect when user is not logged in", async () => {
    await act(async () => { render(<LandingPage />); });

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
