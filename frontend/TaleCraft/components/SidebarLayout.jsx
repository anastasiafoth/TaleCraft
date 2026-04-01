import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavLinks from "./NavLinks";

export default function SidebarLayout({ links, username }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-base-100 border-r border-base-200 p-6 gap-8">
        <h1 className="text-xl font-bold">
          Welcome, <span className="text-primary capitalize">{username}</span>
        </h1>
        <NavLinks links={links} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-base-100 z-30 p-6 flex flex-col gap-8 shadow-xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Hi, <span className="text-primary capitalize">{username}</span>
          </h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="btn btn-ghost btn-sm"
          >
            ✕
          </button>
        </div>
        <NavLinks links={links} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-base-100 border-b border-base-200 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="btn btn-ghost btn-sm"
          >
            ☰
          </button>
          <span className="font-semibold text-primary capitalize">
            {username}
          </span>
        </header>

        <main className="p-6 bg-base-200 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
