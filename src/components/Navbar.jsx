import {
  BarChart3,
  CalendarClock,
  Megaphone,
  Map,
  MapPin,
  Ticket,
  Users,
  WalletCards,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    to: "/users",
    label: "Users",
    icon: Users,
  },
  {
    to: "/lines",
    label: "Lines",
    icon: Map,
  },
  {
    to: "/stations",
    label: "Stations",
    icon: MapPin,
  },
  {
    to: "/timetable",
    label: "Timetable",
    icon: CalendarClock,
  },
  {
    to: "/announcements",
    label: "Announcements",
    icon: Megaphone,
  },
  {
    to: "/prices",
    label: "Prices",
    icon: WalletCards,
  },
];

export default function Navbar() {
  const { user, logout } = useAuthContext();

  return (
    <header className="sticky top-0 z-40 border-b-4 border-[#00c853] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9ef] text-[#00a843]">
            <Ticket size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900">
              TransportApp Admin
            </h1>

            <p className="text-sm text-slate-500">
              {user?.email || user?.sub || "Admin panel"}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#00c853] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-[#e8f9ef] hover:text-[#008f3a]"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}