const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/constants/gymExercisesCatalog.js'), 'utf8');
const cjs = content.replace('export const GYM_EXERCISES_CATALOG =', 'module.exports =');
const tmpPath = path.join(__dirname, '.tmp_ex_groups.cjs');
fs.writeFileSync(tmpPath, cjs, 'utf8');
const exs = require(tmpPath);
fs.unlinkSync(tmpPath);

const byGroup = {};
exs.forEach(e => {
  if (!byGroup[e.muscleGroup]) byGroup[e.muscleGroup] = [];
  byGroup[e.muscleGroup].push(e.name);
});

for (const [grp, list] of Object.entries(byGroup)) {
  console.log(`\n=== ${grp} (${list.length}) ===`);
  console.log(list.slice(0, 15).join(' || '));
}
