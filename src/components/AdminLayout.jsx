import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}