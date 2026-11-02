const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../src/constants/dietTemplatesCatalog.js');
const raw = fs.readFileSync(p, 'utf8');
const cjs = raw.replace('export const ALL_DIET_TEMPLATES =', 'module.exports =');
const tmpPath = path.join(__dirname, '.tmp_clean.cjs');
fs.writeFileSync(tmpPath, cjs, 'utf8');
const tpls = require(tmpPath);
fs.unlinkSync(tmpPath);

const cleanTpls = tpls.filter(Boolean);
const fileHeader = `// Comprehensive K7 Fitness Studio Tamil Nadu 6-Day (Monday-to-Saturday) Food Charts Catalog
// 100% locally available Tamil Nadu foods: Idli, Dosa, Ragi, Kambu, Millets, Farm Eggs, Country Chicken,
// Seer/Mackerel Fish, Soya Chunks (Meal Maker), Fresh Aavin Paneer, Sundal, Murungai Keerai, Elaneer, Neer Mor
// Engineered by Master Gym Coaches for Tamil Nadu gym trainees (Monday to Saturday, Sunday Maintenance)

export const ALL_DIET_TEMPLATES = `;

fs.writeFileSync(p, fileHeader + JSON.stringify(cleanTpls, null, 2) + ';\n', 'utf8');
console.log('✅ Cleaned diet catalog with', cleanTpls.length, 'templates:');
cleanTpls.forEach((t, i) => console.log(`   [${i+1}] ${t.id} -> ${t.name} (${t.calories} kcal | ${t.protein}g protein)`));
