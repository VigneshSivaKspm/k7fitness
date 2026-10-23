import { BODY_TYPES, FITNESS_GOALS } from '../constants/options';

/**
 * Calculates BMI (Body Mass Index) and health classification.
 * Formula: weight (kg) / (height (m))^2
 */
export function calculateBmi(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w || h <= 50 || w <= 20) return null;

  const meters = h / 100;
  const bmi = Number((w / (meters * meters)).toFixed(1));

  let category = 'Normal';
  let tone = 'success';
  let description = 'Healthy BMI range';

  if (bmi < 18.5) {
    category = 'Underweight';
    tone = 'warning';
    description = 'Below standard weight';
  } else if (bmi <= 24.9) {
    category = 'Normal';
    tone = 'success';
    description = 'Optimal healthy weight';
  } else if (bmi <= 29.9) {
    category = 'Overweight';
    tone = 'warning';
    description = 'Above standard weight';
  } else {
    category = 'Obese';
    tone = 'danger';
    description = 'High BMI range';
  }

  // Healthy weight range for this height (BMI 18.5 - 24.9)
  const minHealthy = Number((18.5 * meters * meters).toFixed(1));
  const maxHealthy = Number((24.9 * meters * meters).toFixed(1));

  return {
    value: bmi,
    category,
    tone,
    description,
    healthyRange: `${minHealthy} – ${maxHealthy} kg`,
  };
}

export function cmToFeetInches(cm) {
  if (!cm) return '';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function bodyTypeDetails(typeId, gender = 'male') {
  const g = gender === 'female' ? 'female' : 'male';
  const list = BODY_TYPES[g] || BODY_TYPES.male;
  return list.find((b) => b.id === typeId) || null;
}
