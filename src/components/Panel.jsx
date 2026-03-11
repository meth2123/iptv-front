export default function Panel({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-brand-700 bg-brand-800/55 backdrop-blur supports-[backdrop-filter]:bg-brand-800/45",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

