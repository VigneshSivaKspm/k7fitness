/**
 * Seed all comprehensive Tamil Nadu 6-Day (Monday-to-Saturday) Food Charts to Firestore
 * Cleans up old generic diet templates and seeds the 6 Master Tamil Nadu splits.
 */
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, deleteDoc, getDocs, collection, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

// Read diet templates catalog
const catalogPath = path.join(__dirname, '../src/constants/dietTemplatesCatalog.js');
const rawCode = fs.readFileSync(catalogPath, 'utf8');

// Transpile ES module export to CommonJS in-memory
const cjsCode = rawCode.replace('export const ALL_DIET_TEMPLATES =', 'module.exports =');
const tmpModulePath = path.join(__dirname, '.temp_diet_templates.cjs');
fs.writeFileSync(tmpModulePath, cjsCode, 'utf8');

const ALL_DIET_TEMPLATES = require(tmpModulePath);
fs.unlinkSync(tmpModulePath);

const OLD_DIET_IDS = [
  'dt-fat-loss-mon-sat',
  'dt-weight-gain-mon-sat',
  'dt-veg-high-protein-mon-sat',
  'dt-recomp-mon-sat'
];

async function run() {
  console.log(`🧹 Cleaning up ${OLD_DIET_IDS.length} generic diet templates from Firestore...`);
  for (const oldId of OLD_DIET_IDS) {
    try {
      await deleteDoc(doc(db, 'dietTemplates', oldId));
      console.log(`   Deleted legacy template: ${oldId}`);
    } catch (err) {
      console.warn(`   Could not delete ${oldId}:`, err.message);
    }
  }

  console.log(`\n🚀 Seeding ${ALL_DIET_TEMPLATES.length} Master Tamil Nadu 6-Day Food Charts to Firestore...`);

  for (const template of ALL_DIET_TEMPLATES) {
    const templateDoc = {
      ...template,
      nameLower: template.name.toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'master-coach-tn-seed',
      updatedBy: 'master-coach-tn-seed',
    };

    const docRef = doc(db, 'dietTemplates', template.id);
    await setDoc(docRef, templateDoc, { merge: true });
    console.log(`✅ Seeded Tamil Nadu Food Chart: [${template.goal} · ${template.calories} kcal · ${template.protein}g Protein] "${template.name}" (${template.meals.length} days)`);
  }

  // Verify in Firestore
  const snap = await getDocs(collection(db, 'dietTemplates'));
  console.log(`\n🎉 Verification: Firestore now holds ${snap.docs.length} diet templates!`);
  snap.docs.forEach((d) => {
    const data = d.data();
    console.log(`  - [${d.id}] "${data.name}" (${data.goal} | ${data.calories} kcal | ${data.protein}g Protein | ${data.meals?.length || 0} days)`);
  });

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
