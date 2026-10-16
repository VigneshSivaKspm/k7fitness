const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, writeBatch } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyB5YM-1qRPzeZWYRZIamhlb06w83Wuz54M',
  authDomain: 'k7-fitness-studio.firebaseapp.com',
  projectId: 'k7-fitness-studio',
  storageBucket: 'k7-fitness-studio.firebasestorage.app',
  messagingSenderId: '604493640526',
  appId: '1:604493640526:web:96d1e9ec5394b209dce41f'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const manifestPath = path.join(__dirname, '../public/Major_Male_Exercise_GIFs/exercise_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Exact mapping dictionary
const manifestMap = {};
manifest.forEach(m => {
  manifestMap[m.source_number] = {
    gif: `/Major_Male_Exercise_GIFs/${m.gif_filename}`,
    webp: `/Major_Male_Exercise_GIFs/${m.gif_filename.replace(/\.gif$/i, '.webp')}`
  };
});

// Variation mapping for sister exercises on same machine
const variationGroups = [
  // Olympic Bench
  { base: 1, targets: [2] },
  // Smith Bench
  { base: 3, targets: [4] },
  // Dumbbell Bench & Fly
  { base: 5, targets: [6, 7, 8, 20, 21] },
  // Plate Chest Press
  { base: 9, targets: [10] },
  // Cable Fly / Press
  { base: 14, targets: [15, 16, 17, 18, 248, 249] },
  // Pec Deck
  { base: 19, targets: [78] },
  // Lat Pulldown
  { base: 26, targets: [27, 28, 29, 30, 31, 252] },
  // Seated Cable Row
  { base: 35, targets: [36, 37, 38, 40, 250, 251] },
  // Plate Seated Row
  { base: 39, targets: [41] },
  // T-Bar Row
  { base: 42, targets: [43, 44] },
  // Assisted Pull-Up & Dips
  { base: 51, targets: [52, 22, 124, 240] },
  // 45-Degree Hyperextension
  { base: 59, targets: [58, 60, 221, 222, 223] },
  // Shoulder Press
  { base: 61, targets: [62, 63] },
  // Preacher Curl
  { base: 92, targets: [93] },
  // Triceps Pushdown
  { base: 111, targets: [110, 112, 113, 114, 260] },
  // Leg Press
  { base: 127, targets: [128, 129, 130, 131, 132, 177, 178, 179, 191, 192] },
  // Leg Extension
  { base: 133, targets: [134] },
  // Lying Leg Curl
  { base: 155, targets: [158] },
  // Seated Leg Curl
  { base: 156, targets: [157] },
  // Seated Calf Raise
  { base: 189, targets: [190] },
  // Captain's Chair Knee Raise
  { base: 206, targets: [202, 203, 204, 205, 207] },
  // Treadmill
  { base: 286, targets: [287, 288, 289, 290, 291, 292, 293, 294] },
  // Elliptical
  { base: 295, targets: [296, 297, 298, 299, 300] },
  // Recumbent Bike
  { base: 301, targets: [302, 303, 304, 305, 306] },
  // Rowing
  { base: 307, targets: [308, 309, 310, 311, 312, 313] }
];

// Map of equipmentId to its primary demonstration animation
const equipmentAnimationMap = {
  'eq-olympic-flat-bench': manifestMap[1]?.webp,
  'eq-olympic-incline-bench': manifestMap[1]?.webp,
  'eq-smith-machine': manifestMap[3]?.webp,
  'eq-adjustable-bench': manifestMap[5]?.webp,
  'eq-plate-chest-press': manifestMap[9]?.webp,
  'eq-plate-incline-chest-press': manifestMap[9]?.webp,
  'eq-dual-adjustable-pulley': manifestMap[14]?.webp,
  'eq-pec-deck-fly': manifestMap[19]?.webp,
  'eq-lat-pulldown-pin': manifestMap[26]?.webp,
  'eq-plate-lat-pulldown': manifestMap[32]?.webp,
  'eq-dual-pulldown-lowrow': manifestMap[35]?.webp,
  'eq-plate-seated-row': manifestMap[39]?.webp,
  'eq-pin-seated-row': manifestMap[35]?.webp,
  'eq-tbar-row': manifestMap[42]?.webp,
  'eq-assisted-chin-dip': manifestMap[51]?.webp,
  'eq-assisted-dip-pullup-frame': manifestMap[51]?.webp,
  'eq-hyperextension-45': manifestMap[59]?.webp,
  'eq-roman-chair': manifestMap[59]?.webp,
  'eq-plate-overhead-shoulder-press': manifestMap[61]?.webp,
  'eq-plate-shoulder-incline-press': manifestMap[61]?.webp,
  'eq-preacher-curl': manifestMap[92]?.webp,
  'eq-leg-press-45': manifestMap[127]?.webp,
  'eq-leg-extension-pin': manifestMap[133]?.webp,
  'eq-prone-leg-curl': manifestMap[155]?.webp,
  'eq-leg-ext-curl-combo': manifestMap[156]?.webp,
  'eq-seated-calf-raise': manifestMap[189]?.webp,
  'eq-abdominal-crunch-machine': manifestMap[198]?.webp,
  'eq-vertical-knee-raise': manifestMap[206]?.webp,
  'eq-motorized-treadmills': manifestMap[286]?.webp,
  'eq-cardio-bikes-ellipticals': manifestMap[295]?.webp,
  'eq-rowing-machine': manifestMap[307]?.webp
};

async function main() {
  console.log('Loading existing catalogs...');
  const { GYM_EXERCISES_CATALOG } = require('../src/constants/gymExercisesCatalog.js');
  const { GYM_EQUIPMENT_CATALOG } = require('../src/constants/gymEquipmentCatalog.js');

  // Assign animations to exercises
  let linkedCount = 0;
  const updatedExercises = GYM_EXERCISES_CATALOG.map((ex) => {
    let anim = manifestMap[ex.exerciseNumber];
    if (!anim) {
      // Check variations
      for (const group of variationGroups) {
        if (group.targets.includes(ex.exerciseNumber)) {
          anim = manifestMap[group.base];
          break;
        }
      }
    }

    if (anim) {
      linkedCount++;
      return {
        ...ex,
        gifUrl: anim.webp,
        rawGifUrl: anim.gif,
        animationUrl: anim.webp,
        videoUrl: anim.webp,
        hasAnimation: true
      };
    }
    return ex;
  });

  console.log(`Successfully linked animated form guides to ${linkedCount} exercises!`);

  // Write updated exercises catalog
  const exCatalogPath = path.join(__dirname, '../src/constants/gymExercisesCatalog.js');
  fs.writeFileSync(
    exCatalogPath,
    `// Auto-generated Gym Exercises Catalog with compressed animations\n\nexport const GYM_EXERCISES_CATALOG = ${JSON.stringify(updatedExercises, null, 2)};\n`,
    'utf8'
  );
  console.log(`Updated ${exCatalogPath}`);

  // Assign animations to equipment
  const updatedEquipment = GYM_EQUIPMENT_CATALOG.map((eq) => {
    const animUrl = equipmentAnimationMap[eq.id];
    if (animUrl) {
      return {
        ...eq,
        animationUrl: animUrl,
        videoUrl: animUrl,
        hasAnimation: true
      };
    }
    return eq;
  });

  const eqCatalogPath = path.join(__dirname, '../src/constants/gymEquipmentCatalog.js');
  fs.writeFileSync(
    eqCatalogPath,
    `// Auto-generated Gym Equipment Catalog with compressed animations\n\nexport const GYM_EQUIPMENT_CATALOG = ${JSON.stringify(updatedEquipment, null, 2)};\n`,
    'utf8'
  );
  console.log(`Updated ${eqCatalogPath}`);

  // Push updated exercises to Firestore in batches
  console.log('\n--- Syncing Animated Exercises to Firestore ---');
  const batchSize = 100;
  for (let i = 0; i < updatedExercises.length; i += batchSize) {
    const chunk = updatedExercises.slice(i, i + batchSize);
    const batch = writeBatch(db);
    for (const ex of chunk) {
      const docRef = doc(db, 'exercises', ex.id);
      batch.set(docRef, { ...ex, updatedAt: new Date() }, { merge: true });
    }
    await batch.commit();
    console.log(`Synced exercises batch ${i + 1} to ${Math.min(i + batchSize, updatedExercises.length)}...`);
  }

  // Push updated equipment to Firestore
  console.log('\n--- Syncing Equipment with Demo Animations to Firestore ---');
  for (const eq of updatedEquipment) {
    const docRef = doc(db, 'equipment', eq.id);
    await setDoc(docRef, { ...eq, updatedAt: new Date() }, { merge: true });
  }
  console.log(`Synced ${updatedEquipment.length} equipment machines to Firestore.`);

  console.log('\nALL ANIMATIONS SUCCESSFULLY LINKED AND STORED IN FIRESTORE!');
  process.exit(0);
}

main().catch(err => {
  console.error('Failed linking animations:', err);
  process.exit(1);
});
