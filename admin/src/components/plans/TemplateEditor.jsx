import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Copy, Printer, Trash2 } from 'lucide-react';
import { FormActions, PageHeader } from '../ui/Layout';
import Button from '../ui/Button';
import { ErrorState, PageLoader } from '../ui/Feedback';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useAsync';
import { friendlyError } from '../../utils/errors';
import { focusFirstError } from '../../utils/validation';

/**
 * Create/edit screen shared by workout and diet templates.
 * config: { service, kind, label, basePath, Form, empty(), validate(), clean(), fromDoc() }
 */
export default function TemplateEditor({ config }) {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [value, setValue] = useState(config.empty);
  const [state, setState] = useState({ loading: editing, error: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  useDocumentTitle(editing ? `Edit ${config.label}` : `New ${config.label}`);

  useEffect(() => {
    if (!editing) return;
    config.service
      .getTemplate(id)
      .then((t) => {
        if (!t) setState({ loading: false, error: 'This template could not be found.' });
        else {
          setValue(config.fromDoc(t));
          setState({ loading: false, error: '' });
        }
      })
      .catch((err) => setState({ loading: false, error: friendlyError(err) }));
  }, [editing, id, config]);

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = config.validate(value);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.');
      return focusFirstError(errs);
    }
    setBusy(true);
    try {
      const data = config.clean(value);
      if (editing) {
        await config.service.updateTemplate(id, data);
        toast.success(`${config.Label} template saved.`);
      } else {
        const newId = await config.service.createTemplate(data);
        toast.success(`${config.Label} template created.`);
        navigate(`${config.basePath}/${newId}`, { replace: true });
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const duplicate = async () => {
    try {
      const newId = await config.service.createTemplate({ ...config.clean(value), name: `${value.name} (copy)` });
      toast.success('Template duplicated.');
      navigate(`${config.basePath}/${newId}`);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const remove = () =>
    confirm({
      title: 'Delete template?',
      message: `“${value.name}” will be deleted. Members who already have it assigned keep their copy.`,
      confirmText: 'Delete template',
      onConfirm: async () => {
        await config.service.deleteTemplate({ id, name: value.name });
        toast.success('Template deleted.');
        navigate(config.basePath, { replace: true });
      },
    });

  if (state.loading) return <PageLoader />;
  if (state.error) return <ErrorState message={state.error} />;

  const Form = config.Form;

  return (
    <form onSubmit={save} noValidate className="mx-auto max-w-4xl">
      <PageHeader
        back={{ to: config.basePath, label: `${config.Label} plans` }}
        title={editing ? value.name || `Edit ${config.label} template` : `New ${config.label} template`}
        description="Templates are reusable. Editing a template does not change plans already assigned to members."
        actions={
          editing && (
            <>
              <Button variant="secondary" size="sm" icon={Printer} to={`/print/${config.kind}/template/${id}`}>
                Print
              </Button>
              <Button variant="secondary" size="sm" icon={Copy} onClick={duplicate}>
                Duplicate
              </Button>
              <Button variant="danger-ghost" size="sm" icon={Trash2} onClick={remove}>
                Delete
              </Button>
            </>
          )
        }
      />
      <Form value={value} onChange={setValue} errors={errors} />
      <FormActions>
        <Button variant="secondary" onClick={() => navigate(config.basePath)} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {editing ? 'Save template' : 'Create template'}
        </Button>
      </FormActions>
    </form>
  );
}
