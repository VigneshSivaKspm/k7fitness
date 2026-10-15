import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Salad, Search, UserCheck, Users, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SearchInput from '../ui/SearchInput';
import { Spinner } from '../ui/Feedback';
import { fetchAllTrainees } from '../../services/traineeService';
import { workoutService, dietService } from '../../services/planTemplateService';
import { useToast } from '../../context/ToastContext';
import { friendlyError } from '../../utils/errors';

export default function AssignToMemberDialog({ template, kind = 'workout', open, onClose, onDone }) {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedMember(null);
      setSearch('');
      return;
    }
    setLoading(true);
    fetchAllTrainees()
      .then((data) => {
        setMembers(data);
      })
      .catch((err) => {
        toast.error('Failed to load members list.');
      })
      .finally(() => setLoading(false));
  }, [open, toast]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.fullName?.toLowerCase().includes(q) ||
        m.memberId?.toLowerCase().includes(q) ||
        m.phone?.includes(q)
    );
  }, [members, search]);

  const handleAssign = async () => {
    if (!selectedMember || !template) return;
    setAssigning(true);
    try {
      const service = kind === 'workout' ? workoutService : dietService;
      await service.assign(selectedMember, {
        template,
        content: template,
        customized: false,
        notes: `Assigned template: ${template.name}`,
      });

      toast.success(
        `Successfully assigned "${template.name}" to ${selectedMember.fullName}!`
      );
      if (onDone) onDone();
      onClose();
    } catch (err) {
      toast.error(friendlyError(err, 'Could not assign template to member.'));
    } finally {
      setAssigning(false);
    }
  };

  const Icon = kind === 'workout' ? Dumbbell : Salad;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign ${kind === 'workout' ? 'Workout' : 'Food Chart'} to Member`}
      description={`Select a member to assign template: "${template?.name}"`}
      size="md"
    >
      <div className="space-y-4">
        {/* Template info preview chip */}
        {template && (
          <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 p-3 text-xs">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-zinc-900 truncate">{template.name}</p>
              <p className="text-zinc-500">
                {template.goal || 'General'} · {kind === 'workout' ? `${template.days?.length || 0} days` : `${template.meals?.length || 0} meals (${template.calories || 0} kcal)`}
              </p>
            </div>
          </div>
        )}

        {/* Member search */}
        <div>
          <label className="label">Search Gym Member</label>
          <SearchInput
            value={search}
            onSearch={setSearch}
            delay={0}
            placeholder="Search member name, ID (e.g. K7-001) or phone"
          />
        </div>

        {/* Member selection list */}
        <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 rounded-xl border border-zinc-200">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner label="Loading members..." />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              No active members found.
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isSelected = selectedMember?.id === m.id;
              const currentPlan = kind === 'workout' ? m.workoutPlanName : m.dietPlanName;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className={`w-full text-left p-3 flex items-center justify-between gap-3 transition ${
                    isSelected ? 'bg-brand/10 border-l-4 border-brand' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-zinc-900 truncate">
                      {m.fullName}
                      <span className="ml-1.5 font-mono text-[0.7rem] text-zinc-400">
                        ({m.memberId})
                      </span>
                    </p>
                    <p className="text-[0.7rem] text-zinc-500 truncate mt-0.5">
                      {m.phone} · Current: {currentPlan || 'None'}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
          <Button variant="secondary" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            loading={assigning}
            disabled={!selectedMember || assigning}
          >
            {assigning ? 'Assigning…' : selectedMember ? `Assign to ${selectedMember.fullName}` : 'Select a Member'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
