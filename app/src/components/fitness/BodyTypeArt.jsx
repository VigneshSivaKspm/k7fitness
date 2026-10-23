/**
 * High-quality vector art silhouettes for Male and Female body types:
 * - Ectomorph (Slim/Lean)
 * - Mesomorph (Athletic/Muscular)
 * - Endomorph (Solid/Stocky/Curvy)
 */

export function BodyTypeSvg({ gender = 'male', type = 'mesomorph', className = 'h-36 w-auto' }) {
  const isFemale = gender === 'female';

  if (!isFemale) {
    // ── MALE SILHOUETTES ───────────────────────────────────────────────────
    if (type === 'ectomorph') {
      return (
        <svg viewBox="0 0 100 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <circle cx="50" cy="20" r="11" fill="currentColor" opacity="0.9" />
          {/* Neck */}
          <rect x="47.5" y="31" width="5" height="7" rx="2.5" fill="currentColor" opacity="0.85" />
          {/* Torso - Slim & Lean */}
          <path
            d="M34 40 C34 38 66 38 66 40 L62 82 C62 84 38 84 38 82 Z"
            fill="currentColor"
            opacity="0.8"
          />
          {/* Narrow Shoulders & Slim Arms */}
          <path d="M34 40 L24 84 L28 85 L37 45 Z" fill="currentColor" opacity="0.75" />
          <path d="M66 40 L76 84 L72 85 L63 45 Z" fill="currentColor" opacity="0.75" />
          {/* Slim Legs */}
          <path d="M39 82 L38 148 L46 148 L48 83 Z" fill="currentColor" opacity="0.85" />
          <path d="M61 82 L62 148 L54 148 L52 83 Z" fill="currentColor" opacity="0.85" />
          {/* Subtle Tone Line */}
          <line x1="50" y1="42" x2="50" y2="78" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
        </svg>
      );
    }

    if (type === 'mesomorph') {
      return (
        <svg viewBox="0 0 100 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <circle cx="50" cy="19" r="11.5" fill="currentColor" opacity="0.95" />
          {/* Strong Neck & Traps */}
          <path d="M44 31 L56 31 L58 37 L42 37 Z" fill="currentColor" opacity="0.9" />
          {/* Torso - Broad V-Taper Shoulders, Narrow Waist */}
          <path
            d="M26 38 C32 36 68 36 74 38 L60 82 C59 84 41 84 40 82 Z"
            fill="currentColor"
            opacity="0.85"
          />
          {/* Muscular Arms & Delts */}
          <path d="M26 38 C21 48 19 62 21 82 L26 82 C28 66 30 52 34 42 Z" fill="currentColor" opacity="0.8" />
          <path d="M74 38 C79 48 81 62 79 82 L74 82 C72 66 70 52 66 42 Z" fill="currentColor" opacity="0.8" />
          {/* Athletic Legs */}
          <path d="M41 82 C37 100 36 122 36 148 L46 148 C47 125 48 104 49 83 Z" fill="currentColor" opacity="0.9" />
          <path d="M59 82 C63 100 64 122 64 148 L54 148 C53 125 52 104 51 83 Z" fill="currentColor" opacity="0.9" />
          {/* V-Taper Chest Highlight */}
          <path d="M36 50 Q50 60 64 50" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" fill="none" />
          <line x1="50" y1="46" x2="50" y2="76" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
        </svg>
      );
    }

    // Male Endomorph
    return (
      <svg viewBox="0 0 100 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="currentColor" opacity="0.95" />
        {/* Thick Neck */}
        <rect x="44" y="32" width="12" height="7" rx="2" fill="currentColor" opacity="0.9" />
        {/* Torso - Wide, Solid, Robust */}
        <path
          d="M24 38 C32 37 68 37 76 38 C78 58 76 76 68 85 C62 86 38 86 32 85 C24 76 22 58 24 38 Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Thick Solid Arms */}
        <path d="M24 38 C18 52 16 70 18 84 L24 84 C26 70 28 54 31 42 Z" fill="currentColor" opacity="0.8" />
        <path d="M76 38 C82 52 84 70 82 84 L76 84 C74 70 72 54 69 42 Z" fill="currentColor" opacity="0.8" />
        {/* Heavy Solid Legs */}
        <path d="M33 85 C31 106 31 128 32 148 L46 148 C47 128 48 108 49 85 Z" fill="currentColor" opacity="0.9" />
        <path d="M67 85 C69 106 69 128 68 148 L54 148 C53 128 52 108 51 85 Z" fill="currentColor" opacity="0.9" />
        {/* Power Core Silhouette */}
        <path d="M36 58 Q50 68 64 58" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" fill="none" />
      </svg>
    );
  }

  // ── FEMALE SILHOUETTES ───────────────────────────────────────────────────
  if (type === 'ectomorph') {
    return (
      <svg viewBox="0 0 100 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="19" r="10.5" fill="currentColor" opacity="0.9" />
        {/* Slender Neck */}
        <rect x="48" y="29.5" width="4" height="8" rx="2" fill="currentColor" opacity="0.85" />
        {/* Slender Torso */}
        <path
          d="M36 38 C40 37 60 37 64 38 L58 60 L62 82 C58 84 42 84 38 82 L42 60 Z"
          fill="currentColor"
          opacity="0.8"
        />
        {/* Slender Arms */}
        <path d="M36 38 L27 82 L30 83 L39 42 Z" fill="currentColor" opacity="0.75" />
        <path d="M64 38 L73 82 L70 83 L61 42 Z" fill="currentColor" opacity="0.75" />
        {/* Long Slender Legs */}
        <path d="M40 82 L40 148 L47 148 L49 83 Z" fill="currentColor" opacity="0.85" />
        <path d="M60 82 L60 148 L53 148 L51 83 Z" fill="currentColor" opacity="0.85" />
      </svg>
    );
  }

  if (type === 'mesomorph') {
    return (
      <svg viewBox="0 0 100 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="19" r="10.5" fill="currentColor" opacity="0.95" />
        {/* Toned Neck */}
        <rect x="47.5" y="29.5" width="5" height="8" rx="2" fill="currentColor" opacity="0.9" />
        {/* Toned Hourglass Torso */}
        <path
          d="M33 38 C40 37 60 37 67 38 L57 60 C58 65 67 76 66 83 C60 85 40 85 34 83 C33 76 42 65 43 60 Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Toned Arms */}
        <path d="M33 38 C28 50 26 65 27 82 L31 82 C32 68 34 54 37 42 Z" fill="currentColor" opacity="0.8" />
        <path d="M67 38 C72 50 74 65 73 82 L69 82 C68 68 66 54 63 42 Z" fill="currentColor" opacity="0.8" />
        {/* Athletic Toned Legs */}
        <path d="M38 83 C34 102 36 126 38 148 L46 148 C47 126 48 104 49 84 Z" fill="currentColor" opacity="0.9" />
        <path d="M62 83 C66 102 64 126 62 148 L54 148 C53 126 52 104 51 84 Z" fill="currentColor" opacity="0.9" />
        {/* Athletic Waistline */}
        <path d="M43 60 Q50 64 57 60" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
      </svg>
    );
  }

  // Female Endomorph (Curvy & Full)
  return (
    <svg viewBox="0 0 100 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="50" cy="19.5" r="11" fill="currentColor" opacity="0.95" />
      {/* Neck */}
      <rect x="47" y="30" width="6" height="8" rx="2.5" fill="currentColor" opacity="0.9" />
      {/* Curvy Full Silhouette Torso */}
      <path
        d="M32 38 C40 37 60 37 68 38 L60 59 C62 66 73 78 71 85 C64 87 36 87 29 85 C27 78 38 66 40 59 Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Fuller Arms */}
      <path d="M32 38 C26 52 24 68 25 83 L30 83 C32 70 34 54 37 42 Z" fill="currentColor" opacity="0.8" />
      <path d="M68 38 C74 52 76 68 75 83 L70 83 C68 70 66 54 63 42 Z" fill="currentColor" opacity="0.8" />
      {/* Curvy Legs */}
      <path d="M34 85 C31 106 33 128 35 148 L46 148 C47 127 48 107 49 86 Z" fill="currentColor" opacity="0.9" />
      <path d="M66 85 C69 106 67 128 65 148 L54 148 C53 127 52 107 51 86 Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
