import { History } from 'lucide-react';
import { Card } from '../../ui/Layout';
import { EmptyState, ErrorState, SkeletonRows } from '../../ui/Feedback';
import { useAsync } from '../../../hooks/useAsync';
import { listRecordActivity } from '../../../services/activityService';
import { formatDateTime } from '../../../utils/dates';

export default function HistoryTab({ trainee }) {
  const { data, loading, error, reload } = useAsync(() => listRecordActivity(trainee.id, 50), [trainee.id, trainee.updatedAt?.toMillis?.()]);

  return (
    <Card title="Activity history" description="Changes made to this member by staff." bodyClassName="">
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <SkeletonRows rows={4} />
      ) : !data?.length ? (
        <EmptyState icon={History} title="No activity yet" />
      ) : (
        <ol className="relative px-5 py-4">
          {data.map((log, i) => (
            <li key={log.id} className="relative flex gap-4 pb-5 last:pb-0">
              {i < data.length - 1 && <span className="absolute top-3 left-[5px] h-full w-px bg-zinc-200" aria-hidden="true" />}
              <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-brand bg-white" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">{log.action}</p>
                {log.details && <p className="text-sm break-words text-zinc-600">{log.details}</p>}
                <p className="mt-0.5 text-xs text-zinc-400">
                  {formatDateTime(log.createdAt)} · {log.adminName}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
