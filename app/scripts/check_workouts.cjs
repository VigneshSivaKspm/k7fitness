const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/constants/workoutTemplatesCatalog.js'), 'utf8');
const cjs = content.replace('export const ALL_WORKOUT_TEMPLATES =', 'module.exports =');
const tmpPath = path.join(__dirname, '.tmp_check.cjs');
fs.writeFileSync(tmpPath, cjs, 'utf8');
const tpls = require(tmpPath);
fs.unlinkSync(tmpPath);

console.log('Total templates:', tpls.length);
tpls.forEach((t, i) => {
  console.log(`\n[${i+1}] ${t.name} (ID: ${t.id}, Level: ${t.level}, Goal: ${t.goal}, Days: ${t.days.length})`);
  t.days.forEach((d, di) => {
    console.log(`   Day ${di+1}: ${d.title} (${d.exercises.length} exercises)`);
  });
});
