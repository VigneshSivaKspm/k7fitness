export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'other', label: 'Other' },
];
export const paymentMethodLabel = (v) => PAYMENT_METHODS.find((m) => m.value === v)?.label || v;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export const MEMBERSHIP_STATUS = {
  active: { label: 'Active', tone: 'success' },
  expiring: { label: 'Expiring soon', tone: 'warning' },
  expired: { label: 'Expired', tone: 'danger' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  none: { label: 'No plan', tone: 'neutral' },
};

export const PAYMENT_STATUS = {
  paid: { label: 'Paid', tone: 'success' },
  partial: { label: 'Partial', tone: 'warning' },
  pending: { label: 'Pending', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'danger' },
};

export const MEMBERSHIP_RECORD_STATUS = {
  current: { label: 'Current', tone: 'success' },
  upcoming: { label: 'Upcoming', tone: 'brand' },
  completed: { label: 'Completed', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const ENQUIRY_STATUS = {
  new: { label: 'New', tone: 'brand' },
  contacted: { label: 'Contacted', tone: 'warning' },
  'follow-up': { label: 'Follow-up', tone: 'warning' },
  converted: { label: 'Converted', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
  spam: { label: 'Spam', tone: 'danger' },
};

export const WORKOUT_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const WORKOUT_GOALS = ['Fat loss', 'Muscle gain', 'Strength', 'General fitness', 'Endurance', 'Rehab / mobility', 'Custom'];
export const DIET_GOALS = ['Weight loss', 'Muscle gain', 'General fitness', 'High protein', 'Maintenance', 'Custom'];

export const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', description: 'Burn excess fat and tone your body' },
  { value: 'muscle_building', label: 'Muscle Building', description: 'Build lean mass, strength & power' },
  { value: 'weight_gain', label: 'Weight Gain', description: 'Healthy mass & size development' },
  { value: 'body_recomposition', label: 'Body Recomposition', description: 'Lose body fat while building muscle' },
  { value: 'general_fitness', label: 'General Fitness', description: 'Cardiovascular health, mobility & energy' },
  { value: 'tone_shred', label: 'Tone & Shred', description: 'Cut fat, increase definition & endurance' },
];

export const fitnessGoalLabel = (val) => FITNESS_GOALS.find((g) => g.value === val)?.label || val || 'General Fitness';

export const BODY_TYPES = {
  male: [
    {
      id: 'ectomorph',
      label: 'Ectomorph',
      subtitle: 'Lean & Slim',
      description: 'Narrow shoulders & chest, leaner bone structure, fast metabolism.',
    },
    {
      id: 'mesomorph',
      label: 'Mesomorph',
      subtitle: 'Athletic & Muscular',
      description: 'Broad shoulders, narrow waist, naturally muscular frame, responsive to lifting.',
    },
    {
      id: 'endomorph',
      label: 'Endomorph',
      subtitle: 'Solid & Heavy Build',
      description: 'Wider waist and joints, robust bone structure, easily builds strength.',
    },
  ],
  female: [
    {
      id: 'ectomorph',
      label: 'Ectomorph',
      subtitle: 'Slender & Lean',
      description: 'Longer limbs, narrow collarbones, slender build with high metabolism.',
    },
    {
      id: 'mesomorph',
      label: 'Mesomorph',
      subtitle: 'Athletic & Toned',
      description: 'Hourglass or defined frame, natural athletic posture, quick response to training.',
    },
    {
      id: 'endomorph',
      label: 'Endomorph',
      subtitle: 'Curvy & Fuller',
      description: 'Full-bodied or pear/apple frame, softer curves, stores energy readily.',
    },
  ],
};

export const MEAL_SLOTS = [
  'Early Morning',
  'Breakfast',
  'Mid-Morning',
  'Lunch',
  'Pre-Workout',
  'Post-Workout',
  'Evening',
  'Dinner',
  'Before Bed',
];

export const CURRENCIES = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'AED', label: 'AED UAE Dirham' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'GBP', label: '£ British Pound (GBP)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
];

export const PLAN_TYPES = [
  { value: 'general_training', label: 'General Training (GT)' },
  { value: 'personal_training', label: 'Personal Training (PT)' },
];
export const planTypeLabel = (v) => PLAN_TYPES.find((p) => p.value === v)?.label || (v === 'personal_training' ? 'Personal Training' : 'General Training');

export const ADMIN_ROLES = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  trainer: 'Trainer',
  receptionist: 'Receptionist',
};

export const DEFAULT_SETTINGS = {
  currency: 'INR',
  memberIdPrefix: 'K7',
  expiryAlertDays: 7,
  feeDueDays: 7,
  receiptFooter: 'Thank you for training with us. Fees once paid are non-refundable.',
  gymTimings: 'Morning: 5:30 AM – 10:30 AM | Evening: 4:30 PM – 9:30 PM',
  feeTimings: 'Fee desk hours: 6:00 AM – 10:00 AM & 5:00 PM – 9:00 PM',
  renewalTemplate:
    'Hello {name},\n\nYour gym membership ({plan}) is due for renewal on {expiryDate}.\n\nGym Timings: {gymTimings}\nFee Timings: {feeTimings}\n\nPlease visit reception or contact us to renew your membership.\n\nThank you,\n{gymName}',
  paymentReminderTemplate:
    'Hello {name},\n\nThis is a friendly reminder that {amount} is pending for your {gymName} membership.\n\nGym Timings: {gymTimings}\nFee Timings: {feeTimings}\n\nPlease clear the dues at your earliest convenience.\n\nThank you,\n{gymName}',
  enquiryTemplate: 'Hello {name}, thank you for your enquiry at {gymName}! When would be a good time to visit us?',
};

export const DEFAULT_BUSINESS = {
  gymName: 'K7 Fitness Studio & Gym',
  logoUrl: '',
  logoPath: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
};
