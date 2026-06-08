import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-3xl bg-white p-8 text-center shadow">
        <h1 className="text-3xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-slate-500">Pagina nu există.</p>
        <Link className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white" to="/dashboard">
          Înapoi la Dashboard
        </Link>
      </div>
    </div>
  );
}
