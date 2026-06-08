const variants = {
  primary:
    "bg-[#00c853] text-white hover:bg-[#00a843] border border-[#00c853]",
  secondary:
    "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-red-600",
  success:
    "bg-[#00c853] text-white hover:bg-[#00a843] border border-[#00c853]",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}