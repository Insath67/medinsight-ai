import { Bell } from "lucide-react";

type NotificationItem = {
  id: number | string;
  message?: string;
  title?: string;
  time?: string;
  created_at?: string;
};

type NotificationsWidgetProps = {
  notifications: NotificationItem[];
  loading?: boolean;
};

export default function NotificationsWidget({
  notifications = [],
  loading = false,
}: NotificationsWidgetProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Notifications
          </h2>
          <p className="text-sm text-slate-500">
            Recent updates from your health activity
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            No notifications found.
          </div>
        ) : (
          notifications.map((note, index) => (
            <div
              key={note.id || index}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
            >
              <div className="rounded-xl bg-blue-100 p-2">
                <Bell className="h-4 w-4 text-blue-700" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">
                  {note.title || note.message || "Notification"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {note.created_at || note.time || "-"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}