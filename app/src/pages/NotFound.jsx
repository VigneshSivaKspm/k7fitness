import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { useDocumentTitle } from '../hooks/useAsync';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="card">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for does not exist or may have been moved."
        action={<Button to="/dashboard">Go to dashboard</Button>}
      />
    </div>
  );
}
