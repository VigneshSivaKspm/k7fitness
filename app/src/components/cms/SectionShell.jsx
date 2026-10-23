import { ExternalLink } from 'lucide-react';
import { FormActions, PageHeader } from '../ui/Layout';
import Button from '../ui/Button';
import { ErrorState, PageLoader } from '../ui/Feedback';

const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || '';

/** Common frame for singleton website section editors. */
export default function SectionShell({ title, description, anchor, section, children }) {
  if (section.loading) return <PageLoader />;
  if (section.error) return <ErrorState message={section.error} />;
  return (
    <form onSubmit={section.save} noValidate className="mx-auto max-w-4xl">
      <PageHeader
        back={{ to: '/website', label: 'Website' }}
        title={title}
        description={description}
        actions={
          WEBSITE_URL && (
            <Button variant="secondary" size="sm" icon={ExternalLink} href={`${WEBSITE_URL}${anchor ? `#${anchor}` : ''}`}>
              View on website
            </Button>
          )
        }
      />
      <div className="space-y-5">{children}</div>
      <FormActions>
        <Button type="submit" loading={section.busy}>
          Save changes
        </Button>
      </FormActions>
    </form>
  );
}
