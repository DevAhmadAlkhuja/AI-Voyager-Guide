import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AUTH_CHANGED_EVENT } from "@/components/UserAvatarMenu";

function renderNavbar() {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </LanguageProvider>
    </ThemeProvider>,
  );
}

describe("Navbar auth avatar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows Login button when unauthenticated", () => {
    renderNavbar();
    expect(screen.getAllByText(/log in/i).length).toBeGreaterThan(0);
  });

  it("replaces Login button with avatar trigger when authenticated", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "John", email: "a@b.com" }));

    renderNavbar();

    const trigger = screen.getByRole("button", { name: /account menu/i });
    expect(trigger).toBeInTheDocument();
  });

  it("logout returns UI to pre-login state", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "John", email: "a@b.com" }));

    renderNavbar();

    fireEvent.click(screen.getByRole("button", { name: /account menu/i }));
    fireEvent.click(screen.getByText(/logout/i));

    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getAllByText(/log in/i).length).toBeGreaterThan(0);
  });
});
