import Button from "./Button.jsx";

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b-4 border-[#00c853] bg-white px-6 py-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-base text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}