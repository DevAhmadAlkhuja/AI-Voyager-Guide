import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserAvatarMenu from "@/components/UserAvatarMenu";

describe("UserAvatarMenu dropdown accessibility", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "t");
    localStorage.setItem("user", JSON.stringify({ id: 1, firstName: "Jane", lastName: "Doe" }));
  });

  it("opens and closes menu via mouse click", () => {
    render(
      <MemoryRouter>
        <UserAvatarMenu />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /account menu/i }));
    expect(screen.getByText(/edit profile/i)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("opens menu via keyboard (Enter)", () => {
    render(
      <MemoryRouter>
        <UserAvatarMenu />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole("button", { name: /account menu/i });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(screen.getByText(/edit profile/i)).toBeInTheDocument();
  });
});
