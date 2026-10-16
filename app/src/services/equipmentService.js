import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uid } from '../utils/format';
import { GYM_EQUIPMENT_CATALOG } from '../constants/gymEquipmentCatalog';
import { GYM_EXERCISES_CATALOG } from '../constants/gymExercisesCatalog';

const EQUIPMENT_COL = 'equipment';
const INSTRUCTIONS_DOC = 'gym_instructions/general';

// ── Default Curated Gym Equipment & Exercise Demos ────────────────────────
export const DEFAULT_EQUIPMENT = GYM_EQUIPMENT_CATALOG;

// ── Default Curated Gym Guidelines & Instructions ────────────────────────
export const DEFAULT_INSTRUCTIONS = [
  {
    id: 'etiquette',
    title: 'Gym Etiquette & Code of Conduct',
    icon: 'Users',
    badge: 'Essential',
    items: [
      {
        title: 'Always Re-Rack Your Weights & Dumbbells',
        desc: 'Return all weight plates, dumbbells, barbells, and cable attachments to their designated racks immediately after finishing your sets.',
      },
      {
        title: 'Carry a Gym Towel & Wipe Down Machines',
        desc: 'Keep a workout towel handy at all times. Use disinfectant spray and paper rolls provided across the gym floor to wipe machine pads after use.',
      },
      {
        title: 'Share Equipment & Allow Working-In',
        desc: 'During peak rush hours (6:30 PM - 8:00 PM), do not monopolize machines while resting between sets. Allow fellow gym members to work in.',
      },
      {
        title: 'Clean Gym Shoes Policy',
        desc: 'Members must change into clean indoor training shoes upon entering the gym floor to preserve equipment mats and hygiene.',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Machine & Equipment Safety Guidelines',
    icon: 'ShieldCheck',
    badge: 'Safety First',
    items: [
      {
        title: 'Inspect Weight Stack Selector Pins',
        desc: 'Make sure weight stack selector pins are pushed 100% all the way through the weight plate hole. Never use a cracked or loose pin.',
      },
      {
        title: 'Use Barbell Collars / Spring Clips',
        desc: 'Always fasten spring collars on both ends of an Olympic barbell when adding plates, preventing weights from sliding off during heavy lifts.',
      },
      {
        title: 'Set Squat Rack Safety Catch Bars',
        desc: 'Before squatting or benching heavy, adjust horizontal safety spotter bars to 2-3 inches below your bottom depth so you can safely dump the bar if needed.',
      },
      {
        title: 'Treadmill Emergency Stop Clip',
        desc: 'When using high-speed treadmill sprints, clip the red emergency safety cord to your waistband to automatically halt the belt if you stumble.',
      },
    ],
  },
  {
    id: 'timings',
    title: 'Gym Timings, Rush Hours & Slot Discipline',
    icon: 'Clock',
    badge: 'Timings',
    items: [
      {
        title: 'Operating Hours',
        desc: 'Morning Batch: 5:30 AM – 10:30 AM | Evening Batch: 4:30 PM – 9:30 PM | Sundays: 6:00 AM – 12:00 PM.',
      },
      {
        title: 'Stick to Your Registered Workout Slot',
        desc: 'Arriving during your selected preferred in/out slot allows the K7 smart crowd system to balance equipment queue times and avoid congestion.',
      },
      {
        title: 'Cardio Machine Limits During Peak Hours',
        desc: 'Please cap continuous treadmill and elliptical cardio sessions to 20 minutes when other gym members are waiting during peak rush.',
      },
    ],
  },
];

// ── Firestore Services ───────────────────────────────────────────────────

export async function listEquipment() {
  if (!db) return DEFAULT_EQUIPMENT;
  try {
    const snap = await getDocs(query(collection(db, EQUIPMENT_COL), orderBy('name')));
    if (snap.empty) {
      // Auto-seed default equipment if database collection is empty
      await seedDefaultEquipment();
      return DEFAULT_EQUIPMENT;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Could not read equipment from firestore, using defaults', err);
    return DEFAULT_EQUIPMENT;
  }
}

export async function getEquipment(id) {
  if (!db) return DEFAULT_EQUIPMENT.find((e) => e.id === id) || null;
  const docRef = doc(db, EQUIPMENT_COL, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveEquipment(item) {
  if (!db) return item.id || uid();
  const id = item.id || uid();
  const docRef = doc(db, EQUIPMENT_COL, id);
  const cleanData = {
    name: (item.name || '').trim(),
    category: item.category || 'Chest',
    targetMuscles: Array.isArray(item.targetMuscles) ? item.targetMuscles : (item.targetMuscles || '').split(',').map((s) => s.trim()).filter(Boolean),
    brand: (item.brand || '').trim(),
    quantity: Number(item.quantity) || 1,
    status: item.status || 'active',
    description: (item.description || '').trim(),
    setupGuide: (item.setupGuide || '').trim(),
    safetyNotes: (item.safetyNotes || '').trim(),
    imageUrl: item.imageUrl || '',
    videoUrl: item.videoUrl || '',
    videoPath: item.videoPath || '',
    demoType: item.demoType || 'animation',
    exercises: (item.exercises || []).map((ex) => ({
      id: ex.id || uid(),
      name: (ex.name || '').trim(),
      targetMuscle: (ex.targetMuscle || '').trim(),
      difficulty: ex.difficulty || 'Beginner',
      setup: (ex.setup || '').trim(),
      execution: (ex.execution || '').trim(),
      mistakes: (ex.mistakes || '').trim(),
      cues: (ex.cues || '').trim(),
      videoUrl: ex.videoUrl || '',
      videoPath: ex.videoPath || '',
    })),
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, cleanData, { merge: true });
  return id;
}

export async function deleteEquipment(id) {
  if (!db) return;
  await deleteDoc(doc(db, EQUIPMENT_COL, id));
}

export async function seedDefaultEquipment() {
  if (!db) return DEFAULT_EQUIPMENT;
  for (const item of DEFAULT_EQUIPMENT) {
    const id = item.id || uid();
    await setDoc(
      doc(db, EQUIPMENT_COL, id),
      {
        ...item,
        id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function syncAllGymMachines() {
  return seedDefaultEquipment();
}

// ── Exercises Collection Services ────────────────────────────────────────

const EXERCISES_COL = 'exercises';

export async function listExercises() {
  if (!db) return GYM_EXERCISES_CATALOG;
  try {
    const snap = await getDocs(query(collection(db, EXERCISES_COL), orderBy('name')));
    if (snap.empty) {
      return GYM_EXERCISES_CATALOG;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Could not read exercises from firestore', err);
    return GYM_EXERCISES_CATALOG;
  }
}

export async function getExercise(id) {
  if (!db) return null;
  const docRef = doc(db, EXERCISES_COL, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveExercise(item) {
  if (!db) return item.id || uid();
  const id = item.id || uid();
  const docRef = doc(db, EXERCISES_COL, id);
  const cleanData = {
    name: (item.name || '').trim(),
    targetMuscle: (item.targetMuscle || '').trim(),
    muscleGroup: item.muscleGroup || 'Chest',
    difficulty: item.difficulty || 'Beginner',
    equipmentId: item.equipmentId || '',
    equipmentName: (item.equipmentName || '').trim(),
    setup: (item.setup || '').trim(),
    execution: (item.execution || '').trim(),
    mistakes: (item.mistakes || '').trim(),
    cues: (item.cues || '').trim(),
    videoUrl: item.videoUrl || '',
    videoPath: item.videoPath || '',
    tempo: item.tempo || '1s Contraction · 1s Squeeze · 3s Eccentric',
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, cleanData, { merge: true });

  // If linked to an equipment, synchronize with that equipment's exercises array
  if (cleanData.equipmentId && cleanData.equipmentId !== 'none' && cleanData.equipmentId !== 'bodyweight') {
    try {
      const eq = await getEquipment(cleanData.equipmentId);
      if (eq) {
        const curExs = eq.exercises || [];
        const existingIdx = curExs.findIndex((x) => x.id === id || x.name.toLowerCase() === cleanData.name.toLowerCase());
        const exPayload = {
          id,
          name: cleanData.name,
          targetMuscle: cleanData.targetMuscle,
          difficulty: cleanData.difficulty,
          setup: cleanData.setup,
          execution: cleanData.execution,
          mistakes: cleanData.mistakes,
          cues: cleanData.cues,
          videoUrl: cleanData.videoUrl,
          videoPath: cleanData.videoPath,
        };
        let updatedExs;
        if (existingIdx >= 0) {
          updatedExs = [...curExs];
          updatedExs[existingIdx] = { ...curExs[existingIdx], ...exPayload };
        } else {
          updatedExs = [...curExs, exPayload];
        }
        await updateDoc(doc(db, EQUIPMENT_COL, cleanData.equipmentId), {
          exercises: updatedExs,
          updatedAt: serverTimestamp(),
        });
      }
    } catch {
      /* ignore sync error */
    }
  }

  return id;
}

export async function deleteExercise(id) {
  if (!db) return;
  await deleteDoc(doc(db, EXERCISES_COL, id));
}

export async function seedDefaultExercises() {
  if (!db) return GYM_EXERCISES_CATALOG;
  const exercisesToSeed = GYM_EXERCISES_CATALOG;
  for (const item of exercisesToSeed) {
    const docRef = doc(db, EXERCISES_COL, item.id);
    await setDoc(docRef, {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
  return exercisesToSeed;
}


// ── Gym Instructions Services ────────────────────────────────────────────

export async function getGymInstructions() {
  if (!db) return DEFAULT_INSTRUCTIONS;
  try {
    const snap = await getDoc(doc(db, INSTRUCTIONS_DOC));
    if (!snap.exists()) {
      await saveGymInstructions(DEFAULT_INSTRUCTIONS);
      return DEFAULT_INSTRUCTIONS;
    }
    return snap.data().categories || DEFAULT_INSTRUCTIONS;
  } catch (err) {
    console.warn('Could not read gym instructions from firestore, using defaults', err);
    return DEFAULT_INSTRUCTIONS;
  }
}

export async function saveGymInstructions(categories) {
  if (!db) return;
  await setDoc(
    doc(db, INSTRUCTIONS_DOC),
    {
      categories,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
