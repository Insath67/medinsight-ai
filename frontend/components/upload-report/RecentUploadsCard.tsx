import { FileText } from "lucide-react";

export default function RecentUploadsCard() {
  const uploads = [
    {
      name: "blood_test_april.pdf",
      type: "Blood Test",
      date: "Apr 06, 2026",
    },
    {
      name: "lipid_profile_march.pdf",
      type: "Lipid Profile",
      date: "Mar 28, 2026",
    },
    {
      name: "cbc_report_february.pdf",
      type: "CBC Report",
      date: "Feb 19, 2026",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent Uploads</h2>
      <p className="mt-1 text-sm text-slate-500">
        Your latest uploaded reports
      </p>

      <div className="mt-5 space-y-3">
        {uploads.map((item) => (
          <div
            key={item.name}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
          >
            <div className="rounded-2xl bg-blue-100 p-3">
              <FileText className="h-4 w-4 text-blue-700" />
            </div>

            <div>
              <p className="font-medium text-slate-900">{item.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {item.type} • {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}