import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';
import { AppError } from '../utils/errors';

const mapDoc = (d) => ({ id: d.id, ...d.data() });

/**
 * Reusable templates (workout / diet) plus per-trainee assignments.
 *
 * An assignment stores a SNAPSHOT of the template's content. Customising a
 * trainee's plan edits only that snapshot — the master template is never
 * touched, and later template edits never silently change a member's plan.
 */
function createPlanService({ templates, assignments, idField, nameField, label, contentKeys }) {
  const pickContent = (src) => Object.fromEntries(contentKeys.map((k) => [k, src[k] ?? null]));

  return {
    async listTemplates(max = 200) {
      const snap = await getDocs(query(collection(db, templates), orderBy('updatedAt', 'desc'), limit(max)));
      return snap.docs.map(mapDoc);
    },

    async getTemplate(id) {
      const snap = await getDoc(doc(db, templates, id));
      return snap.exists() ? mapDoc(snap) : null;
    },

    async createTemplate(data) {
      const actor = getActor();
      const ref = await addDoc(collection(db, templates), {
        ...data,
        nameLower: data.name.toLowerCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: actor.uid,
        updatedBy: actor.uid,
      });
      logActivity(`Created ${label} template`, templates, ref.id, data.name);
      return ref.id;
    },

    async updateTemplate(id, data) {
      await updateDoc(doc(db, templates, id), {
        ...data,
        nameLower: data.name.toLowerCase(),
        updatedAt: serverTimestamp(),
        updatedBy: getActor().uid,
      });
      logActivity(`Updated ${label} template`, templates, id, data.name);
    },

    async duplicateTemplate(template) {
      const { id: _id, createdAt: _c, updatedAt: _u, createdBy: _cb, updatedBy: _ub, ...rest } = template;
      return this.createTemplate({ ...rest, name: `${template.name} (copy)` });
    },

    async deleteTemplate(template) {
      await deleteDoc(doc(db, templates, template.id));
      logActivity(`Deleted ${label} template`, templates, template.id, template.name);
    },

    /**
     * Assigns a plan to a trainee. Any previous active assignment is closed
     * (kept as history) and the trainee record points to the new one.
     */
    async assign(trainee, { template, content, customized, notes }) {
      const actor = getActor();
      const batch = writeBatch(db);
      const ref = doc(collection(db, assignments));
      if (trainee[idField]) {
        batch.update(doc(db, assignments, trainee[idField]), { active: false, endedAt: serverTimestamp() });
      }
      batch.set(ref, {
        traineeId: trainee.id,
        memberId: trainee.memberId,
        traineeName: trainee.fullName,
        templateId: template?.id || null,
        templateName: template?.name || '',
        customized: Boolean(customized),
        ...pickContent(content),
        notes: notes || '',
        active: true,
        assignedAt: serverTimestamp(),
        assignedBy: actor.uid,
        assignedByName: actor.name,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'trainees', trainee.id), {
        [idField]: ref.id,
        [nameField]: content.name,
        updatedAt: serverTimestamp(),
        updatedBy: actor.uid,
      });
      await batch.commit();
      logActivity(`Assigned ${label} plan`, 'trainee', trainee.id, content.name);
      return ref.id;
    },

    async getAssignment(id) {
      const snap = await getDoc(doc(db, assignments, id));
      return snap.exists() ? mapDoc(snap) : null;
    },

    /** Saves a customised version for one trainee only. */
    async updateAssignment(assignment, content) {
      const batch = writeBatch(db);
      batch.update(doc(db, assignments, assignment.id), {
        ...pickContent(content),
        customized: true,
        updatedAt: serverTimestamp(),
      });
      if (assignment.active) {
        batch.update(doc(db, 'trainees', assignment.traineeId), { [nameField]: content.name, updatedAt: serverTimestamp() });
      }
      await batch.commit();
      logActivity(`Customised ${label} plan`, 'trainee', assignment.traineeId, content.name);
    },

    async unassign(trainee) {
      if (!trainee[idField]) throw new AppError(`No ${label} plan is assigned.`);
      const batch = writeBatch(db);
      batch.update(doc(db, assignments, trainee[idField]), { active: false, endedAt: serverTimestamp() });
      batch.update(doc(db, 'trainees', trainee.id), { [idField]: null, [nameField]: '', updatedAt: serverTimestamp() });
      await batch.commit();
      logActivity(`Removed ${label} plan`, 'trainee', trainee.id, trainee[nameField]);
    },

    async listAssignments(traineeId, max = 20) {
      const snap = await getDocs(
        query(collection(db, assignments), where('traineeId', '==', traineeId), orderBy('assignedAt', 'desc'), limit(max)),
      );
      return snap.docs.map(mapDoc);
    },
  };
}

export const workoutService = createPlanService({
  templates: 'workoutTemplates',
  assignments: 'workoutAssignments',
  idField: 'workoutAssignmentId',
  nameField: 'workoutPlanName',
  label: 'workout',
  contentKeys: ['name', 'goal', 'level', 'description', 'days'],
});

export const dietService = createPlanService({
  templates: 'dietTemplates',
  assignments: 'dietAssignments',
  idField: 'dietAssignmentId',
  nameField: 'dietPlanName',
  label: 'diet',
  contentKeys: ['name', 'goal', 'description', 'calories', 'protein', 'carbs', 'fat', 'meals'],
});
