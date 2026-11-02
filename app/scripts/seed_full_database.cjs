/**
 * Script to push all 39 gym machines and all 338 tagged exercises to Firestore
 * and generate app/src/constants/gymExercisesCatalog.js
 */

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

// Import 39 gym equipment catalog
const { GYM_EQUIPMENT_CATALOG } = require('../src/constants/gymEquipmentCatalog.js');

// Helper to construct exercises
const buildExercises = () => {
  const data = [
    // ── CHEST (1-25) ──
    { no: 1, name: 'Olympic Barbell Flat Bench Press', group: 'Chest', target: 'Pectoralis Major & Triceps', eqId: 'eq-olympic-flat-bench', eqName: 'Olympic Flat Bench Press', diff: 'Intermediate' },
    { no: 2, name: 'Olympic Barbell Incline Bench Press', group: 'Chest', target: 'Upper Pectorals (Clavicular Head)', eqId: 'eq-olympic-incline-bench', eqName: 'Olympic Incline Bench Press', diff: 'Intermediate' },
    { no: 3, name: 'Smith Machine Flat Bench Press', group: 'Chest', target: 'Mid-Pectoralis Major', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Beginner' },
    { no: 4, name: 'Smith Machine Incline Bench Press', group: 'Chest', target: 'Upper Chest & Front Deltoids', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Beginner' },
    { no: 5, name: 'Dumbbell Flat Bench Press', group: 'Chest', target: 'Pectoralis Major & Stabilizers', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 6, name: 'Dumbbell Incline Bench Press', group: 'Chest', target: 'Upper Pectorals', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 7, name: 'Dumbbell Neutral-Grip Bench Press', group: 'Chest', target: 'Inner Chest & Triceps', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 8, name: 'Dumbbell Incline Neutral-Grip Press', group: 'Chest', target: 'Upper Chest & Anterior Delts', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 9, name: 'Plate-Loaded Chest Press', group: 'Chest', target: 'Mid & Outer Pectorals', eqId: 'eq-plate-chest-press', eqName: 'Plate-Loaded Chest Press Machine', diff: 'Beginner' },
    { no: 10, name: 'Plate-Loaded Incline Chest Press', group: 'Chest', target: 'Upper Chest Fibers', eqId: 'eq-plate-incline-chest-press', eqName: 'Plate-Loaded Incline Chest Press', diff: 'Beginner' },
    { no: 11, name: 'Standing Cable Chest Press', group: 'Chest', target: 'Pectorals & Core Stability', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 12, name: 'Single-Arm Cable Chest Press', group: 'Chest', target: 'Unilateral Chest & Anti-Rotation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 13, name: 'Seated Cable Chest Press', group: 'Chest', target: 'Sustained Pectoral Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 14, name: 'Cable Chest Fly', group: 'Chest', target: 'Sternal Pectorals', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 15, name: 'Mid Cable Fly', group: 'Chest', target: 'Mid-Chest Cleavage & Stretch', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 16, name: 'High-to-Low Cable Fly', group: 'Chest', target: 'Lower Pectorals (Abdominal Head)', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 17, name: 'Low-to-High Cable Fly', group: 'Chest', target: 'Upper Inner Chest', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 18, name: 'Single-Arm Cable Fly', group: 'Chest', target: 'Peak Pec Contraction Across Midline', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 19, name: 'Pec Deck Fly', group: 'Chest', target: 'Pectoralis Major Isolation', eqId: 'eq-pec-deck-fly', eqName: 'Pec Deck Fly and Rear Deltoid Machine', diff: 'Beginner' },
    { no: 20, name: 'Dumbbell Flat Bench Fly', group: 'Chest', target: 'Chest Outer Stretch', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 21, name: 'Dumbbell Incline Fly', group: 'Chest', target: 'Upper Chest Stretch & Sweep', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 22, name: 'Assisted Chest Dip', group: 'Chest', target: 'Lower Chest & Triceps', eqId: 'eq-assisted-chin-dip', eqName: 'Assisted Chin-up and Dip Machine', diff: 'Beginner' },
    { no: 23, name: 'Bodyweight Dip', group: 'Chest', target: 'Lower Chest & Triceps Power', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Advanced' },
    { no: 24, name: 'Push-Up', group: 'Chest', target: 'Chest, Triceps & Core', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 25, name: 'Incline Push-Up', group: 'Chest', target: 'Lower Pectorals & Push Mechanics', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },

    // ── BACK (26-60) ──
    { no: 26, name: 'Standard Lat Pulldown', group: 'Back', target: 'Latissimus Dorsi', eqId: 'eq-lat-pulldown-pin', eqName: 'Lat Pulldown Machine', diff: 'Beginner' },
    { no: 27, name: 'Wide-Grip Lat Pulldown', group: 'Back', target: 'Upper Lats & V-Taper Width', eqId: 'eq-lat-pulldown-pin', eqName: 'Lat Pulldown Machine', diff: 'Intermediate' },
    { no: 28, name: 'Close-Grip Lat Pulldown', group: 'Back', target: 'Lower Lats & Biceps', eqId: 'eq-lat-pulldown-pin', eqName: 'Lat Pulldown Machine', diff: 'Beginner' },
    { no: 29, name: 'Neutral-Grip Lat Pulldown', group: 'Back', target: 'Mid-Lats & Shoulder-Friendly Pull', eqId: 'eq-lat-pulldown-pin', eqName: 'Lat Pulldown Machine', diff: 'Beginner' },
    { no: 30, name: 'Reverse-Grip Lat Pulldown', group: 'Back', target: 'Lower Lats & Biceps Brachii', eqId: 'eq-lat-pulldown-pin', eqName: 'Lat Pulldown Machine', diff: 'Intermediate' },
    { no: 31, name: 'Single-Arm Cable Lat Pulldown', group: 'Back', target: 'Unilateral Lat Length & Contraction', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 32, name: 'Plate-Loaded Lat Pulldown', group: 'Back', target: 'Heavy Iso-Lateral Lat Thickness', eqId: 'eq-plate-lat-pulldown', eqName: 'Plate-Loaded Lat Pulldown Machine', diff: 'Intermediate' },
    { no: 33, name: 'Straight-Arm Cable Pulldown', group: 'Back', target: 'Lat Isolation & Teres Major', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 34, name: 'Cable Pullover', group: 'Back', target: 'Lats & Serratus Anterior', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 35, name: 'Seated Low Cable Row', group: 'Back', target: 'Mid Back, Rhomboids & Lats', eqId: 'eq-dual-pulldown-lowrow', eqName: 'Dual-Pulley Lat Pulldown and Low Row', diff: 'Beginner' },
    { no: 36, name: 'Close-Grip Seated Cable Row', group: 'Back', target: 'Lower Lats & Mid-Back Thickness', eqId: 'eq-dual-pulldown-lowrow', eqName: 'Dual-Pulley Lat Pulldown and Low Row', diff: 'Beginner' },
    { no: 37, name: 'Wide-Grip Seated Cable Row', group: 'Back', target: 'Upper Trapezius & Rhomboids', eqId: 'eq-dual-pulldown-lowrow', eqName: 'Dual-Pulley Lat Pulldown and Low Row', diff: 'Intermediate' },
    { no: 38, name: 'Single-Arm Cable Row', group: 'Back', target: 'Unilateral Lat & Rhomboid Sweep', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 39, name: 'Plate-Loaded Seated Row', group: 'Back', target: 'Mid-Back Iso-Lateral Overload', eqId: 'eq-plate-seated-row', eqName: 'Plate-Loaded Seated Row Machine', diff: 'Intermediate' },
    { no: 40, name: 'Pin-Loaded Seated Row', group: 'Back', target: 'Middle Trapezius & Lats', eqId: 'eq-pin-seated-row', eqName: 'Pin-Loaded Seated Row Machine', diff: 'Beginner' },
    { no: 41, name: 'Single-Arm Plate-Loaded Row', group: 'Back', target: 'Deep Lat Stretch & Contraction', eqId: 'eq-plate-seated-row', eqName: 'Plate-Loaded Seated Row Machine', diff: 'Intermediate' },
    { no: 42, name: 'Chest-Supported T-Bar Row', group: 'Back', target: 'Mid-Back Thickness without Lumbar Strain', eqId: 'eq-tbar-row', eqName: 'Chest-Supported T-Bar Row Machine', diff: 'Intermediate' },
    { no: 43, name: 'Wide-Grip T-Bar Row', group: 'Back', target: 'Upper Lats & Rear Delts', eqId: 'eq-tbar-row', eqName: 'Chest-Supported T-Bar Row Machine', diff: 'Intermediate' },
    { no: 44, name: 'Close-Grip T-Bar Row', group: 'Back', target: 'Lower Lats & Spinal Density', eqId: 'eq-tbar-row', eqName: 'Chest-Supported T-Bar Row Machine', diff: 'Intermediate' },
    { no: 45, name: 'Dumbbell One-Arm Row', group: 'Back', target: 'Latissimus Dorsi & Rhomboids', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 46, name: 'Dumbbell Chest-Supported Row', group: 'Back', target: 'Upper & Middle Back', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 47, name: 'Incline Bench Dumbbell Row', group: 'Back', target: 'Rhomboids & Rear Deltoids', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 48, name: 'Smith Machine Bent-Over Row', group: 'Back', target: 'Back Thickness & Lat Engagement', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 49, name: 'Smith Machine Underhand Row', group: 'Back', target: 'Lower Lats & Biceps', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 50, name: 'Cable High Row', group: 'Back', target: 'Upper Lats & Posterior Delts', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 51, name: 'Assisted Pull-Up', group: 'Back', target: 'Latissimus Dorsi Progression', eqId: 'eq-assisted-chin-dip', eqName: 'Assisted Chin-up and Dip Machine', diff: 'Beginner' },
    { no: 52, name: 'Assisted Chin-Up', group: 'Back', target: 'Lats & Biceps Progression', eqId: 'eq-assisted-chin-dip', eqName: 'Assisted Chin-up and Dip Machine', diff: 'Beginner' },
    { no: 53, name: 'Bodyweight Pull-Up', group: 'Back', target: 'Upper Body Pulling Strength', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Advanced' },
    { no: 54, name: 'Bodyweight Chin-Up', group: 'Back', target: 'Lats & Arm Pull Strength', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Intermediate' },
    { no: 55, name: 'Neutral-Grip Pull-Up', group: 'Back', target: 'Lats & Brachioradialis', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Intermediate' },
    { no: 56, name: 'Wide-Grip Pull-Up', group: 'Back', target: 'Upper Lat Width (V-Taper)', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Advanced' },
    { no: 57, name: 'Dumbbell Pullover', group: 'Back', target: 'Lats, Ribcage Expansion & Chest', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 58, name: 'Roman Chair Back Extension', group: 'Back', target: 'Erector Spinae & Glutes', eqId: 'eq-roman-chair', eqName: 'Roman Chair - Hyperextension Bench', diff: 'Beginner' },
    { no: 59, name: '45-Degree Hyperextension', group: 'Back', target: 'Lower Back & Posterior Chain', eqId: 'eq-hyperextension-45', eqName: '45-Degree Hyperextension Bench', diff: 'Beginner' },
    { no: 60, name: 'Weighted Hyperextension', group: 'Back', target: 'Spinal Erectors & Glute Hypertrophy', eqId: 'eq-hyperextension-45', eqName: '45-Degree Hyperextension Bench', diff: 'Intermediate' },

    // ── SHOULDERS (61-86) ──
    { no: 61, name: 'Plate-Loaded Shoulder Press', group: 'Shoulders', target: 'Anterior & Lateral Deltoids', eqId: 'eq-plate-shoulder-incline-press', eqName: 'Plate-Loaded Shoulder - Incline Press', diff: 'Beginner' },
    { no: 62, name: 'Plate-Loaded Overhead Shoulder Press', group: 'Shoulders', target: 'Overhead Deltoid Mass', eqId: 'eq-plate-overhead-shoulder-press', eqName: 'Plate-Loaded Overhead Shoulder Press', diff: 'Intermediate' },
    { no: 63, name: 'Smith Machine Shoulder Press', group: 'Shoulders', target: 'Anterior Deltoids & Triceps', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Beginner' },
    { no: 64, name: 'Smith Machine Behind-the-Neck Press', group: 'Shoulders', target: 'Lateral Delts & Upper Traps (Advanced)', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Advanced' },
    { no: 65, name: 'Seated Dumbbell Shoulder Press', group: 'Shoulders', target: 'Anterior Deltoids', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 66, name: 'Standing Dumbbell Shoulder Press', group: 'Shoulders', target: 'Deltoids & Core Stabilization', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 67, name: 'Arnold Press', group: 'Shoulders', target: 'All 3 Deltoid Heads', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 68, name: 'Single-Arm Dumbbell Shoulder Press', group: 'Shoulders', target: 'Unilateral Delts & Oblique Core', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 69, name: 'Single-Arm Cable Shoulder Press', group: 'Shoulders', target: 'Continuous Deltoid Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 70, name: 'Cable Shoulder Press', group: 'Shoulders', target: 'Deltoid Hypertrophy', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 71, name: 'Dumbbell Lateral Raise', group: 'Shoulders', target: 'Lateral Deltoids (Side Cap)', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 72, name: 'Seated Dumbbell Lateral Raise', group: 'Shoulders', target: 'Isolated Lateral Delts (No Momentum)', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 73, name: 'Cable Lateral Raise', group: 'Shoulders', target: 'Lateral Deltoids Full Range', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 74, name: 'Single-Arm Cable Lateral Raise', group: 'Shoulders', target: 'Side Deltoid Peak Isolation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 75, name: 'Dumbbell Front Raise', group: 'Shoulders', target: 'Anterior Deltoids', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 76, name: 'Alternating Dumbbell Front Raise', group: 'Shoulders', target: 'Anterior Deltoids', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 77, name: 'Cable Front Raise', group: 'Shoulders', target: 'Continuous Front Delt Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 78, name: 'Rear Delt Pec Deck Fly', group: 'Shoulders', target: 'Posterior Deltoids & Rhomboids', eqId: 'eq-pec-deck-fly', eqName: 'Pec Deck Fly and Rear Deltoid Machine', diff: 'Beginner' },
    { no: 79, name: 'Dumbbell Rear Delt Fly', group: 'Shoulders', target: 'Posterior Deltoids', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 80, name: 'Incline Bench Rear Delt Fly', group: 'Shoulders', target: 'Rear Delts (Strict Form)', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 81, name: 'Cable Rear Delt Fly', group: 'Shoulders', target: 'Posterior Deltoids Continuous Pull', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 82, name: 'Single-Arm Cable Rear Delt Fly', group: 'Shoulders', target: 'Unilateral Rear Delt Isolation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 83, name: 'Cable Face Pull', group: 'Shoulders', target: 'Rear Delts & Rotator Cuff Health', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 84, name: 'Dumbbell Upright Row', group: 'Shoulders', target: 'Lateral Delts & Upper Traps', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 85, name: 'Cable Upright Row', group: 'Shoulders', target: 'Side Delts & Trapezius', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 86, name: 'Smith Machine Upright Row', group: 'Shoulders', target: 'Traps & Side Delts', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },

    // ── TRAPS (87-91) ──
    { no: 87, name: 'Dumbbell Shrug', group: 'Back', target: 'Upper Trapezius', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 88, name: 'Smith Machine Shrug', group: 'Back', target: 'Upper Trapezius Heavy Overload', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Beginner' },
    { no: 89, name: 'Cable Shrug', group: 'Back', target: 'Upper Trapezius Constant Angle', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 90, name: 'Incline Dumbbell Shrug', group: 'Back', target: 'Mid & Upper Trapezius Retraction', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 91, name: 'Dumbbell Farmer Hold', group: 'Back', target: 'Traps & Grip Isometric Endurance', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },

    // ── BICEPS (92-109) ──
    { no: 92, name: 'Preacher Biceps Curl', group: 'Arms', target: 'Biceps Brachii (Short Head)', eqId: 'eq-preacher-curl', eqName: 'Preacher Biceps Curl Machine', diff: 'Beginner' },
    { no: 93, name: 'Single-Arm Preacher Dumbbell Curl', group: 'Arms', target: 'Unilateral Biceps Peak', eqId: 'eq-preacher-curl', eqName: 'Preacher Biceps Curl Machine', diff: 'Intermediate' },
    { no: 94, name: 'Dumbbell Biceps Curl', group: 'Arms', target: 'Biceps Brachii', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 95, name: 'Alternating Dumbbell Curl', group: 'Arms', target: 'Biceps Supination & Peak', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 96, name: 'Seated Dumbbell Curl', group: 'Arms', target: 'Biceps (Eliminating Body Sway)', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 97, name: 'Incline Dumbbell Curl', group: 'Arms', target: 'Biceps Long Head (Full Stretch)', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 98, name: 'Dumbbell Hammer Curl', group: 'Arms', target: 'Brachialis & Forearm Brachioradialis', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 99, name: 'Cross-Body Hammer Curl', group: 'Arms', target: 'Brachialis & Biceps Outer Peak', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 100, name: 'Concentration Curl', group: 'Arms', target: 'Biceps Peak Isolation', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 101, name: 'Zottman Curl', group: 'Arms', target: 'Biceps & Forearm Extensors', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 102, name: 'Cable Biceps Curl', group: 'Arms', target: 'Continuous Biceps Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 103, name: 'Single-Arm Cable Curl', group: 'Arms', target: 'Unilateral Biceps Isolation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 104, name: 'Cable Hammer Curl', group: 'Arms', target: 'Brachialis with Rope Cable', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 105, name: 'High Cable Biceps Curl', group: 'Arms', target: 'Front Double Bicep Pose Peak', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 106, name: 'Reverse Cable Curl', group: 'Arms', target: 'Brachioradialis & Forearms', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 107, name: 'Smith Machine Biceps Curl', group: 'Arms', target: 'Guided Biceps Overload', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 108, name: 'Fixed-Barbell Biceps Curl', group: 'Arms', target: 'Biceps Overall Mass', eqId: 'eq-barbell-rack', eqName: 'Fixed Barbell Storage Rack', diff: 'Beginner' },
    { no: 109, name: 'Fixed-Barbell Reverse Curl', group: 'Arms', target: 'Forearm & Outer Bicep Mass', eqId: 'eq-barbell-rack', eqName: 'Fixed Barbell Storage Rack', diff: 'Intermediate' },

    // ── TRICEPS (110-126) ──
    { no: 110, name: 'Cable Triceps Pushdown', group: 'Arms', target: 'Triceps Lateral & Medial Heads', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 111, name: 'Rope Triceps Pushdown', group: 'Arms', target: 'Triceps Lateral Head Flare', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 112, name: 'Straight-Bar Cable Pushdown', group: 'Arms', target: 'Triceps Power & Overload', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 113, name: 'Reverse-Grip Cable Pushdown', group: 'Arms', target: 'Triceps Medial Head', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 114, name: 'Single-Arm Cable Pushdown', group: 'Arms', target: 'Triceps Unilateral Squeeze', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 115, name: 'Cable Overhead Triceps Extension', group: 'Arms', target: 'Triceps Long Head Stretch', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 116, name: 'Single-Arm Overhead Cable Extension', group: 'Arms', target: 'Triceps Long Head Isolation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 117, name: 'Dumbbell Overhead Triceps Extension', group: 'Arms', target: 'Triceps Long Head', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 118, name: 'Single-Arm Dumbbell Overhead Extension', group: 'Arms', target: 'Unilateral Triceps Long Head', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 119, name: 'Lying Dumbbell Triceps Extension', group: 'Arms', target: 'Triceps Skull Crusher Motion', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 120, name: 'Dumbbell Triceps Kickback', group: 'Arms', target: 'Triceps Peak Contraction', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 121, name: 'Cable Triceps Kickback', group: 'Arms', target: 'Triceps Lateral Head', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 122, name: 'Smith Machine Close-Grip Bench Press', group: 'Arms', target: 'Triceps Heavy Overload', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 123, name: 'Close-Grip Olympic Bench Press', group: 'Arms', target: 'Triceps Pushing Power', eqId: 'eq-olympic-flat-bench', eqName: 'Olympic Flat Bench Press', diff: 'Intermediate' },
    { no: 124, name: 'Assisted Triceps Dip', group: 'Arms', target: 'Triceps & Front Deltoids', eqId: 'eq-assisted-chin-dip', eqName: 'Assisted Chin-up and Dip Machine', diff: 'Beginner' },
    { no: 125, name: 'Bodyweight Triceps Dip', group: 'Arms', target: 'Triceps Horseshoe Thickness', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Advanced' },
    { no: 126, name: 'Bench Dip', group: 'Arms', target: 'Triceps Isolation', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },

    // ── QUADRICEPS (127-154) ──
    { no: 127, name: '45-Degree Leg Press', group: 'Legs', target: 'Quadriceps & Gluteus Maximus', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Beginner' },
    { no: 128, name: 'Standard-Stance Leg Press', group: 'Legs', target: 'Overall Quad Sweep', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Beginner' },
    { no: 129, name: 'Narrow-Stance Leg Press', group: 'Legs', target: 'Outer Quad Sweep (Vastus Lateralis)', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Intermediate' },
    { no: 130, name: 'Wide-Stance Leg Press', group: 'Legs', target: 'Inner Quads & Adductors', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Beginner' },
    { no: 131, name: 'Low-Foot Leg Press', group: 'Legs', target: 'Direct Quad Isolation', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Intermediate' },
    { no: 132, name: 'Single-Leg Leg Press', group: 'Legs', target: 'Unilateral Quad Balance', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Intermediate' },
    { no: 133, name: 'Seated Leg Extension', group: 'Legs', target: 'Rectus Femoris & VMO Tear-Drop', eqId: 'eq-leg-extension-pin', eqName: 'Seated Leg Extension Machine', diff: 'Beginner' },
    { no: 134, name: 'Single-Leg Leg Extension', group: 'Legs', target: 'Unilateral Quad Isolation', eqId: 'eq-leg-extension-pin', eqName: 'Seated Leg Extension Machine', diff: 'Intermediate' },
    { no: 135, name: 'Smith Machine Back Squat', group: 'Legs', target: 'Quads & Glutes', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 136, name: 'Smith Machine Front Squat', group: 'Legs', target: 'Direct Quad Focus & Core', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 137, name: 'Smith Machine Narrow-Stance Squat', group: 'Legs', target: 'Outer Quad Sweep', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 138, name: 'Smith Machine Wide-Stance Squat', group: 'Legs', target: 'Inner Thighs & Glutes', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 139, name: 'Smith Machine Sumo Squat', group: 'Legs', target: 'Glutes & Adductors', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Beginner' },
    { no: 140, name: 'Dumbbell Goblet Squat', group: 'Legs', target: 'Quads & Core Balance', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 141, name: 'Dumbbell Squat', group: 'Legs', target: 'Legs & Grip Stability', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 142, name: 'Dumbbell Sumo Squat', group: 'Legs', target: 'Adductors & Glutes', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 143, name: 'Bodyweight Squat', group: 'Legs', target: 'Quad Endurance & Mobility', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 144, name: 'Bodyweight Sumo Squat', group: 'Legs', target: 'Inner Thighs & Hip Mobility', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 145, name: 'Dumbbell Split Squat', group: 'Legs', target: 'Quads & Glute Stability', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 146, name: 'Smith Machine Split Squat', group: 'Legs', target: 'Quadriceps Overload', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 147, name: 'Bulgarian Split Squat', group: 'Legs', target: 'Quad & Glute Hypertrophy', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Intermediate' },
    { no: 148, name: 'Dumbbell Bulgarian Split Squat', group: 'Legs', target: 'Unilateral Leg Mass', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Advanced' },
    { no: 149, name: 'Smith Machine Bulgarian Split Squat', group: 'Legs', target: 'Guided Bulgarian Quad Power', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Advanced' },
    { no: 150, name: 'Dumbbell Forward Lunge', group: 'Legs', target: 'Quadriceps Deceleration', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 151, name: 'Dumbbell Reverse Lunge', group: 'Legs', target: 'Knee-Friendly Quad & Glute Lunge', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 152, name: 'Dumbbell Walking Lunge', group: 'Legs', target: 'Dynamic Quad & Glute Endurance', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Intermediate' },
    { no: 153, name: 'Bodyweight Forward Lunge', group: 'Legs', target: 'Quad Control & Balance', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 154, name: 'Bodyweight Reverse Lunge', group: 'Legs', target: 'Leg Conditioning', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },

    // ── HAMSTRINGS (155-166) ──
    { no: 155, name: 'Prone Lying Leg Curl', group: 'Legs', target: 'Hamstrings (Biceps Femoris)', eqId: 'eq-prone-leg-curl', eqName: 'Prone Lying Leg Curl Machine', diff: 'Beginner' },
    { no: 156, name: 'Seated Leg Curl', group: 'Legs', target: 'Hamstrings (Peak Knee Flexion)', eqId: 'eq-leg-ext-curl-combo', eqName: 'Seated Leg Extension and Curl Combo', diff: 'Beginner' },
    { no: 157, name: 'Single-Leg Seated Curl', group: 'Legs', target: 'Unilateral Hamstring Balance', eqId: 'eq-leg-ext-curl-combo', eqName: 'Seated Leg Extension and Curl Combo', diff: 'Intermediate' },
    { no: 158, name: 'Single-Leg Prone Leg Curl', group: 'Legs', target: 'Unilateral Hamstring Isolation', eqId: 'eq-prone-leg-curl', eqName: 'Prone Lying Leg Curl Machine', diff: 'Intermediate' },
    { no: 159, name: 'Smith Machine Romanian Deadlift', group: 'Legs', target: 'Hamstring & Glute Stretch', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 160, name: 'Dumbbell Romanian Deadlift', group: 'Legs', target: 'Hamstring Flexibility & Mass', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 161, name: 'Dumbbell Stiff-Leg Deadlift', group: 'Legs', target: 'Hamstring Deep Eccentric', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 162, name: 'Smith Machine Stiff-Leg Deadlift', group: 'Legs', target: 'Hamstrings & Lower Back', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 163, name: 'Single-Leg Dumbbell Romanian Deadlift', group: 'Legs', target: 'Unilateral Hamstrings & Balance', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Advanced' },
    { no: 164, name: 'Cable Pull-Through', group: 'Legs', target: 'Hamstring & Hip Extension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 165, name: 'Cable Romanian Deadlift', group: 'Legs', target: 'Posterior Chain Continuous Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 166, name: 'Smith Machine Good Morning', group: 'Legs', target: 'Hamstrings & Spinal Erectors', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Advanced' },

    // ── GLUTES (167-183) ──
    { no: 167, name: 'Smith Machine Hip Thrust', group: 'Legs', target: 'Gluteus Maximus Peak Lockout', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 168, name: 'Dumbbell Hip Thrust', group: 'Legs', target: 'Glutes Hypertrophy', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 169, name: 'Bodyweight Hip Thrust', group: 'Legs', target: 'Glute Activation', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 170, name: 'Dumbbell Glute Bridge', group: 'Legs', target: 'Glutes on Floor', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 171, name: 'Bodyweight Glute Bridge', group: 'Legs', target: 'Glute Warm-Up', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 172, name: 'Cable Glute Kickback', group: 'Legs', target: 'Upper Glute Isolation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 173, name: 'Standing Cable Hip Extension', group: 'Legs', target: 'Gluteus Maximus', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 174, name: 'Cable Pull-Through (Glutes)', group: 'Legs', target: 'Glute Lockout Power', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 175, name: 'Smith Machine Sumo Squat (Glutes)', group: 'Legs', target: 'Glute Stretch & Adductors', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 176, name: 'Dumbbell Sumo Squat (Glutes)', group: 'Legs', target: 'Glute Hypertrophy', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 177, name: 'High-Foot Leg Press (Glutes)', group: 'Legs', target: 'Gluteus Maximus Sled Drive', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Intermediate' },
    { no: 178, name: 'Wide-Stance Leg Press (Glutes)', group: 'Legs', target: 'Glutes & Inner Thighs', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Beginner' },
    { no: 179, name: 'Single-Leg Leg Press (Glutes)', group: 'Legs', target: 'Glute Symmetry', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Intermediate' },
    { no: 180, name: 'Smith Machine Reverse Lunge (Glutes)', group: 'Legs', target: 'Glute Stretch Under Bar', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 181, name: 'Dumbbell Reverse Lunge (Glutes)', group: 'Legs', target: 'Glute Deep Stretch', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 182, name: 'Bulgarian Split Squat (Glutes)', group: 'Legs', target: 'Gluteus Medius & Maximus', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Advanced' },
    { no: 183, name: 'Dumbbell Romanian Deadlift (Glutes)', group: 'Legs', target: 'Glute Hinge Mechanics', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },

    // ── INNER & OUTER THIGH / HIP (184-188) ──
    { no: 184, name: 'Cable Hip Abduction', group: 'Legs', target: 'Gluteus Medius (Outer Hip)', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 185, name: 'Cable Hip Adduction', group: 'Legs', target: 'Adductors (Inner Thigh)', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 186, name: 'Standing Cable Hip Flexion', group: 'Legs', target: 'Hip Flexors & Psoas', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 187, name: 'Standing Cable Hip Extension', group: 'Legs', target: 'Gluteal Extension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 188, name: 'Cable Lateral Leg Raise', group: 'Legs', target: 'Hip Stabilizers & Abductors', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },

    // ── CALVES (189-197) ──
    { no: 189, name: 'Seated Calf Raise', group: 'Legs', target: 'Soleus (Deep Calf Width)', eqId: 'eq-seated-calf-raise', eqName: 'Seated Calf Raise Machine', diff: 'Beginner' },
    { no: 190, name: 'Single-Leg Seated Calf Raise', group: 'Legs', target: 'Soleus Unilateral', eqId: 'eq-seated-calf-raise', eqName: 'Seated Calf Raise Machine', diff: 'Intermediate' },
    { no: 191, name: 'Leg Press Calf Raise', group: 'Legs', target: 'Gastrocnemius (Diamond Calves)', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Beginner' },
    { no: 192, name: 'Single-Leg Leg Press Calf Raise', group: 'Legs', target: 'Gastrocnemius Unilateral', eqId: 'eq-leg-press-45', eqName: '45-Degree Leg Press Machine', diff: 'Intermediate' },
    { no: 193, name: 'Smith Machine Standing Calf Raise', group: 'Legs', target: 'Gastrocnemius Heavy Load', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 194, name: 'Dumbbell Standing Calf Raise', group: 'Legs', target: 'Calf Hypertrophy & Balance', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 195, name: 'Single-Leg Dumbbell Calf Raise', group: 'Legs', target: 'Ankle Stability & Calves', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 196, name: 'Bodyweight Standing Calf Raise', group: 'Legs', target: 'Calf Conditioning & Rehab', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 197, name: 'Single-Leg Bodyweight Calf Raise', group: 'Legs', target: 'Achilles & Calf Strength', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },

    // ── ABS & CORE (198-220) ──
    { no: 198, name: 'Abdominal Crunch Machine', group: 'Core', target: 'Rectus Abdominis Compression', eqId: 'eq-abdominal-crunch-machine', eqName: 'Abdominal Crunch Machine', diff: 'Beginner' },
    { no: 199, name: 'Cable Crunch', group: 'Core', target: 'Upper & Lower Abdominals', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 200, name: 'Kneeling Cable Crunch', group: 'Core', target: '6-Pack Core Isolation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 201, name: 'Standing Cable Crunch', group: 'Core', target: 'Abdominal Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 202, name: 'Vertical Knee Raise', group: 'Core', target: 'Lower Abdominals & Hip Flexors', eqId: 'eq-vertical-knee-raise', eqName: 'Vertical Knee Raise and Dip Station', diff: 'Beginner' },
    { no: 203, name: 'Vertical Leg Raise', group: 'Core', target: 'Lower Rectus Abdominis', eqId: 'eq-vertical-knee-raise', eqName: 'Vertical Knee Raise and Dip Station', diff: 'Advanced' },
    { no: 204, name: 'Hanging Knee Raise', group: 'Core', target: 'Lower Abs & Grip', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Intermediate' },
    { no: 205, name: 'Hanging Leg Raise', group: 'Core', target: 'Lower Abs (Hanging)', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Advanced' },
    { no: 206, name: "Captain's Chair Knee Raise", group: 'Core', target: 'Lower Abdominals', eqId: 'eq-vertical-knee-raise', eqName: 'Vertical Knee Raise and Dip Station', diff: 'Beginner' },
    { no: 207, name: "Captain's Chair Leg Raise", group: 'Core', target: 'Abdominal Strength', eqId: 'eq-vertical-knee-raise', eqName: 'Vertical Knee Raise and Dip Station', diff: 'Intermediate' },
    { no: 208, name: 'Bench Crunch', group: 'Core', target: 'Upper Rectus Abdominis', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 209, name: 'Reverse Crunch', group: 'Core', target: 'Lower Abs & Pelvic Tilt', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 210, name: 'Dumbbell Weighted Crunch', group: 'Core', target: 'Hypertrophic Abdominal Load', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 211, name: 'Dumbbell Russian Twist', group: 'Core', target: 'Obliques & Transverse Abdominis', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Intermediate' },
    { no: 212, name: 'Cable Wood Chop', group: 'Core', target: 'Rotational Core Power', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 213, name: 'High-to-Low Cable Wood Chop', group: 'Core', target: 'Obliques & Downward Slash', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 214, name: 'Low-to-High Cable Wood Chop', group: 'Core', target: 'Obliques & Upward Rotation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 215, name: 'Pallof Press', group: 'Core', target: 'Anti-Rotation Core Stability', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 216, name: 'Plank', group: 'Core', target: 'Total Core Isometric Endurance', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 217, name: 'Side Plank', group: 'Core', target: 'Lateral Obliques & Quadratus Lumborum', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 218, name: 'Mountain Climber', group: 'Core', target: 'Dynamic Core & Cardio', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 219, name: 'Dead Bug', group: 'Core', target: 'Deep Core Motor Control', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 220, name: 'Bird Dog', group: 'Core', target: 'Cross-Body Core & Lumbar Stability', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },

    // ── LOWER BACK (221-227) ──
    { no: 221, name: 'Roman Chair Hyperextension', group: 'Back', target: 'Erector Spinae & Glutes', eqId: 'eq-roman-chair', eqName: 'Roman Chair - Hyperextension Bench', diff: 'Beginner' },
    { no: 222, name: '45-Degree Hyperextension', group: 'Back', target: 'Lower Back & Spinal Health', eqId: 'eq-hyperextension-45', eqName: '45-Degree Hyperextension Bench', diff: 'Beginner' },
    { no: 223, name: 'Weighted Dumbbell Hyperextension', group: 'Back', target: 'Lower Back Hypertrophy', eqId: 'eq-hyperextension-45', eqName: '45-Degree Hyperextension Bench', diff: 'Intermediate' },
    { no: 224, name: 'Smith Machine Romanian Deadlift (Lower Back)', group: 'Back', target: 'Posterior Chain & Erector Stability', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Intermediate' },
    { no: 225, name: 'Dumbbell Romanian Deadlift (Lower Back)', group: 'Back', target: 'Spinal Erector Support', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 226, name: 'Smith Machine Good Morning (Lower Back)', group: 'Back', target: 'Lumbar Spine Strength', eqId: 'eq-smith-machine', eqName: 'Smith Machine', diff: 'Advanced' },
    { no: 227, name: 'Bird Dog (Lower Back)', group: 'Back', target: 'Multifidus & Lumbar Alignment', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },

    // ── FOREARMS AND GRIP (228-240) ──
    { no: 228, name: 'Dumbbell Wrist Curl', group: 'Arms', target: 'Forearm Flexors', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 229, name: 'Dumbbell Reverse Wrist Curl', group: 'Arms', target: 'Forearm Extensors', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 230, name: 'Fixed-Barbell Wrist Curl', group: 'Arms', target: 'Forearm Flexor Mass', eqId: 'eq-barbell-rack', eqName: 'Fixed Barbell Storage Rack', diff: 'Beginner' },
    { no: 231, name: 'Fixed-Barbell Reverse Wrist Curl', group: 'Arms', target: 'Forearm Extensors Mass', eqId: 'eq-barbell-rack', eqName: 'Fixed Barbell Storage Rack', diff: 'Beginner' },
    { no: 232, name: 'Cable Wrist Curl', group: 'Arms', target: 'Continuous Forearm Flexion', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 233, name: 'Cable Reverse Wrist Curl', group: 'Arms', target: 'Forearm Extensor Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 234, name: 'Dumbbell Hammer Curl (Grip)', group: 'Arms', target: 'Brachioradialis & Crushing Grip', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Beginner' },
    { no: 235, name: 'Reverse Cable Curl (Forearms)', group: 'Arms', target: 'Forearm Upper Mass', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 236, name: "Dumbbell Farmer's Walk", group: 'Arms', target: 'Grip, Traps & Core Stability', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Intermediate' },
    { no: 237, name: 'Dumbbell Farmer Hold (Grip)', group: 'Arms', target: 'Static Grip Endurance', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 238, name: 'Dumbbell Static Hold', group: 'Arms', target: 'Forearm Tendon Strength', eqId: 'eq-dumbbell-rack', eqName: 'Commercial Dumbbell Rack', diff: 'Intermediate' },
    { no: 239, name: 'Dead Hang', group: 'Arms', target: 'Spinal Decompression & Grip', eqId: 'eq-assisted-dip-pullup-frame', eqName: 'Assisted Dip and Pull-Up Frame', diff: 'Beginner' },
    { no: 240, name: 'Assisted Dead Hang', group: 'Arms', target: 'Grip & Shoulder Mobility', eqId: 'eq-assisted-chin-dip', eqName: 'Assisted Chin-up and Dip Machine', diff: 'Beginner' },

    // ── FUNCTIONAL TRAINER EXERCISES (241-266) ──
    { no: 241, name: 'Cable Squat', group: 'Legs', target: 'Quadriceps & Glutes', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 242, name: 'Cable Sumo Squat', group: 'Legs', target: 'Inner Thighs & Glutes', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 243, name: 'Cable Reverse Lunge', group: 'Legs', target: 'Quads, Glutes & Balance', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 244, name: 'Cable Lateral Lunge', group: 'Legs', target: 'Frontal Plane Leg Strength', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 245, name: 'Cable Split Squat', group: 'Legs', target: 'Unilateral Quad Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 246, name: 'Cable Romanian Deadlift (Functional)', group: 'Legs', target: 'Posterior Chain Smooth Tension', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 247, name: 'Cable Pull-Through (Functional)', group: 'Legs', target: 'Hip Extension Power', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 248, name: 'Cable Chest Press', group: 'Chest', target: 'Chest Pushing Strength', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 249, name: 'Single-Arm Cable Chest Press (Functional)', group: 'Chest', target: 'Pecs & Rotational Core', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 250, name: 'Cable Row', group: 'Back', target: 'Mid-Back & Lats', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 251, name: 'Single-Arm Cable Row (Functional)', group: 'Back', target: 'Unilateral Lat & Rhomboids', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 252, name: 'Cable Lat Pulldown', group: 'Back', target: 'Latissimus Dorsi', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 253, name: 'Straight-Arm Pulldown', group: 'Back', target: 'Lats & Teres Major', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 254, name: 'Cable Face Pull (Functional)', group: 'Shoulders', target: 'Rear Deltoids & Rotators', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 255, name: 'Cable Lateral Raise (Functional)', group: 'Shoulders', target: 'Side Deltoid Isolation', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 256, name: 'Cable Front Raise (Functional)', group: 'Shoulders', target: 'Anterior Deltoids', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 257, name: 'Cable Rear Delt Fly (Functional)', group: 'Shoulders', target: 'Posterior Deltoids', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 258, name: 'Cable Biceps Curl (Functional)', group: 'Arms', target: 'Biceps Brachii', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 259, name: 'Cable Hammer Curl (Functional)', group: 'Arms', target: 'Brachialis & Forearms', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 260, name: 'Cable Triceps Pushdown (Functional)', group: 'Arms', target: 'Triceps Horseshoe', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 261, name: 'Cable Overhead Triceps Extension (Functional)', group: 'Arms', target: 'Triceps Long Head', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 262, name: 'Cable Glute Kickback (Functional)', group: 'Legs', target: 'Gluteus Maximus', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 263, name: 'Cable Hip Abduction (Functional)', group: 'Legs', target: 'Outer Glutes & Hip Health', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 264, name: 'Cable Hip Adduction (Functional)', group: 'Legs', target: 'Inner Thighs', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },
    { no: 265, name: 'Cable Wood Chop (Functional)', group: 'Core', target: 'Rotational Core Power', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Intermediate' },
    { no: 266, name: 'Cable Pallof Press (Functional)', group: 'Core', target: 'Anti-Rotation Stability', eqId: 'eq-dual-adjustable-pulley', eqName: 'Dual Adjustable Pulley - Functional Trainer', diff: 'Beginner' },

    // ── BODYWEIGHT / OPEN FUNCTIONAL AREA (267-285) ──
    { no: 267, name: 'Push-Up (Functional)', group: 'Chest', target: 'Chest, Shoulders & Triceps', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 268, name: 'Wide Push-Up', group: 'Chest', target: 'Outer Pectorals', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 269, name: 'Narrow Push-Up', group: 'Chest', target: 'Triceps & Inner Chest', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Intermediate' },
    { no: 270, name: 'Diamond Push-Up', group: 'Chest', target: 'Triceps & Sternal Pecs', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Intermediate' },
    { no: 271, name: 'Incline Push-Up (Functional)', group: 'Chest', target: 'Lower Chest & Push Mechanics', eqId: 'eq-adjustable-bench', eqName: 'Adjustable Multi-Angle Weight Bench', diff: 'Beginner' },
    { no: 272, name: 'Bodyweight Squat (Functional)', group: 'Legs', target: 'Quad & Glute Mobility', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 273, name: 'Sumo Squat (Bodyweight)', group: 'Legs', target: 'Adductors & Hip Mobility', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 274, name: 'Forward Lunge (Bodyweight)', group: 'Legs', target: 'Quad Deceleration', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 275, name: 'Reverse Lunge (Bodyweight)', group: 'Legs', target: 'Glutes & Quads', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 276, name: 'Walking Lunge (Bodyweight)', group: 'Legs', target: 'Dynamic Leg Conditioning', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 277, name: 'Split Squat (Bodyweight)', group: 'Legs', target: 'Unilateral Balance', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 278, name: 'Glute Bridge (Bodyweight)', group: 'Legs', target: 'Gluteus Maximus Awakening', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 279, name: 'Calf Raise (Bodyweight)', group: 'Legs', target: 'Gastrocnemius Endurance', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 280, name: 'Plank (Bodyweight)', group: 'Core', target: 'Anterior Core Anti-Extension', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 281, name: 'Side Plank (Bodyweight)', group: 'Core', target: 'Lateral Core & Obliques', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 282, name: 'Mountain Climber (Bodyweight)', group: 'Core', target: 'Core & Cardiovascular Stamina', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 283, name: 'Bird Dog (Bodyweight)', group: 'Core', target: 'Contralateral Core Stabilization', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 284, name: 'Dead Bug (Bodyweight)', group: 'Core', target: 'Posterior Pelvic Tilt & Abs', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 285, name: 'Bear Crawl', group: 'Full Body', target: 'Full Body Functional Coordination', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Intermediate' },

    // ── TREADMILL (286-294) ──
    { no: 286, name: 'Normal Walking', group: 'Cardio', target: 'Aerobic Base & Calorie Burn', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Beginner' },
    { no: 287, name: 'Brisk Walking', group: 'Cardio', target: 'Cardiovascular Health & Fat Loss', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Beginner' },
    { no: 288, name: 'Incline Walking', group: 'Cardio', target: 'Glutes, Calves & Low-Impact Cardio', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Beginner' },
    { no: 289, name: 'Jogging', group: 'Cardio', target: 'Cardiorespiratory Endurance', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Intermediate' },
    { no: 290, name: 'Running', group: 'Cardio', target: 'VO2 Max & Aerobic Capacity', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Intermediate' },
    { no: 291, name: 'Incline Running', group: 'Cardio', target: 'Leg Power & High Calorie Burn', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Advanced' },
    { no: 292, name: 'Sprint Intervals', group: 'Cardio', target: 'Anaerobic Sprint Power', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Advanced' },
    { no: 293, name: 'Walk-Jog Intervals', group: 'Cardio', target: 'Pacing & Recovery Conditioning', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Beginner' },
    { no: 294, name: 'Treadmill HIIT', group: 'Cardio', target: 'High-Intensity Metabolic Conditioning', eqId: 'eq-motorized-treadmills', eqName: 'Commercial Motorized Treadmills', diff: 'Advanced' },

    // ── ELLIPTICAL (295-300) ──
    { no: 295, name: 'Forward Elliptical Training', group: 'Cardio', target: 'Low-Impact Cardio & Quads', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Beginner' },
    { no: 296, name: 'Reverse Elliptical Training', group: 'Cardio', target: 'Hamstrings & Glutes Focus', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Beginner' },
    { no: 297, name: 'Low-Resistance Elliptical Cardio', group: 'Cardio', target: 'Joint-Friendly Aerobic Rhythm', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Beginner' },
    { no: 298, name: 'High-Resistance Elliptical Cardio', group: 'Cardio', target: 'Lower Body Strength-Endurance', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Intermediate' },
    { no: 299, name: 'Elliptical Interval Training', group: 'Cardio', target: 'Fat Loss & Stamina', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Intermediate' },
    { no: 300, name: 'Elliptical HIIT', group: 'Cardio', target: 'Maximum Calorie Burn (Zero Joint Impact)', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Advanced' },

    // ── RECUMBENT BIKE (301-306) ──
    { no: 301, name: 'Steady Cycling', group: 'Cardio', target: 'Aerobic Conditioning & Leg Flush', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Beginner' },
    { no: 302, name: 'Low-Resistance Cycling', group: 'Cardio', target: 'Warm-Up & Knee Joint Lubrication', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Beginner' },
    { no: 303, name: 'High-Resistance Cycling', group: 'Cardio', target: 'Quadriceps Power & Stamina', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Intermediate' },
    { no: 304, name: 'Bike Interval Training', group: 'Cardio', target: 'Cardio Threshold & Watts', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Intermediate' },
    { no: 305, name: 'Recumbent Bike HIIT', group: 'Cardio', target: 'High-Speed Sprint Intervals', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Advanced' },
    { no: 306, name: 'Recovery Cycling', group: 'Cardio', target: 'Active Muscle Recovery & Lactic Acid Removal', eqId: 'eq-cardio-bikes-ellipticals', eqName: 'Cardio - Bikes and Ellipticals', diff: 'Beginner' },

    // ── INDOOR ROWING MACHINE (307-313) ──
    { no: 307, name: 'Standard Indoor Rowing', group: 'Cardio', target: 'Full Body Endurance (Legs, Back, Core)', eqId: 'eq-rowing-machine', eqName: 'Indoor Rowing Machine', diff: 'Intermediate' },
    { no: 308, name: 'Steady-State Rowing', group: 'Cardio', target: 'Aerobic Base & Split Consistency', eqId: 'eq-rowing-machine', eqName: 'Indoor Rowing Machine', diff: 'Beginner' },
    { no: 309, name: 'Rowing Sprint', group: 'Cardio', target: 'Maximum Wattage & Power Output', eqId: 'eq-rowing-machine', eqName: 'Indoor Rowing Machine', diff: 'Advanced' },
    { no: 310, name: 'Rowing Interval Training', group: 'Cardio', target: '500m Repeats & Recovery', eqId: 'eq-rowing-machine', eqName: 'Indoor Rowing Machine', diff: 'Intermediate' },
    { no: 311, name: 'Rowing HIIT', group: 'Cardio', target: 'High-Intensity Anaerobic Threshold', eqId: 'eq-rowing-machine', eqName: 'Indoor Rowing Machine', diff: 'Advanced' },
    { no: 312, name: 'Endurance Rowing', group: 'Cardio', target: '5000m+ Stamina Building', eqId: 'eq-rowing-machine', eqName: 'Indoor Rowing Machine', diff: 'Intermediate' },
    { no: 313, name: 'Recovery Rowing', group: 'Cardio', target: 'Cool Down & Heart Rate Normalization', eqId: 'eq-rowing-machine', eqName: 'Indoor Rowing Machine', diff: 'Beginner' },

    // ── STRETCHING / MOBILITY AREA (314-338) ──
    { no: 314, name: 'Standing Hamstring Stretch', group: 'Full Body', target: 'Posterior Thigh Flexibility', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 315, name: 'Seated Hamstring Stretch', group: 'Full Body', target: 'Hamstrings & Calves Extension', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 316, name: 'Quadriceps Stretch', group: 'Full Body', target: 'Anterior Thigh & Hip Flexor Length', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 317, name: 'Hip Flexor Stretch', group: 'Full Body', target: 'Iliopsoas & Pelvic Alignment', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 318, name: 'Glute Stretch', group: 'Full Body', target: 'Gluteus Medius & Piriformis Release', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 319, name: 'Figure-Four Stretch', group: 'Full Body', target: 'Deep Hip Rotator Decompression', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 320, name: 'Calf Stretch', group: 'Full Body', target: 'Gastrocnemius & Achilles Tendon Length', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 321, name: 'Adductor Stretch', group: 'Full Body', target: 'Inner Thighs & Groin Mobility', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 322, name: 'Butterfly Stretch', group: 'Full Body', target: 'Hips & Adductor Relaxation', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 323, name: 'Chest Stretch', group: 'Full Body', target: 'Pectoralis Major & Biceps Tendon Opening', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 324, name: 'Shoulder Stretch', group: 'Full Body', target: 'Deltoids & Joint Capsule', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 325, name: 'Cross-Body Shoulder Stretch', group: 'Full Body', target: 'Posterior Capsule & Infraspinatus', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 326, name: 'Triceps Stretch', group: 'Full Body', target: 'Triceps Long Head & Lats', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 327, name: 'Lat Stretch', group: 'Full Body', target: 'Latissimus Dorsi & Side Flank', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 328, name: 'Upper-Back Stretch', group: 'Full Body', target: 'Rhomboids & Trapezius Space', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 329, name: 'Lower-Back Stretch', group: 'Full Body', target: 'Lumbar Spine Decompression', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 330, name: 'Cat-Cow', group: 'Full Body', target: 'Spinal Articulation & Segmental Flow', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 331, name: "Child's Pose", group: 'Full Body', target: 'Total Spine, Lat & Hip Relaxation', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 332, name: 'Cobra Stretch', group: 'Full Body', target: 'Abdominal Wall & Anterior Spine Extension', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 333, name: 'Thoracic Rotation', group: 'Full Body', target: 'Mid-Spine Rotational Freedom', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 334, name: 'Hip Rotation', group: 'Full Body', target: 'Acetabulofemoral Joint Lubrication', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 335, name: 'Ankle Mobility Drill', group: 'Full Body', target: 'Dorsiflexion & Squat Depth Preparation', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 336, name: 'Shoulder Mobility Drill', group: 'Full Body', target: 'Glenohumeral Joint Full Range', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 337, name: 'Arm Circles', group: 'Full Body', target: 'Rotator Cuff Warm-Up & Blood Flow', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' },
    { no: 338, name: 'Leg Swings', group: 'Full Body', target: 'Dynamic Hip & Hamstring Warm-Up', eqId: 'eq-open-functional-turf', eqName: 'Open Functional and Stretching Area', diff: 'Beginner' }
  ];

  return data.map((item) => ({
    id: `ex-${item.no}`,
    exerciseNumber: item.no,
    name: item.name,
    muscleGroup: item.group,
    targetMuscle: item.target,
    equipmentId: item.eqId,
    equipmentName: item.eqName,
    difficulty: item.diff,
    tempo: item.group === 'Cardio' || item.group === 'Full Body' ? 'Steady Pace / 20-30s Hold' : '1s Contraction · 1s Squeeze · 3s Eccentric',
    setup: `Setup station at ${item.eqName}. Ensure correct posture, grip, and range of motion before initiating movement.`,
    execution: `1. Initiate movement by contracting ${item.target}.\n2. Move smoothly through the full range of motion.\n3. Hold peak contraction for 1 second.\n4. Return with controlled eccentric resistance.`,
    cues: `Focus on mind-muscle connection with your ${item.target}. Keep movement smooth without momentum.`,
    mistakes: `Using excessive momentum, rounding back, or cutting the range of motion short.`,
    videoUrl: ''
  }));
};

async function main() {
  console.log('Generating exercise catalog...');
  const exercises = buildExercises();
  console.log(`Generated ${exercises.length} exercises.`);

  // 1. Write to app/src/constants/gymExercisesCatalog.js
  const catalogPath = path.join(__dirname, '../src/constants/gymExercisesCatalog.js');
  const catalogContent = `// Auto-generated Gym Exercises Catalog for K7 Fitness
// All 338 exercises mapped and tagged to our 39 machines & equipment

export const GYM_EXERCISES_CATALOG = ${JSON.stringify(exercises, null, 2)};
`;
  fs.writeFileSync(catalogPath, catalogContent, 'utf8');
  console.log(`Saved catalog to ${catalogPath}`);

  // 2. Push 39 Gym Machines to Firestore
  console.log('\n--- Pushing 39 Machines to Firestore ---');
  let eqCount = 0;
  for (const eq of GYM_EQUIPMENT_CATALOG) {
    const docRef = doc(db, 'equipment', eq.id);
    await setDoc(docRef, {
      ...eq,
      updatedAt: new Date()
    }, { merge: true });
    eqCount++;
  }
  console.log(`Pushed ${eqCount} machines to 'equipment' collection.`);

  // 3. Push 338 Exercises to Firestore in Batches (max 500 per batch)
  console.log('\n--- Pushing 338 Exercises to Firestore in Batches ---');
  const batchSize = 100;
  for (let i = 0; i < exercises.length; i += batchSize) {
    const chunk = exercises.slice(i, i + batchSize);
    const batch = writeBatch(db);
    for (const ex of chunk) {
      const docRef = doc(db, 'exercises', ex.id);
      batch.set(docRef, {
        ...ex,
        updatedAt: new Date()
      }, { merge: true });
    }
    await batch.commit();
    console.log(`Committed exercises ${i + 1} to ${Math.min(i + batchSize, exercises.length)}...`);
  }

  console.log('\nSUCCESS! All 39 machines and all 338 exercises are now live in Firestore!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Push failed:', err);
  process.exit(1);
});
