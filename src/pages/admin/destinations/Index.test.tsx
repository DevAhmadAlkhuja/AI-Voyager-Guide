import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDestinationsIndex from "./Index";

const mockFetch = vi.fn();

describe("AdminDestinationsIndex", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // @ts-expect-error mock
    global.fetch = mockFetch;

    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify({ role: "admin" }));
  });

  it("loads and renders destinations list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        destinations: [
          {
            id: 1,
            slug: "kuala-lumpur",
            title: "Kuala Lumpur",
            subtitle: null,
            country: "Malaysia",
            city: "Kuala Lumpur",
            summary: "Summary",
            featured_image: null,
            images: null,
            tags: null,
            is_published: 1,
            priority: 10,
            views_count: 0,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    });

    render(
      <MemoryRouter>
        <AdminDestinationsIndex />
      </MemoryRouter>,
    );

    await expect(screen.findByText(/kuala lumpur/i)).resolves.toBeTruthy();
    expect(screen.getByText(/destinations management/i)).toBeTruthy();
  });

  it("bulk delete button is disabled when nothing selected", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ destinations: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } }),
    });

    render(
      <MemoryRouter>
        <AdminDestinationsIndex />
      </MemoryRouter>,
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const btn = screen.getByRole("button", { name: /bulk delete/i });
    expect(btn).toBeDisabled();
  });

  it("search triggers refetch", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ destinations: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ destinations: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } }) });

    render(
      <MemoryRouter>
        <AdminDestinationsIndex />
      </MemoryRouter>,
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "penang" } });
    fireEvent.click(screen.getByRole("button", { name: /^search$/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });
});
