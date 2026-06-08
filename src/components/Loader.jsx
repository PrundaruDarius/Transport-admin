export default function Loader({ text = "Se încarcă..." }) {
  return (
    <div className="flex items-center justify-center rounded-2xl bg-white p-10 shadow">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      <span className="ml-3 text-slate-600">{text}</span>
    </div>
  );
}
