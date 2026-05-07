type CompareValue = {
  label: string;
  value: string;
  status: string;
};

type SideBySideComparisonCardProps = {
  title: string;
  values: CompareValue[];
};

export default function SideBySideComparisonCard({
  title,
  values,
}: SideBySideComparisonCardProps) {
  const getStatusStyles = (status: string) => {
    if (status === "High") return "bg-red-100 text-red-700";
    if (status === "Low") return "bg-amber-100 text-amber-700";
    if (status === "Borderline") return "bg-yellow-100 text-yellow-700";
    return "bg-teal-100 text-teal-700";
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Extracted lab values from the selected report
      </p>

      <div className="mt-5 space-y-4">
        {values.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">{item.value}</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
                item.status
              )}`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}