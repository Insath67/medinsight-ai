import { CalendarClock } from "lucide-react";

type ReminderItem = {
  id: number | string;
  title?: string;
  due?: string;
  due_date?: string;
  due_at?: string;
  status?: string;
};

type RemindersWidgetProps = {
  reminders: ReminderItem[];
  loading?: boolean;
};

export default function RemindersWidget({
  reminders = [],
  loading = false,
}: RemindersWidgetProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Reminders</h2>
          <p className="text-sm text-slate-500">
            Your upcoming medical actions
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            Loading reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            No reminders found.
          </div>
        ) : (
          reminders.map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-100 p-2">
                  <CalendarClock className="h-4 w-4 text-violet-700" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {item.title || "Reminder"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Due: {item.due_at || item.due_date || item.due || "-"}
                  </p>
                </div>

                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  {item.status || "Pending"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}