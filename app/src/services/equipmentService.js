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

const EQUIPMENT_COL = 'equipment';
const INSTRUCTIONS_DOC = 'gym_instructions/general';

// ── Default Curated Gym Equipment & Exercise Demos ────────────────────────
export const DEFAULT_EQUIPMENT = [
  {
    name: 'Dual Adjustable Cable Crossover',
    category: 'Chest',
    targetMuscles: ['Chest', 'Triceps', 'Shoulders', 'Back'],
    brand: 'Technogym / LifeFitness Pro',
    quantity: 2,
    status: 'active',
    description:
      'Multi-angle dual pulley cable machine with smooth bearing swivel pulleys and pin-select weight stacks for continuous muscle tension.',
    setupGuide:
      'Adjust the dual pulley carriages to the desired height using the yellow spring-loaded pull-pin. Select matching weight pins on both weight stacks. Attach desired handles (D-handles, rope, or straight bar).',
    safetyNotes:
      'Always ensure weight stack selector pins are pushed fully into the stack before starting. Keep elbows slightly bent to protect joint tendons during chest flyes.',
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
    demoType: 'animation',
    exercises: [
      {
        id: uid(),
        name: 'High-to-Low Cable Chest Fly',
        targetMuscle: 'Lower & Inner Pecs',
        difficulty: 'Beginner to Intermediate',
        setup: 'Position pulleys at highest notch. Attach D-handles. Stand in a staggered stance one step forward.',
        execution:
          '1. Grip handles with elbows slightly bent and palms facing forward.\n2. Engage core and bring handles down and together in a sweeping arc in front of your hips.\n3. Squeeze chest hard for 1 second at full contraction.\n4. Slowly resist the weight back over 3 seconds until you feel a gentle chest stretch.',
        mistakes: 'Leaning too far forward or using excessive swinging momentum instead of controlled pec tension.',
        cues: 'Squeeze the bottom of your chest like you are hugging a wide tree.',
      },
      {
        id: uid(),
        name: 'Tricep Rope Pushdown',
        targetMuscle: 'Triceps (Lateral & Medial Heads)',
        difficulty: 'Beginner',
        setup: 'Set single pulley to the top notch. Attach rope attachment. Stand upright with slight forward hip hinge.',
        execution:
          '1. Grip rope handles with neutral grip, elbows pinned to ribs.\n2. Extend elbows downward until arms are straight.\n3. Flare rope tips outwards at the bottom for maximum tricep contraction.\n4. Return smoothly to 90 degrees elbow bend.',
        mistakes: 'Flaring elbows outward or letting shoulders raise toward ears.',
        cues: 'Keep your elbows glued to your sides like hinges.',
      },
      {
        id: uid(),
        name: 'Cable Face Pull with External Rotation',
        targetMuscle: 'Rear Delts & Rotator Cuff',
        difficulty: 'Intermediate',
        setup: 'Set pulley to upper chest height. Attach rope. Stand with solid balanced stance.',
        execution:
          '1. Grasp rope with thumbs facing backwards.\n2. Pull rope directly toward face while rotating knuckles upward and backward.\n3. Squeeze shoulder blades together at end range.\n4. Return under control.',
        mistakes: 'Pulling with biceps instead of leading with elbows and rear delts.',
        cues: 'Spread the rope apart at eye level and show your biceps.',
      },
    ],
  },
  {
    name: 'Olympic Flat Bench Press Station',
    category: 'Chest',
    targetMuscles: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
    brand: 'Eleiko / Hammer Strength',
    quantity: 3,
    status: 'active',
    description:
      'Standard Olympic competition bench press station with dual catch uprights and high-density foam padding.',
    setupGuide:
      'Lie flat with eyes directly beneath the barbell. Plant feet flat on the gym floor. Adjust barbell height so arms have a slight bend when reaching up to unrack.',
    safetyNotes:
      'Always use Olympic barbell spring collars/clips on both plate ends. For heavy 1RM or max effort sets, ask a gym trainer or partner for a spot.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    demoType: 'video',
    exercises: [
      {
        id: uid(),
        name: 'Standard Barbell Flat Bench Press',
        targetMuscle: 'Middle Chest & Upper Body Power',
        difficulty: 'Intermediate',
        setup: '5-point contact: Head, upper back, glutes on bench; both feet flat on floor. Retract scapula.',
        execution:
          '1. Grip bar slightly wider than shoulder width with thumbs wrapped securely.\n2. Unrack and stabilize bar over sternum.\n3. Inhale, lower bar in controlled arch to touch mid-chest.\n4. Drive bar upwards while pressing feet into floor.',
        mistakes: 'Bouncing bar off sternum or lifting hips off the bench during drive.',
        cues: 'Bend the bar in your hands to pack your lats tightly.',
      },
      {
        id: uid(),
        name: 'Close-Grip Tricep Bench Press',
        targetMuscle: 'Triceps & Inner Chest',
        difficulty: 'Intermediate',
        setup: 'Same body positioning as standard bench press, with hand width shoulder-width apart.',
        execution:
          '1. Grip bar shoulder-width apart (hands ~12 inches apart).\n2. Lower bar to lower chest while keeping elbows tucked near torso.\n3. Press powerfully to lockout focusing on tricep squeeze.',
        mistakes: 'Placing hands too close (wrist strain) or flaring elbows.',
        cues: 'Keep elbows tucked at 30 degrees to ribs.',
      },
    ],
  },
  {
    name: 'Olympic Power Squat Rack & Platform',
    category: 'Legs',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    brand: 'Rogue / Hammer Strength Pro',
    quantity: 2,
    status: 'active',
    description:
      'Heavy-duty 4-post power cage with adjustable safety spotter pins and wooden deadlift landing platform.',
    setupGuide:
      'Set J-hooks at mid-chest level so you do not have to tiptoe to unrack. Set the horizontal safety spotter bars just 2 inches below your deepest squat depth.',
    safetyNotes:
      'Always test the safety spotter height with an empty bar first. Never squat outside safety catch bars without an experienced spotter.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    demoType: 'animation',
    exercises: [
      {
        id: uid(),
        name: 'Barbell Back Squat',
        targetMuscle: 'Quads, Glutes & Posterior Chain',
        difficulty: 'Advanced',
        setup: 'Place bar across upper traps (high bar) or across rear deltoids (low bar). Feet shoulder-width apart, toes flared 15 degrees.',
        execution:
          '1. Take a deep diaphragmatic breath into abdomen and brace core.\n2. Hinge hips back and bend knees simultaneously.\n3. Descend smoothly until hip crease is parallel or below knees.\n4. Drive straight up through mid-foot and exhale at top.',
        mistakes: 'Knees caving inwards (valgus collapse) or heels lifting off the floor.',
        cues: 'Screw your feet into the ground and push knees in direction of your toes.',
      },
      {
        id: uid(),
        name: 'Standing Barbell Overhead Press (OHP)',
        targetMuscle: 'Deltoids & Core Stability',
        difficulty: 'Intermediate to Advanced',
        setup: 'Set bar at collarbone height. Grip just outside shoulder width with forearms vertical.',
        execution:
          '1. Unrack bar onto front delts with proud chest.\n2. Squeeze glutes and thighs tight.\n3. Press bar vertically in a straight path, moving head slightly back to clear chin.\n4. Lockout overhead with head returning through the window.',
        mistakes: 'Over-arching lower back or bending knees to cheat momentum.',
        cues: 'Push your head through the window at the top of the press.',
      },
    ],
  },
  {
    name: 'Wide-Grip Lat Pulldown & Seated Row Station',
    category: 'Back',
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Biceps'],
    brand: 'LifeFitness Signature Series',
    quantity: 2,
    status: 'active',
    description:
      'Commercial dual-function cable pull station with adjustable thigh hold-down pads and high-tensile steel cable.',
    setupGuide:
      'Adjust thigh hold-down roller pads so your thighs fit snugly without lifting. Choose comfortable grip attachment (Wide lat bar, V-bar, or neutral handles).',
    safetyNotes:
      'Do not pull bar behind the neck (avoids cervical spine impingement). Always release the weight stack slowly.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    demoType: 'video',
    exercises: [
      {
        id: uid(),
        name: 'Front Wide-Grip Lat Pulldown',
        targetMuscle: 'Upper Lats & V-Taper Width',
        difficulty: 'Beginner',
        setup: 'Grip bar wide with overhand grip. Sit with thighs secured firmly under roller pads.',
        execution:
          '1. Lean torso back ~10 degrees with slight chest arch.\n2. Initiate pull by depressing shoulder blades downward.\n3. Pull bar down smoothly until it touches upper chest.\n4. Pause for 1 second, then control bar upward for 3 seconds.',
        mistakes: 'Rocking torso backward aggressively or pulling bar to stomach.',
        cues: 'Drive with your elbows straight down toward your back pockets.',
      },
      {
        id: uid(),
        name: 'Straight-Arm Cable Pulldown',
        targetMuscle: 'Isolated Lower Lats & Teres Major',
        difficulty: 'Intermediate',
        setup: 'Stand 2 feet in front of cable stack. Grip straight bar at shoulder width with straight arms.',
        execution:
          '1. Hinge hips back slightly with arms extended overhead.\n2. Keeping arms almost straight with soft elbow bend, sweep bar down to thighs in an arc.\n3. Squeeze lats hard at bottom.\n4. Return smoothly to head level.',
        mistakes: 'Bending elbows into a tricep pushdown.',
        cues: 'Keep elbows locked like stiff levers and push down with your back.',
      },
    ],
  },
  {
    name: '45-Degree Commercial Leg Press',
    category: 'Legs',
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Calves'],
    brand: 'Nautilus / Cybex Plate Loaded',
    quantity: 1,
    status: 'active',
    description:
      'Heavy-duty angled leg press with multi-position backrest and oversized non-slip diamond footplate.',
    setupGuide:
      'Adjust backrest angle to comfortable position. Place feet on platform. Disengage safety side lock handles by pressing footplate upward and swinging handles outward.',
    safetyNotes:
      'NEVER lock your knees completely at the top of the press (prevents hyper-extension injury). Re-engage safety stop handles before releasing foot pressure.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    demoType: 'animation',
    exercises: [
      {
        id: uid(),
        name: 'Standard Quad-Focused Leg Press',
        targetMuscle: 'Quadriceps (Vastus Lateralis & Medialis)',
        difficulty: 'Beginner to Intermediate',
        setup: 'Place feet in the center of the platform, shoulder-width apart, toes angled out slightly.',
        execution:
          '1. Disengage safety handles.\n2. Inhale and lower platform slowly until knees reach 90 degrees.\n3. Do not allow lower back to round or lift off pad.\n4. Press forcefully through mid-foot and heels back to starting point.',
        mistakes: 'Locking knees straight at lockout, or letting tailbone curl up off seat pad.',
        cues: 'Drive through your heels and leave a soft bend in knees at top.',
      },
      {
        id: uid(),
        name: 'High-and-Wide Glute & Hamstring Leg Press',
        targetMuscle: 'Gluteus Maximus & Hamstrings',
        difficulty: 'Intermediate',
        setup: 'Place feet at the very top edge of the footplate with wide stance (heels outside shoulder width).',
        execution:
          '1. Lower platform with controlled cadence.\n2. Feel deep stretch in glutes and hamstrings.\n3. Drive platform up through heels focusing on glute contraction.',
        mistakes: 'Allowing heels to lift off footplate.',
        cues: 'Push through your heels like pushing away from the earth.',
      },
    ],
  },
  {
    name: 'Linear Counter-Balanced Smith Machine',
    category: 'Functional',
    targetMuscles: ['Chest', 'Shoulders', 'Quads', 'Glutes'],
    brand: 'Hoist / LifeFitness',
    quantity: 1,
    status: 'active',
    description:
      'Guided barbell system with linear bearing track and multi-height safety twist lock hooks.',
    setupGuide:
      'Rotate bar with wrists to unhook from latch teeth. Set lower spring-loaded safety stops on both vertical shafts at the lowest point of your movement.',
    safetyNotes:
      'Always set mechanical safety stops on both poles. A simple forward or backward twist of wrists re-engages the safety hooks instantly.',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
    demoType: 'video',
    exercises: [
      {
        id: uid(),
        name: 'Smith Machine Incline Chest Press',
        targetMuscle: 'Upper Chest (Clavicular Head)',
        difficulty: 'Beginner to Intermediate',
        setup: 'Position adjustable bench at 30-degree incline directly under the Smith bar track.',
        execution:
          '1. Unhook bar with wrist twist.\n2. Lower bar smoothly to touch upper chest near collarbones.\n3. Press upward with continuous tension on upper pecs.',
        mistakes: 'Bench angled too steep (>45 degrees shifts work to front deltoids).',
        cues: 'Keep chest high and drive up smoothly along the guided rail.',
      },
      {
        id: uid(),
        name: 'Smith Machine Standing Calf Raises',
        targetMuscle: 'Gastrocnemius & Soleus (Calves)',
        difficulty: 'Beginner',
        setup: 'Place calf block or plate beneath bar. Rest bar comfortably across upper traps.',
        execution:
          '1. Stand on edge of block with balls of feet.\n2. Lower heels down slowly for a deep 2-second calf stretch.\n3. Elevate up onto tiptoes as high as possible and squeeze calves for 1s.',
        mistakes: 'Bouncing quickly without pause at top or bottom stretch.',
        cues: 'Pause 2 seconds at the bottom stretch on every single rep.',
      },
    ],
  },
];

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
  if (!db) return;
  for (const item of DEFAULT_EQUIPMENT) {
    const id = uid();
    await setDoc(doc(db, EQUIPMENT_COL, id), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// ── Exercises Collection Services ────────────────────────────────────────

const EXERCISES_COL = 'exercises';

export async function listExercises() {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, EXERCISES_COL), orderBy('name')));
    if (snap.empty) {
      // Auto-extract and seed default exercises from equipment
      const seeded = await seedDefaultExercises();
      return seeded;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Could not read exercises from firestore', err);
    return [];
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
  if (!db) return [];
  const exercisesToSeed = [];

  // Extract from DEFAULT_EQUIPMENT
  for (const eq of DEFAULT_EQUIPMENT) {
    for (const ex of eq.exercises || []) {
      exercisesToSeed.push({
        id: uid(),
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        muscleGroup: eq.category || 'Chest',
        difficulty: ex.difficulty || 'Beginner',
        equipmentId: '', // generic match by name
        equipmentName: eq.name,
        setup: ex.setup || '',
        execution: ex.execution || '',
        mistakes: ex.mistakes || '',
        cues: ex.cues || '',
        videoUrl: ex.videoUrl || '',
        tempo: '1s Contraction · 1s Squeeze · 3s Eccentric',
      });
    }
  }

  // Also add classic free weight / bodyweight exercises
  exercisesToSeed.push(
    {
      id: uid(),
      name: 'Dumbbell Incline Chest Press',
      targetMuscle: 'Upper Pectorals & Front Deltoids',
      muscleGroup: 'Chest',
      difficulty: 'Intermediate',
      equipmentId: 'free_weights',
      equipmentName: 'Incline Bench & Dumbbells',
      setup: 'Set bench to 30-45 degrees angle. Pick dumbbells and sit back with weights on knees.',
      execution: '1. Kick dumbbells to shoulders and plant feet.\n2. Press upward in a slight triangle path.\n3. Lower with 3-second control until you feel deep chest stretch.',
      mistakes: 'Bouncing weights or arching lower back excessively.',
      cues: 'Drive through your elbows and press with your upper chest.',
      tempo: '1s Contraction · 1s Squeeze · 3s Eccentric',
    },
    {
      id: uid(),
      name: 'Romanian Deadlift (RDL)',
      targetMuscle: 'Hamstrings & Gluteus Maximus',
      muscleGroup: 'Legs',
      difficulty: 'Intermediate',
      equipmentId: 'free_weights',
      equipmentName: 'Olympic Barbell & Plates',
      setup: 'Stand shoulder-width apart holding barbell with overhand grip at thighs.',
      execution: '1. Push hips back while keeping back flat and shins vertical.\n2. Lower bar just below knees.\n3. Drive hips forward to stand tall.',
      mistakes: 'Rounding the lower back or bending knees like a squat.',
      cues: 'Imagine closing a car door behind you with your hips.',
      tempo: '1s Contraction · 1s Squeeze · 3s Eccentric',
    },
    {
      id: uid(),
      name: 'Standard Bodyweight Pushup',
      targetMuscle: 'Chest, Triceps & Core',
      muscleGroup: 'Chest',
      difficulty: 'Beginner',
      equipmentId: 'bodyweight',
      equipmentName: 'Bodyweight / Floor Mat',
      setup: 'Place hands slightly wider than shoulder-width, body in a rigid plank.',
      execution: '1. Lower chest until 1 inch from the floor.\n2. Elbows at 45 degree angle to torso.\n3. Press the ground away to full lockout.',
      mistakes: 'Sagging hips or flaring elbows 90 degrees.',
      cues: 'Squeeze glutes and push the floor away.',
      tempo: '1s Contraction · 1s Squeeze · 2s Eccentric',
    }
  );

  const savedList = [];
  for (const item of exercisesToSeed) {
    const docRef = doc(db, EXERCISES_COL, item.id);
    await setDoc(docRef, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    savedList.push(item);
  }
  return savedList;
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
