/**
 * Seed all comprehensive 6-Day (Monday-to-Saturday) Workout Templates to Firestore
 * Cleans up old 5-day templates and seeds the 10 Master 6-Day splits (8 exercises/day).
 */
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, deleteDoc, getDocs, collection, serverTimestamp } = require('firebase/firestore');

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

// Read workout templates catalog
const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../src/constants/workoutTemplatesCatalog.js');
const rawCode = fs.readFileSync(catalogPath, 'utf8');

// Transpile ES module export to CommonJS in-memory
const cjsCode = rawCode.replace('export const ALL_WORKOUT_TEMPLATES =', 'module.exports =');
const tmpModulePath = path.join(__dirname, '.temp_workout_templates.cjs');
fs.writeFileSync(tmpModulePath, cjsCode, 'utf8');

const ALL_WORKOUT_TEMPLATES = require(tmpModulePath);
fs.unlinkSync(tmpModulePath);

const OLD_5DAY_IDS = [
  'wt-beg-fat-loss',
  'wt-beg-weight-gain',
  'wt-beg-general-fitness',
  'wt-int-ppl-split',
  'wt-int-fat-shred',
  'wt-adv-pro-split',
  'wt-adv-athletic-power',
  'wt-adv-contest-shred'
];

async function run() {
  console.log(`🧹 Cleaning up ${OLD_5DAY_IDS.length} legacy 5-day templates from Firestore...`);
  for (const oldId of OLD_5DAY_IDS) {
    try {
      await deleteDoc(doc(db, 'workoutTemplates', oldId));
      console.log(`   Deleted legacy template: ${oldId}`);
    } catch (err) {
      console.warn(`   Could not delete ${oldId}:`, err.message);
    }
  }

  console.log(`\n🚀 Seeding ${ALL_WORKOUT_TEMPLATES.length} Master 6-Day (Monday-to-Saturday) workout templates to Firestore...`);

  for (const template of ALL_WORKOUT_TEMPLATES) {
    const totalExercises = template.days.reduce((acc, d) => acc + d.exercises.length, 0);
    const templateDoc = {
      ...template,
      nameLower: template.name.toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'master-coach-seed',
      updatedBy: 'master-coach-seed',
    };

    const docRef = doc(db, 'workoutTemplates', template.id);
    await setDoc(docRef, templateDoc, { merge: true });
    console.log(`✅ Seeded template: [${template.level} · ${template.goal}] "${template.name}" (${template.days.length} days, ${totalExercises} exercises)`);
  }

  // Verify in Firestore
  const snap = await getDocs(collection(db, 'workoutTemplates'));
  console.log(`\n🎉 Verification: Firestore now holds ${snap.docs.length} workout templates!`);
  snap.docs.forEach((d) => {
    const data = d.data();
    const exCount = data.days?.reduce((acc, dy) => acc + (dy.exercises?.length || 0), 0) || 0;
    console.log(`  - [${d.id}] "${data.name}" (${data.level} | ${data.goal} | ${data.days?.length || 0} days | ${exCount} total exercises)`);
  });

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
