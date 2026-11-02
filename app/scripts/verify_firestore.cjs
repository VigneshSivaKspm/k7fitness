const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const app = initializeApp({
  apiKey: 'AIzaSyB5YM-1qRPzeZWYRZIamhlb06w83Wuz54M',
  authDomain: 'k7-fitness-studio.firebaseapp.com',
  projectId: 'k7-fitness-studio',
  storageBucket: 'k7-fitness-studio.firebasestorage.app',
  messagingSenderId: '604493640526',
  appId: '1:604493640526:web:96d1e9ec5394b209dce41f'
});
const db = getFirestore(app);

async function run() {
  const wSnap = await getDocs(collection(db, 'workoutTemplates'));
  console.log(`\n========================================`);
  console.log(`WORKOUT TEMPLATES IN FIRESTORE (${wSnap.size})`);
  console.log(`========================================`);
  wSnap.docs.forEach((d) => {
    const data = d.data();
    const days = data.days || [];
    const exCount = days.reduce((acc, dy) => acc + (dy.exercises?.length || 0), 0);
    console.log(`• [${data.level} · ${data.goal}] "${data.name}"`);
    console.log(`   └─ Days: ${days.length} (Mon–Sat) | Total Exercises: ${exCount} (${Math.round(exCount / days.length)} ex/day)`);
  });

  const dSnap = await getDocs(collection(db, 'dietTemplates'));
  console.log(`\n========================================`);
  console.log(`DIET TEMPLATES IN FIRESTORE (${dSnap.size})`);
  console.log(`========================================`);
  dSnap.docs.forEach((d) => {
    const data = d.data();
    console.log(`• [${data.goal}] "${data.name}"`);
    console.log(`   └─ Days: ${data.meals?.length || 0} (Mon–Sat) | Calories: ${data.calories} kcal | Protein: ${data.protein}g`);
  });

  process.exit(0);
}

run();
