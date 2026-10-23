const fs = require('fs');
const path = require('path');

// Master Generator for Tamil Nadu Available 6-Day (Monday-to-Saturday) Food Charts
// 100% locally available, culturally authentic, budget-friendly, and scientifically macro-balanced
// Covers: Fat Loss, Weight Gain / Mass, Pure Veg High Protein, Recomp, Student Budget, and Women's Toning

const DIET_TEMPLATES = [
  // -------------------------------------------------------------------------
  // 1. TAMIL NADU 6-DAY FAT LOSS & CALORIE DEFICIT (1550 KCAL · 125g PROTEIN)
  // -------------------------------------------------------------------------
  {
    id: 'dt-tn-fat-loss-6d',
    name: 'Tamil Nadu 6-Day Fat Loss & Calorie Deficit Food Chart',
    goal: 'Weight loss',
    description: 'A master coach-engineered 1550 kcal Tamil Nadu cutting food chart covering Monday to Saturday (Sunday flexible maintenance). Uses 100% locally available foods: Steamed Idli, Ragi Dosa, Boiled Egg Whites, Pepper Chicken Breast Sukka, Vanjaram/Sankara Meen, Kollu Rasam, Murungai Keerai, and Neer Mor. Accelerates visceral fat loss while preserving lean muscle mass.',
    calories: 1550,
    protein: 125,
    carbs: 140,
    fat: 42,
    mealCount: 6,
    meals: [
      {
        id: 'm-tn-fl-mon',
        slot: 'Monday · Metabolism Kickstart & Fat Oxidation',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-fl-mon-1',
            food: 'Early Morning (6:30 AM): Warm Jeera & Methi Water (சீரகம் வெந்தயத் தண்ணீர்)',
            quantity: '1 large glass (300ml) with 1/2 tsp crushed cumin & soaked fenugreek',
            notes: 'Reduces morning water retention, stimulates digestive agni, and stabilizes blood sugar.',
            alternatives: 'Warm water with freshly squeezed half lemon (எலுமிச்சை தண்ணீர்)',
          },
          {
            id: 'it-tn-fl-mon-2',
            food: 'Breakfast (8:00 AM): 3 Soft Steamed Idlis + 4 Boiled Egg Whites + Drumstick & Tomato Sambar (முருங்கைக்காய் சாம்பார்)',
            quantity: '3 idlis + 4 egg whites (discard yolks) + 1 cup toor dal sambar (no coconut)',
            notes: 'Zero oil steamed carbohydrates with clean bioavailable egg protein to suppress hunger hormones.',
            alternatives: 'Vegetarian: Swap 4 egg whites for 1 cup boiled Green Gram (Pasi Payiru) Sundal.',
          },
          {
            id: 'it-tn-fl-mon-3',
            food: 'Mid-Morning (11:00 AM): Fresh Tender Coconut Water (இளநீர்) + Tender Pulp',
            quantity: '1 whole tender coconut (~250ml water)',
            notes: 'Natural isotonic electrolyte rich in potassium to prevent gym cramping in Tamil Nadu weather.',
            alternatives: '1 glass chilled Neer Mor (மோர்) with curry leaves, ginger, and hing.',
          },
          {
            id: 'it-tn-fl-mon-4',
            food: 'Lunch (1:30 PM): 1 Cup Ponni Boiled Rice (புழுங்கல் அரிசி) + 150g Chicken Breast Pepper Sukka (சிக்கன் மிளகு வறுவல்) + Murungai Keerai Poriyal (முருங்கைக்கீரை பொரியல்) + Garlic Pepper Rasam',
            quantity: '1 cup rice (150g cooked) + 150g skinless chicken breast + 1 cup greens + 1 cup rasam',
            notes: 'Country-style pepper sukka made with minimal gingelly/coconut oil. High in iron, zinc, and lean protein.',
            alternatives: 'Vegetarian: 150g Soya Chunks (Meal Maker) Curry with small onions and tomatoes.',
          },
          {
            id: 'it-tn-fl-mon-5',
            food: 'Pre/Post-Workout Snack (5:00 PM): Black Filter Coffee (no sugar) + 1 Cup Karuppu Konda Kadalai Sundal (கருப்பு கொண்டைக்கடலை சுண்டல்)',
            quantity: '1 cup black coffee + 80g boiled black chickpeas with mustard & curry leaves',
            notes: 'Caffeine boosts workout fat mobilization. Black chana delivers slow-digesting complex carbs and 10g protein.',
            alternatives: 'Roasted peanuts (வறுத்த நிலக்கடலை - 30g) + Green tea.',
          },
          {
            id: 'it-tn-fl-mon-6',
            food: 'Dinner (8:00 PM): 2 Oil-Free Whole Wheat Phulkas (சப்பாத்தி) + Egg Podimas (2 egg whites + 1 whole egg scrambled with onions) + Vazhaithandu Poriyal (வாழைத்தண்டு பொரியல்)',
            quantity: '2 phulkas + 3-egg podimas + 1 cup banana stem poriyal',
            notes: 'Banana stem flushes excess sodium and fluid retention; egg podimas provides overnight amino acid repair.',
            alternatives: 'Vegetarian: 100g Aavin Fresh Paneer Bhurji with tomatoes and green chillies.',
          },
        ],
      },
      {
        id: 'm-tn-fl-tue',
        slot: 'Tuesday · Kollu Fat Burn & High-Fiber Shred',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-fl-tue-1',
            food: 'Early Morning (6:30 AM): Warm Kollu Water (கொள்ளு வேகவைத்த தண்ணீர் - Horse Gram Broth)',
            quantity: '1 cup (250ml) warm horse gram extract with a pinch of sea salt & pepper',
            notes: 'Traditional Tamil fat burner ("கொழுத்தவனுக்குக் கொள்ளு"). Thermogenic booster that mobilizes stubborn fat.',
            alternatives: 'Warm lemon ginger water.',
          },
          {
            id: 'it-tn-fl-tue-2',
            food: 'Breakfast (8:00 AM): 2 Crispy Ragi Dosas (கேழ்வரகு தோசை) + 3 Boiled Egg Whites + Tomato Onion Thokku (no excess oil)',
            quantity: '2 medium ragi dosas + 3 egg whites + 2 tbsp tomato chutney',
            notes: 'Finger millet (Ragi) is rich in calcium and low-glycemic fiber for prolonged satiety.',
            alternatives: 'Vegetarian: 2 Ragi dosas + 1 cup Sprouted Moong Dal (முளைகட்டிய பாசிப்பயறு).',
          },
          {
            id: 'it-tn-fl-tue-3',
            food: 'Mid-Morning (11:00 AM): 1 Nattu Koyyappazham (நாட்டு கொய்யாப்பழம் - Country Guava)',
            quantity: '1 medium ripe guava (sliced with chilli powder & salt)',
            notes: 'Low calorie, packed with 4x vitamin C of oranges and 5g dietary fiber.',
            alternatives: '1 slice fresh Papaya (பப்பாளி).',
          },
          {
            id: 'it-tn-fl-tue-4',
            food: 'Lunch (1:30 PM): 1 Cup Thinai / Foxtail Millet Rice (தினை சாதம்) + 150g Vanjaram / Sankara Meen Tawa Fry (மீன் வறுவல்) + Beans Carrot Poriyal + Kollu Rasam (கொள்ளு ரசம்)',
            quantity: '1 cup cooked thinai + 150g fish tawa pan-fried with turmeric & chilli + 1 cup veggies + 1 cup rasam',
            notes: 'Seer fish is lean, rich in Omega-3 fatty acids. Kollu rasam accelerates metabolic rate.',
            alternatives: 'Vegetarian: 150g Aavin Paneer Tawa Fry + 1 cup Thick Toor Dal Kootu.',
          },
          {
            id: 'it-tn-fl-tue-5',
            food: 'Pre/Post-Workout (5:00 PM): Sukku Malli Tea (சுக்கு மல்லி காபி - no milk, dash of jaggery/zero sugar) + 1 Small Boiled Sweet Potato (சர்க்கரைவள்ளி கிழங்கு)',
            quantity: '1 cup dry ginger coriander tea + 100g boiled sweet potato',
            notes: 'Dry ginger aids digestion; sweet potato provides clean glycogen fuel for the evening gym workout.',
            alternatives: '1 Poovan banana + black coffee.',
          },
          {
            id: 'it-tn-fl-tue-6',
            food: 'Dinner (8:00 PM): 2 Kal Dosas (கல் தோசை) + 1 Bowl Pepper Chicken Gravy (குழம்பு - oil skimmed off) + Cucumber Slices',
            quantity: '2 small spongy kal dosas + 120g shredded chicken in pepper gravy + cucumber',
            notes: 'Light fermented kal dosa is easy on the gut at bedtime with zero bloating.',
            alternatives: 'Vegetarian: 2 Kal dosas + 1 cup Soya Chunks Kurma (மீல் மேக்கர் குருமா).',
          },
        ],
      },
      {
        id: 'm-tn-fl-wed',
        slot: 'Wednesday · Clean Detox & Lean Protein Surge',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-fl-wed-1',
            food: 'Early Morning (6:30 AM): Poosanaikkai Juice (வெண்பூசணி சாறு - Ash Gourd Juice)',
            quantity: '1 glass (250ml) fresh ash gourd juice with a pinch of pepper & pink salt',
            notes: 'Ultimate alkaline body cooler and systemic detox drink used in Tamil naturopathy.',
            alternatives: 'Warm water with tulsi leaves (துளசி தண்ணீர்).',
          },
          {
            id: 'it-tn-fl-wed-2',
            food: 'Breakfast (8:00 AM): Godhumai Rava Upma (கோதுமை ரவை உப்புமா with carrots, beans & peas) + 4 Boiled Egg Whites',
            quantity: '1 medium plate (150g cooked upma) + 4 egg whites',
            notes: 'Broken wheat delivers sustained energy release without insulin spikes.',
            alternatives: 'Vegetarian: Add 50g boiled peanuts and 50g paneer cubes directly into upma.',
          },
          {
            id: 'it-tn-fl-wed-3',
            food: 'Mid-Morning (11:00 AM): Chilled Neer Mor (மோர் with curry leaves, ginger & perungayam)',
            quantity: '1 large glass (300ml) churned low-fat buttermilk',
            notes: 'Natural probiotics, calcium, and instant relief from Tamil Nadu daytime heat.',
            alternatives: 'Tender coconut water.',
          },
          {
            id: 'it-tn-fl-wed-4',
            food: 'Lunch (1:30 PM): 1 Cup Ponni Rice + 150g Chicken Chops / Country Chicken Curry + Vendakkai Poriyal (வெண்டைக்காய் பொரியல்) + Poondu Rasam (பூண்டு ரசம்)',
            quantity: '1 cup rice + 150g chicken breast pieces + 1 cup ladies finger poriyal + 1 cup garlic rasam',
            notes: 'Garlic rasam aids gastric breakdown of proteins; ladies finger provides soluble fiber.',
            alternatives: 'Vegetarian: 1 cup Pachai Payiru (Green gram) Kootu + 100g Grilled Paneer.',
          },
          {
            id: 'it-tn-fl-wed-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Pasi Payiru Sundal (பச்சைப்பயறு சுண்டல்) + Black Tea / Coffee',
            quantity: '1 cup boiled green gram tempered with mustard & green chillies + black tea',
            notes: 'Green gram has highest digestibility among all legumes with virtually zero fat.',
            alternatives: 'Kaara Pori with roasted gram (பொட்டுக்கடலை பொரி - 1 bowl).',
          },
          {
            id: 'it-tn-fl-wed-6',
            food: 'Dinner (8:00 PM): 3 Soft Idlis + Meen Kuzhambu (மீன் குழம்பு - 1 piece Seer/Sankara fish) + Keerai Masiyal (கீரை மசியல்)',
            quantity: '3 idlis + 120g fish in tamarind gravy (no coconut paste) + 1 cup greens masiyal',
            notes: 'Tamarind and tomato-based fish curry is exceptionally low in calories and rich in trace minerals.',
            alternatives: 'Vegetarian: 3 Idlis + 1 bowl Soya Chunks Curry + Keerai masiyal.',
          },
        ],
      },
      {
        id: 'm-tn-fl-thu',
        slot: 'Thursday · High-Protein Thermogenic Burn',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-fl-thu-1',
            food: 'Early Morning (6:30 AM): Murungai Keerai Clear Soup (முருங்கைக்கீரை சூப்)',
            quantity: '1 bowl (200ml) fresh drumstick leaves broth with shallots, cumin & black pepper',
            notes: 'Iron, potassium, and magnesium powerhouse. Naturally energizes red blood cells.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-fl-thu-2',
            food: 'Breakfast (8:00 AM): Sigappu Aval Upma (சிகப்பு அவல் உப்புமா - Red Poha with peanuts) + 3 Boiled Egg Whites',
            quantity: '1 plate red poha (150g cooked) + 3 egg whites',
            notes: 'Red beaten rice contains anthocyanin antioxidants and complex fiber.',
            alternatives: 'Vegetarian: Red poha with 50g roasted peanuts and 50g paneer.',
          },
          {
            id: 'it-tn-fl-thu-3',
            food: 'Mid-Morning (11:00 AM): 1 Cup Nattu Mathulai (நாட்டு மாதுளை - Pomegranate Seeds)',
            quantity: '1 cup fresh pomegranate pearls',
            notes: 'Rich in polyphenols that improve nitric oxide production for vascular muscle pumps.',
            alternatives: '1 Country Guava.',
          },
          {
            id: 'it-tn-fl-thu-4',
            food: 'Lunch (1:30 PM): 1 Cup Kuthiraivali / Barnyard Millet Rice (குதிரைவாலி சாதம்) + 150g Nethili Meen Fry / Kuzhambu (நெத்திலி மீன்) + Kovaikkai Poriyal (கோவக்காய்) + Curd',
            quantity: '1 cup millet rice + 150g anchovies + 1 cup ivy gourd poriyal + 1/2 cup fresh Aavin curd',
            notes: 'Anchovies (Nethili) are consumed whole with edible soft bones, giving massive natural calcium.',
            alternatives: 'Vegetarian: 1 cup Soya chunks dry fry + 1 cup Toor dal + curd.',
          },
          {
            id: 'it-tn-fl-thu-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Poovan Banana (பூவன் பழம்) + Filter Coffee Decoction with Hot Water (Black)',
            quantity: '1 banana + 1 cup black coffee',
            notes: 'Fast-acting natural fructose gives quick muscle contraction power for intense gym sessions.',
            alternatives: 'Handful of roasted peanuts (30g).',
          },
          {
            id: 'it-tn-fl-thu-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Chapatis + 150g Pepper Chicken Breast Sukka + Cucumber & Onion Raitha (தயிர் பச்சடி)',
            quantity: '2 chapatis + 150g chicken + 1 cup raitha',
            notes: 'High protein dinner keeps overnight muscle protein synthesis active while body burns fat.',
            alternatives: 'Vegetarian: 2 Chapatis + 150g Paneer & Capsicum Masala + Raitha.',
          },
        ],
      },
      {
        id: 'm-tn-fl-fri',
        slot: 'Friday · Muscle Striation & Fluid Flush',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-fl-fri-1',
            food: 'Early Morning (6:30 AM): Warm Lemon & Cinnamon Water',
            quantity: '1 glass warm water + 1/2 lemon + pinch of true Ceylon cinnamon powder',
            notes: 'Improves glucose tolerance and primes metabolism before morning movement.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-fl-fri-2',
            food: 'Breakfast (8:00 AM): 3 Steamed Idlis + 2 Egg Omelette (1 whole egg + 1 white whisked with small onions & curry leaves) + Mint Coriander Chutney (புதினா கொத்தமல்லி சட்னி)',
            quantity: '3 idlis + 2-egg fluffy omelette + 2 tbsp green chutney',
            notes: 'Mint and coriander stimulate bile secretion and calm stomach lining.',
            alternatives: 'Vegetarian: 3 Idlis + 1 bowl Vellai Konda Kadalai Sundal (வெள்ளை கொண்டைக்கடலை).',
          },
          {
            id: 'it-tn-fl-fri-3',
            food: 'Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)',
            quantity: '1 whole coconut',
            notes: 'Restores intra-cellular hydration and gives natural electrolytes.',
            alternatives: 'Neer Mor with curry leaves & crushed ginger.',
          },
          {
            id: 'it-tn-fl-fri-4',
            food: 'Lunch (1:30 PM): 1 Cup Samai / Little Millet Rice (சாமை சாதம்) + 150g Grilled Chicken Breast + Vazhaithandu Kootu (வாழைத்தண்டு கூட்டு) + Milagu Rasam',
            quantity: '1 cup cooked samai + 150g chicken + 1 cup banana stem kootu + 1 cup pepper rasam',
            notes: 'Banana stem and black pepper actively shed subcutaneous water weight to reveal muscle cuts.',
            alternatives: 'Vegetarian: 150g Tawa Paneer + 1 cup Yellow Moong Dal + Vazhaithandu kootu.',
          },
          {
            id: 'it-tn-fl-fri-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Boiled Peanuts (வேகவைத்த நிலக்கடலை) + Green Tea / Black Coffee',
            quantity: '50g boiled groundnuts in shell + green tea',
            notes: 'Healthy monounsaturated fats and arginine to sustain heart pump and stamina.',
            alternatives: '1 cup roasted chana (பொட்டுக்கடலை).',
          },
          {
            id: 'it-tn-fl-fri-6',
            food: 'Dinner (8:00 PM): 2 Ragi Dosas + Muttai Thokku (2 Boiled Eggs in thick onion-tomato gravy) + Fresh Cucumber Salad',
            quantity: '2 ragi dosas + 2 eggs in gravy + sliced cucumber',
            notes: 'High calcium and complete amino acid profile for muscle rebuilding during sleep.',
            alternatives: 'Vegetarian: 2 Ragi dosas + 1 cup Soya chunks thokku + cucumber.',
          },
        ],
      },
      {
        id: 'm-tn-fl-sat',
        slot: 'Saturday · Weekend Glycogen Depletion & Clean Finish',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-fl-sat-1',
            food: 'Early Morning (6:30 AM): Warm Methi Water (வெந்தயத் தண்ணீர்)',
            quantity: '1 glass warm water with overnight soaked fenugreek seeds',
            notes: 'Lowers insulin resistance and cleans the gastrointestinal tract.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-fl-sat-2',
            food: 'Breakfast (8:00 AM): 2 Kambu Dosas (கம்பு தோசை - Pearl Millet Dosa) + 4 Boiled Egg Whites + Sambar',
            quantity: '2 pearl millet dosas + 4 egg whites + 1 cup vegetable sambar',
            notes: 'Pearl millet (Kambu) is naturally cooling, rich in iron, and digests very slowly.',
            alternatives: 'Vegetarian: 2 Kambu dosas + 1 cup Karuppu Chana Sundal.',
          },
          {
            id: 'it-tn-fl-sat-3',
            food: 'Mid-Morning (11:00 AM): 1 Country Guava (நாட்டு கொய்யாப்பழம்) or Slice of Papaya',
            quantity: '1 fruit',
            notes: 'Papain enzyme aids complete protein digestion and cleans bowels.',
            alternatives: 'Neer Mor.',
          },
          {
            id: 'it-tn-fl-sat-4',
            food: 'Lunch (1:30 PM): 1 Cup Ponni Rice + 150g Meen Kuzhambu (Ayirai / Mackerel / Seer fish) + Cabbage Poriyal (முட்டைகோஸ் பொரியல்) + Garlic Rasam',
            quantity: '1 cup rice + 150g fish in tangy tamarind gravy + 1 cup cabbage + 1 cup rasam',
            notes: 'Omega-3 fatty acids reduce systemic inflammation caused by hard workout days.',
            alternatives: 'Vegetarian: 150g Soya chunks curry + 1 cup Dal + Cabbage poriyal.',
          },
          {
            id: 'it-tn-fl-sat-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Kaara Pori with Roasted Gram & Peanuts + Black Coffee',
            quantity: '1 bowl puffed rice with 2 tbsp pottukadali & peanuts + black coffee',
            notes: 'Light crunchy Tamil Nadu street-style snack made with zero cooking oil.',
            alternatives: '1 cup boiled sundal.',
          },
          {
            id: 'it-tn-fl-sat-6',
            food: 'Dinner (8:00 PM): 2 Oil-Free Phulkas + 150g Pepper Chicken Breast Sukka + 1 Cup Aavin Curd (தயிர்)',
            quantity: '2 phulkas + 150g chicken + 1/2 cup fresh curd',
            notes: 'Clean finish to the 6-day training week. Sunday is maintenance and rest.',
            alternatives: 'Vegetarian: 2 Phulkas + 150g Paneer Tikka / Bhurji + Curd.',
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. TAMIL NADU 6-DAY WEIGHT GAIN & MUSCLE HYPERTROPHY (2800 KCAL · 165g PROTEIN)
  // -------------------------------------------------------------------------
  {
    id: 'dt-tn-weight-gain-6d',
    name: 'Tamil Nadu 6-Day Weight Gain & Mass Hypertrophy Food Chart',
    goal: 'Muscle gain',
    description: 'Designed for hardgainers and muscle hypertrophy trainees across Tamil Nadu (Monday to Saturday, Sunday Maintenance). Delivers 2800 kcal and 165g+ protein using nutrient-dense, calorie-rich Tamil staples: Sevvazhai / Nendran Bananas, Whole Eggs, Country Chicken Kari, Meen Kuzhambu, Ragi Kali, Groundnut Chutney, Boiled Sweet Potatoes, and Fresh Aavin Milk.',
    calories: 2800,
    protein: 165,
    carbs: 340,
    fat: 80,
    mealCount: 6,
    meals: [
      {
        id: 'm-tn-wg-mon',
        slot: 'Monday · Caloric Surplus & Anabolic Foundation',
        time: '6:30 AM – 9:30 PM',
        items: [
          {
            id: 'it-tn-wg-mon-1',
            food: 'Early Morning (6:30 AM): 1 Sevvazhai (செவ்வாழை - Red Banana) + 1 Glass Warm Aavin Milk with Jaggery (வெல்லம் பால்) + 6 Badam',
            quantity: '1 large red banana + 250ml milk + 6 soaked almonds',
            notes: 'Red banana contains 110 kcal, potassium, and carotenoids. Ignites morning anabolism.',
            alternatives: '1 Nendran banana steamed or sliced with honey.',
          },
          {
            id: 'it-tn-wg-mon-2',
            food: 'Breakfast (8:30 AM): 4 Steamed Idlis + 3 Whole Country Eggs Podimas (நாட்டுக்கோழி முட்டை பொடிமாஸ்) + Sambar & Groundnut Chutney (வேர்க்கடலை சட்னி)',
            quantity: '4 idlis + 3 whole eggs scrambled with onions + 1 cup sambar + 3 tbsp peanut chutney',
            notes: 'Peanut chutney and whole eggs provide healthy calories, healthy fats, and 30g+ protein.',
            alternatives: 'Vegetarian: 4 Idlis + 100g Paneer Bhurji + Peanut Chutney.',
          },
          {
            id: 'it-tn-wg-mon-3',
            food: 'Mid-Morning (11:30 AM): 1 Bowl Boiled Karuppu Konda Kadalai Sundal (கருப்பு கொண்டைக்கடலை) + 1 Tender Coconut Water',
            quantity: '150g boiled black chickpeas + 1 tender coconut',
            notes: 'Dense complex carbs and plant protein for sustained amino acid delivery to muscles.',
            alternatives: '150g Boiled Groundnuts (வேகவைத்த நிலக்கடலை).',
          },
          {
            id: 'it-tn-wg-mon-4',
            food: 'Lunch (1:30 PM): 2 Cups Ponni Boiled Rice + 200g Kozhi Kari / Chicken Curry + 1 Cup Toor Dal + Carrot Poriyal + 1 Cup Thick Curd (தயிர்)',
            quantity: '2 cups rice (300g cooked) + 200g chicken pieces + 1 cup dal + 1 cup curd',
            notes: 'Classic Tamil muscle-building lunch: high glycemic carbs reload muscle glycogen.',
            alternatives: 'Vegetarian: 2 cups rice + 200g Paneer Butter Masala (light) + 1 cup Dal + Curd.',
          },
          {
            id: 'it-tn-wg-mon-5',
            food: 'Pre-Workout (5:00 PM): 1 Large Boiled Sweet Potato (சர்க்கரைவள்ளி கிழங்கு) + Filter Coffee with Milk',
            quantity: '200g boiled sweet potato + 1 cup coffee',
            notes: 'Ideal pre-workout complex carbohydrate. Gives skin-tearing muscular pumps.',
            alternatives: '2 slices wheat bread with 2 tbsp peanut butter + 1 banana.',
          },
          {
            id: 'it-tn-wg-mon-6',
            food: 'Post-Workout & Dinner (8:30 PM): 3 Whole Wheat Chapatis + 150g Mutton Liver / Chicken Breast Pepper Sukka (ஈரல் வறுவல் / சிக்கன்) + 3 Boiled Egg Whites',
            quantity: '3 chapatis + 150g liver or chicken + 3 egg whites',
            notes: 'Mutton liver (Eeral) is nature’s multivitamin: massive heme iron, vitamin A, and B12 for recovery.',
            alternatives: 'Vegetarian: 3 Chapatis + 150g Soya Chunks Kurma + 100g Paneer Tikka.',
          },
        ],
      },
      {
        id: 'm-tn-wg-tue',
        slot: 'Tuesday · Ragi Kali & Heavy Mass Building',
        time: '6:30 AM – 9:30 PM',
        items: [
          {
            id: 'it-tn-wg-tue-1',
            food: 'Early Morning (6:30 AM): Banana Peanut Butter Smoothie (நாட்டு வாழைப்பழம் + வேர்க்கடலை வெண்ணெய் + பால்)',
            quantity: '1 glass (300ml Aavin milk + 2 Poovan bananas + 2 tbsp peanut butter)',
            notes: 'Calorie-dense 450 kcal power shake packed with healthy monounsaturated fats.',
            alternatives: '1 glass warm milk + 2 steamed Nendran bananas.',
          },
          {
            id: 'it-tn-wg-tue-2',
            food: 'Breakfast (8:30 AM): 3 Kal Dosas + 3 Boiled Eggs (2 whole + 1 white) + Sambar + Coconut Groundnut Chutney',
            quantity: '3 kal dosas + 3 eggs + sambar + chutney',
            notes: 'Spongy fermented kal dosa with whole eggs provides clean carbs, fats, and protein.',
            alternatives: 'Vegetarian: 3 Kal dosas + 100g Paneer curry + chutney.',
          },
          {
            id: 'it-tn-wg-tue-3',
            food: 'Mid-Morning (11:30 AM): 1 Cup Pasi Payiru Sundal + 1 Glass Neer Mor',
            quantity: '120g green gram sundal + 1 glass buttermilk',
            notes: 'Clean amino acids and gut cooling.',
            alternatives: '1 slice Papaya + 30g roasted peanuts.',
          },
          {
            id: 'it-tn-wg-tue-4',
            food: 'Lunch (1:30 PM): Ragi Kali (கேழ்வரகு களி) with Nattu Kozhi Kuzhambu (நாட்டுக்கோழி குழம்பு) OR 2 Cups Ponni Rice with 200g Meen Kuzhambu (Seer/Mackerel)',
            quantity: '1 large Ragi kali ball + 200g chicken or fish in spicy tamarind gravy + Keerai poriyal',
            notes: 'Ragi Kali with village-style chicken or fish curry is the legendary Tamil heavyweight strength meal.',
            alternatives: 'Vegetarian: Ragi Kali + Mochai Kottai & Kathirikkai Kuzhambu (மொச்சை கத்திரிக்காய் குழம்பு).',
          },
          {
            id: 'it-tn-wg-tue-5',
            food: 'Pre/Post-Workout (5:00 PM): 2 Sevvazhai (Red Bananas) + 4 Boiled Egg Whites + Black Coffee',
            quantity: '2 bananas + 4 egg whites + coffee',
            notes: 'Immediate amino acid flood and potassium for muscle cell hydration.',
            alternatives: 'Roasted gram powder drink (சத்து மாவு கஞ்சி - Sathu Maavu Kanji with milk).',
          },
          {
            id: 'it-tn-wg-tue-6',
            food: 'Dinner (8:30 PM): 3 Whole Wheat Parottas (Oil-controlled home wheat parotta or phulkas) + 150g Pepper Chicken + 1 Cup Aavin Curd',
            quantity: '3 wheat phulkas/chapatis + 150g chicken breast + 1 cup curd',
            notes: 'Sustains positive nitrogen balance throughout the 8 hours of nighttime sleep.',
            alternatives: 'Vegetarian: 3 Chapatis + 150g Soya Chunks & Green Peas Masala + Curd.',
          },
        ],
      },
      {
        id: 'm-tn-wg-wed',
        slot: 'Wednesday · Seafood Omega-3 & Glycogen Reload',
        time: '6:30 AM – 9:30 PM',
        items: [
          {
            id: 'it-tn-wg-wed-1',
            food: 'Early Morning (6:30 AM): Warm Milk with 1 Tbsp Ghee & 2 Dates (நெய் & பேரீச்சம்பழம்)',
            quantity: '250ml milk + 1 tbsp pure cow ghee + 2 Medjool/Lion dates',
            notes: 'Traditional Ayurvedic morning vitality tonic for joint lubrication and healthy testosterone levels.',
            alternatives: '1 glass badam milk.',
          },
          {
            id: 'it-tn-wg-wed-2',
            food: 'Breakfast (8:30 AM): 3 Egg Dosa (முட்டை தோசை - 2 eggs cracked over 2 dosas) + Tomato Thokku + Sambar',
            quantity: '2 muttai dosas + 1 cup sambar + thokku',
            notes: 'Popular Tamil Nadu tiffin combining fermented rice-urad batter with whole eggs.',
            alternatives: 'Vegetarian: 3 Paneer Stuffed Dosas + Sambar.',
          },
          {
            id: 'it-tn-wg-wed-3',
            food: 'Mid-Morning (11:30 AM): Tender Coconut Water + 1 Cup Boiled Peanuts',
            quantity: '1 coconut + 100g boiled peanuts',
            notes: 'Natural arginine and healthy fats support blood vessel dilation and growth hormone secretion.',
            alternatives: '1 cup Karuppu Chana sundal.',
          },
          {
            id: 'it-tn-wg-wed-4',
            food: 'Lunch (1:30 PM): 2 Cups Ponni Rice + 200g Vanjaram / Sankara Meen Fry & Kuzhambu + Beans Poriyal + Thick Dal',
            quantity: '2 cups rice + 200g fish + 1 cup beans + 1 cup dal',
            notes: 'Massive dose of complete animal protein and natural anti-inflammatory fish oils.',
            alternatives: 'Vegetarian: 2 cups rice + 150g Paneer Tikka + 1 cup Dal Makhani (Tamil style).',
          },
          {
            id: 'it-tn-wg-wed-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Sathu Maavu Kanji (சத்து மாவு கஞ்சி with milk & jaggery) + 3 Boiled Egg Whites',
            quantity: '1 bowl multigrain porridge + 3 egg whites',
            notes: 'Traditional Tamil multigrain health mix containing millets, pulses, and nuts. Clean mass fuel.',
            alternatives: '2 bananas + 4 egg whites.',
          },
          {
            id: 'it-tn-wg-wed-6',
            food: 'Dinner (8:30 PM): 3 Whole Wheat Chapatis + 150g Chicken Breast Sukka + 1 Boiled Egg + Rasam & Curd',
            quantity: '3 chapatis + 150g chicken + 1 egg + 1 cup curd',
            notes: 'Balanced macronutrient density for overnight muscle repair.',
            alternatives: 'Vegetarian: 3 Chapatis + 150g Soya Chunks Curry + Curd.',
          },
        ],
      },
      {
        id: 'm-tn-wg-thu',
        slot: 'Thursday · High-Calorie Mass Acceleration',
        time: '6:30 AM – 9:30 PM',
        items: [
          {
            id: 'it-tn-wg-thu-1',
            food: 'Early Morning (6:30 AM): 2 Poovan Bananas + 1 Glass Aavin Full Cream Milk + 6 Almonds',
            quantity: '2 bananas + 250ml milk + 6 badam',
            notes: 'Instant carb energy and casein milk protein to halt morning catabolism.',
            alternatives: '1 Red banana + milk.',
          },
          {
            id: 'it-tn-wg-thu-2',
            food: 'Breakfast (8:30 AM): Godhumai Rava Upma with Peanuts + 3 Whole Eggs Scrambled + Coconut Chutney',
            quantity: '1 plate wheat rava upma + 3 eggs + 3 tbsp chutney',
            notes: 'Wheat rava, roasted peanuts, and eggs pack 35g protein and 500 clean calories.',
            alternatives: 'Vegetarian: Upma with 100g grated paneer and green peas.',
          },
          {
            id: 'it-tn-wg-thu-3',
            food: 'Mid-Morning (11:30 AM): 1 Cup Sprouted Green Gram (பச்சைப்பயறு) + 1 Glass Neer Mor',
            quantity: '150g sprouts + 1 glass buttermilk',
            notes: 'Sprouting triples enzyme activity and increases bioavailable lysine and leucine.',
            alternatives: '1 Country Guava + 30g peanuts.',
          },
          {
            id: 'it-tn-wg-thu-4',
            food: 'Lunch (1:30 PM): 2 Cups Ponni Rice + 200g Country Chicken Curry (நாட்டுக்கோழி குழம்பு) + Murungai Keerai Poriyal + Curd',
            quantity: '2 cups rice + 200g chicken + 1 cup drumstick greens + 1 cup curd',
            notes: 'High iron, calcium, and collagen from bone-in country chicken broth.',
            alternatives: 'Vegetarian: 2 cups rice + 200g Soya Chunks & Potato Kurma + Curd.',
          },
          {
            id: 'it-tn-wg-thu-5',
            food: 'Pre/Post-Workout (5:00 PM): 2 Steamed Nendran Bananas (நேந்திரம் பழம்) + Filter Coffee',
            quantity: '2 steamed Kerala/TN Nendran bananas + coffee',
            notes: 'Nendran bananas are the #1 traditional mass-gaining fruit in South India.',
            alternatives: '200g boiled sweet potato.',
          },
          {
            id: 'it-tn-wg-thu-6',
            food: 'Dinner (8:30 PM): 3 Soft Idlis + 2 Egg Omelette + 150g Pepper Chicken + Garlic Rasam',
            quantity: '3 idlis + 2-egg omelette + 150g chicken + 1 cup rasam',
            notes: 'Effortless to digest before sleep while hitting 50g protein.',
            alternatives: 'Vegetarian: 3 Idlis + 150g Paneer Bhurji + Sambar.',
          },
        ],
      },
      {
        id: 'm-tn-wg-fri',
        slot: 'Friday · Traditional Strength & Joint Fortification',
        time: '6:30 AM – 9:30 PM',
        items: [
          {
            id: 'it-tn-wg-fri-1',
            food: 'Early Morning (6:30 AM): Warm Aavin Milk with Turmeric, Pepper & 1 Tsp Ghee',
            quantity: '250ml milk + 1 tsp cow ghee + turmeric + black pepper',
            notes: 'Curcumin with piperine and healthy fats reduces heavy squat/press joint inflammation.',
            alternatives: 'Warm badam milk.',
          },
          {
            id: 'it-tn-wg-fri-2',
            food: 'Breakfast (8:30 AM): 3 Ragi Dosas + 3 Boiled Eggs + Thick Toor Dal Sambar',
            quantity: '3 ragi dosas + 3 eggs + 1 cup sambar',
            notes: 'Dense minerals from finger millet combined with egg albumin.',
            alternatives: 'Vegetarian: 3 Ragi dosas + 1 cup Karuppu Chana Sundal.',
          },
          {
            id: 'it-tn-wg-fri-3',
            food: 'Mid-Morning (11:30 AM): Tender Coconut Water + 1 Cup Roasted Peanuts',
            quantity: '1 coconut + 50g roasted groundnuts',
            notes: 'Healthy fats, potassium, and magnesium.',
            alternatives: '1 glass Neer Mor + 1 Country Guava.',
          },
          {
            id: 'it-tn-wg-fri-4',
            food: 'Lunch (1:30 PM): 2 Cups Ponni Rice + Nenju Elumbu Soup / Mutton Curry (நெஞ்சு எலும்பு சூப் / கறி) OR 200g Chicken Curry + Cabbage Poriyal + Curd',
            quantity: '2 cups rice + 200g meat + 1 cup bone broth + 1 cup curd',
            notes: 'Mutton bone broth (Nenju Elumbu) is rich in glucosamine, chondroitin, and collagen for heavy lifters.',
            alternatives: 'Vegetarian: 2 cups rice + 200g Paneer Tikka + 1 cup Dal + Curd.',
          },
          {
            id: 'it-tn-wg-fri-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Large Sweet Potato + 4 Boiled Egg Whites + Black Coffee',
            quantity: '200g sweet potato + 4 egg whites + coffee',
            notes: 'Maximizes workout pump and ensures immediate post-lift recovery.',
            alternatives: 'Sathu Maavu porridge with milk.',
          },
          {
            id: 'it-tn-wg-fri-6',
            food: 'Dinner (8:30 PM): 3 Whole Wheat Chapatis + 150g Chicken Breast Sukka + 1 Cup Dal + Raitha',
            quantity: '3 chapatis + 150g chicken + 1 cup dal + raitha',
            notes: 'Complete balanced dinner supporting nocturnal growth hormone release.',
            alternatives: 'Vegetarian: 3 Chapatis + 150g Soya Chunks Gravy + Raitha.',
          },
        ],
      },
      {
        id: 'm-tn-wg-sat',
        slot: 'Saturday · Weekend Hypertrophy Peak & Protein Feast',
        time: '6:30 AM – 9:30 PM',
        items: [
          {
            id: 'it-tn-wg-sat-1',
            food: 'Early Morning (6:30 AM): 1 Sevvazhai (Red Banana) + 1 Glass Milk + 6 Badam',
            quantity: '1 banana + 250ml milk + 6 almonds',
            notes: 'Sustained energy release for Saturday morning training.',
            alternatives: '2 Poovan bananas + milk.',
          },
          {
            id: 'it-tn-wg-sat-2',
            food: 'Breakfast (8:30 AM): 4 Steamed Idlis + 3 Whole Eggs Podimas + Peanut Chutney + Sambar',
            quantity: '4 idlis + 3-egg scramble + chutney + sambar',
            notes: 'Classic Tamil Nadu bodybuilding fuel.',
            alternatives: 'Vegetarian: 4 Idlis + 120g Paneer Bhurji + Chutney.',
          },
          {
            id: 'it-tn-wg-sat-3',
            food: 'Mid-Morning (11:30 AM): 1 Cup Karuppu Chana Sundal + 1 Tender Coconut Water',
            quantity: '150g black chickpeas + 1 coconut',
            notes: 'High fiber, complex carbs, and cellular rehydration.',
            alternatives: 'Boiled peanuts.',
          },
          {
            id: 'it-tn-wg-sat-4',
            food: 'Lunch (1:30 PM): 2 Cups Ponni Rice + 200g Fish / Chicken Curry + Vazhaithandu Poriyal + Curd',
            quantity: '2 cups rice + 200g protein + 1 cup veg + 1 cup curd',
            notes: 'Refuels full glycogen stores after the week’s heavy sessions.',
            alternatives: 'Vegetarian: 2 cups rice + 200g Paneer Butter Masala + Curd.',
          },
          {
            id: 'it-tn-wg-sat-5',
            food: 'Pre/Post-Workout (5:00 PM): 2 Bananas + 4 Boiled Egg Whites + Black Coffee',
            quantity: '2 bananas + 4 egg whites + coffee',
            notes: 'Immediate muscle glycogen resynthesis.',
            alternatives: '1 bowl Sathu Maavu Kanji with milk.',
          },
          {
            id: 'it-tn-wg-sat-6',
            food: 'Dinner (8:30 PM): 3 Whole Wheat Phulkas + 150g Pepper Chicken Sukka + 1 Boiled Egg + Rasam & Curd',
            quantity: '3 phulkas + 150g chicken + 1 egg + 1 cup curd',
            notes: 'High protein recovery meal before Sunday rest and growth.',
            alternatives: 'Vegetarian: 3 Phulkas + 150g Soya Chunks Thokku + Curd.',
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. TAMIL NADU 6-DAY PURE VEGETARIAN HIGH-PROTEIN (2150 KCAL · 140g PROTEIN)
  // -------------------------------------------------------------------------
  {
    id: 'dt-tn-veg-protein-6d',
    name: 'Tamil Nadu 6-Day Pure Vegetarian High-Protein Food Chart',
    goal: 'High protein',
    description: 'A 100% pure vegetarian Tamil Nadu bodybuilding diet covering Monday to Saturday (Sunday Rest). Delivers 140g+ daily complete protein without eggs or meat, utilizing easily buyable local powerhouses: Soya Chunks (Meal Maker - 52% protein), Fresh Aavin Paneer, Karuppu Konda Kadalai, Pasi Payiru, Kollu (Horse gram), Roasted Pottukadali, Thick Curd, and Millets.',
    calories: 2150,
    protein: 140,
    carbs: 230,
    fat: 65,
    mealCount: 6,
    meals: [
      {
        id: 'm-tn-veg-mon',
        slot: 'Monday · Soya & Legume High-Protein Surge',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-veg-mon-1',
            food: 'Early Morning (6:30 AM): Warm Jeera Water + 6 Soaked Badam & 2 Walnuts',
            quantity: '1 large glass warm cumin water + 8 nuts',
            notes: 'Stimulates digestive enzymes and provides brain-healthy plant omega-3s.',
            alternatives: 'Warm water with freshly squeezed lemon.',
          },
          {
            id: 'it-tn-veg-mon-2',
            food: 'Breakfast (8:00 AM): 3 Steamed Idlis + 1 Large Bowl Pasi Payiru Sundal (பச்சைப்பயறு சுண்டல்) + Drumstick Sambar',
            quantity: '3 idlis + 120g boiled green gram with mustard & curry leaves + 1 cup sambar',
            notes: 'Green gram and toor dal sambar complement rice protein to form a complete amino acid profile.',
            alternatives: '2 Ragi Dosas + 1 cup Sprouted Moong Dal.',
          },
          {
            id: 'it-tn-veg-mon-3',
            food: 'Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்) + Tender Pulp',
            quantity: '1 whole coconut (~250ml water)',
            notes: 'Hydrates muscle cells with natural potassium and bio-available electrolytes.',
            alternatives: 'Chilled Neer Mor with curry leaves and ginger.',
          },
          {
            id: 'it-tn-veg-mon-4',
            food: 'Lunch (1:30 PM): 1.5 Cups Ponni Rice + 100g Soya Chunks (Meal Maker) Curry (மீல் மேக்கர் குழம்பு) + Murungai Keerai Poriyal + Thick Aavin Curd',
            quantity: '1.5 cups rice (225g cooked) + 100g cooked soya chunks + 1 cup drumstick greens + 1 cup curd',
            notes: 'Soya chunks pack an unmatched 52g protein per 100g dry weight. Curd aids easy digestion.',
            alternatives: '150g Fresh Aavin Paneer Curry + 1 cup Dal.',
          },
          {
            id: 'it-tn-veg-mon-5',
            food: 'Pre/Post-Workout (5:00 PM): Roasted Pottukadali Drink (பொட்டுக்கடலை மாவு பானம்) OR 1 Cup Karuppu Chana Sundal + Black Coffee',
            quantity: '2 tbsp fried gram powder stirred in water/milk + black coffee',
            notes: 'Pottukadali (roasted gram) is 24% protein, completely dry roasted and instant to consume.',
            alternatives: '1 cup boiled peanuts (50g).',
          },
          {
            id: 'it-tn-veg-mon-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Chapatis + 120g Aavin Fresh Paneer Bhurji (பன்னீர் பொடிமாஸ் with onions & tomatoes) + Vazhaithandu Poriyal',
            quantity: '2 chapatis + 120g paneer bhurji + 1 cup banana stem poriyal',
            notes: 'Slow-digesting casein protein from fresh paneer feeds recovering muscle fibers all night long.',
            alternatives: '100g Soya Chunks Bhurji with capsicum and tomatoes.',
          },
        ],
      },
      {
        id: 'm-tn-veg-tue',
        slot: 'Tuesday · Kollu (Horse Gram) & Paneer Power',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-veg-tue-1',
            food: 'Early Morning (6:30 AM): Warm Kollu Water (கொள்ளு சூப்)',
            quantity: '1 cup warm horse gram broth with pepper and cumin',
            notes: 'Thermogenic Tamil legume broth. Known for burning fat and cutting water weight.',
            alternatives: 'Warm methi water.',
          },
          {
            id: 'it-tn-veg-tue-2',
            food: 'Breakfast (8:00 AM): 2 Ragi Dosas (கேழ்வரகு தோசை) + 1 Bowl Sprouted Green Gram Salad (முளைகட்டிய பயறு with lemon & salt) + Tomato Chutney',
            quantity: '2 ragi dosas + 100g sprouts + 2 tbsp chutney',
            notes: 'Ragi provides high calcium (344mg) to support heavy bone load and joint health.',
            alternatives: 'Godhumai Rava Upma with 50g roasted peanuts and 50g paneer.',
          },
          {
            id: 'it-tn-veg-tue-3',
            food: 'Mid-Morning (11:00 AM): 1 Nattu Koyyappazham (Country Guava) + 1 Glass Neer Mor',
            quantity: '1 guava + 250ml buttermilk',
            notes: 'High vitamin C helps assimilate plant-based non-heme iron from legumes.',
            alternatives: '1 slice Papaya.',
          },
          {
            id: 'it-tn-veg-tue-4',
            food: 'Lunch (1:30 PM): 1.5 Cups Thinai / Foxtail Millet Rice (தினை சாதம்) + 150g Aavin Paneer Tawa Fry / Masala + Kollu Rasam (கொள்ளு ரசம்) + Beans Poriyal',
            quantity: '1.5 cups cooked thinai + 150g paneer + 1 cup rasam + 1 cup beans',
            notes: 'Paneer provides 27g complete animal-free protein; Thinai millet provides low-GI complex carbs.',
            alternatives: '100g Soya Chunks Curry + 1 cup Yellow Dal.',
          },
          {
            id: 'it-tn-veg-tue-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Small Boiled Sweet Potato (சர்க்கரைவள்ளி கிழங்கு) + 1 Cup Boiled Peanuts + Black Filter Coffee',
            quantity: '120g sweet potato + 40g peanuts + coffee',
            notes: 'Sustained glycogen and pump power for the evening training session.',
            alternatives: '1 Poovan banana + roasted chana.',
          },
          {
            id: 'it-tn-veg-tue-6',
            food: 'Dinner (8:00 PM): 2 Soft Kal Dosas + 1 Bowl Soya Chunks Kurma (மீல் மேக்கர் குருமா) + Keerai Masiyal',
            quantity: '2 kal dosas + 80g soya chunks in mild kurma + 1 cup greens',
            notes: 'Light fermented tiffin with 35g protein that will not disrupt deep sleep.',
            alternatives: '2 Chapatis + 120g Paneer Bhurji + Keerai.',
          },
        ],
      },
      {
        id: 'm-tn-veg-wed',
        slot: 'Wednesday · Black Chana & Sathu Maavu Strength',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-veg-wed-1',
            food: 'Early Morning (6:30 AM): Poosanaikkai (Ash Gourd) Juice with Pepper',
            quantity: '1 glass (250ml) fresh juice',
            notes: 'Alkalizes system, cools stomach fire, and reduces gut inflammation.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-veg-wed-2',
            food: 'Breakfast (8:00 AM): 3 Steamed Idlis + 1 Large Bowl Karuppu Konda Kadalai Sundal (கருப்பு சுண்டல்) + Sambar',
            quantity: '3 idlis + 120g boiled black chickpeas + 1 cup sambar',
            notes: 'Black chickpeas have unmatched fiber and steady energy delivery.',
            alternatives: '2 Kambu (Pearl Millet) Dosas + 100g Paneer bhurji.',
          },
          {
            id: 'it-tn-veg-wed-3',
            food: 'Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)',
            quantity: '1 whole coconut',
            notes: 'Natural electrolyte replenishment.',
            alternatives: 'Neer Mor with curry leaves and hing.',
          },
          {
            id: 'it-tn-veg-wed-4',
            food: 'Lunch (1:30 PM): 1.5 Cups Ponni Rice + 1 Bowl Soya Chunks & Green Peas Masala (மீல் மேக்கர் பட்டாணி மசாலா) + Cabbage Poriyal + Aavin Curd',
            quantity: '1.5 cups rice + 80g soya chunks & 50g peas + 1 cup cabbage + 1 cup curd',
            notes: 'Combines two powerful plant protein sources (soya + green peas) for 38g protein.',
            alternatives: '150g Paneer Butter Masala (light) + Dal + Rice.',
          },
          {
            id: 'it-tn-veg-wed-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Bowl Sathu Maavu Kanji (சத்து மாவு கஞ்சி with milk) + Roasted Groundnuts',
            quantity: '1 bowl multigrain porridge + 30g peanuts',
            notes: 'Traditional Tamil Nadu bodybuilding power porridge.',
            alternatives: '2 bananas + black coffee.',
          },
          {
            id: 'it-tn-veg-wed-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Chapatis + 120g Fresh Paneer Tikka / Pan-Tossed Paneer with Bell Peppers + Cucumber Raitha',
            quantity: '2 chapatis + 120g paneer + 1 cup raitha',
            notes: 'Casein protein supports overnight muscle protein synthesis.',
            alternatives: '2 Chapatis + 100g Soya chunks bhurji + Raitha.',
          },
        ],
      },
      {
        id: 'm-tn-veg-thu',
        slot: 'Thursday · High-Fiber Millet & Lentil Fuel',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-veg-thu-1',
            food: 'Early Morning (6:30 AM): Murungai Keerai Clear Broth (முருங்கைக்கீரை சூப்)',
            quantity: '1 bowl (200ml) fresh drumstick leaves soup',
            notes: 'Packed with bioavailable iron, vitamin C, and essential amino acids.',
            alternatives: 'Warm methi water.',
          },
          {
            id: 'it-tn-veg-thu-2',
            food: 'Breakfast (8:00 AM): Sigappu Aval Upma (சிகப்பு அவல்) with Peanuts & Boiled Sprouts + Mint Chutney',
            quantity: '1 plate red poha with 30g peanuts & 50g sprouts + 2 tbsp chutney',
            notes: 'Red rice poha is rich in iron, zinc, and complex carbohydrates.',
            alternatives: '3 Idlis + 1 cup Pasi Payiru sundal.',
          },
          {
            id: 'it-tn-veg-thu-3',
            food: 'Mid-Morning (11:00 AM): 1 Nattu Mathulai (Country Pomegranate) + 1 Glass Neer Mor',
            quantity: '1 cup pomegranate pearls + 1 glass buttermilk',
            notes: 'Nitric oxide booster for muscle pumps and digestion.',
            alternatives: '1 Country Guava.',
          },
          {
            id: 'it-tn-veg-thu-4',
            food: 'Lunch (1:30 PM): 1.5 Cups Samai / Little Millet Rice (சாமை சாதம்) + 150g Aavin Paneer Curry + Vendakkai Poriyal + Poondu Rasam',
            quantity: '1.5 cups samai + 150g paneer + 1 cup ladies finger + 1 cup garlic rasam',
            notes: 'Garlic rasam aids gastric breakdown of paneer fats and proteins.',
            alternatives: '100g Soya chunks curry + Dal + Samai rice.',
          },
          {
            id: 'it-tn-veg-thu-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Kaara Pori with Roasted Pottukadali & Groundnuts + Filter Coffee',
            quantity: '1 large bowl puffed rice with 3 tbsp fried gram & peanuts + black coffee',
            notes: 'Light, crunchy pre-workout carb boost without heaviness.',
            alternatives: '1 Sevvazhai / Poovan banana.',
          },
          {
            id: 'it-tn-veg-thu-6',
            food: 'Dinner (8:00 PM): 2 Ragi Dosas + 1 Bowl Soya Chunks Masala + Keerai Poriyal',
            quantity: '2 ragi dosas + 80g soya chunks + 1 cup greens',
            notes: 'High calcium from Ragi and 32g protein from soya chunks.',
            alternatives: '2 Chapatis + 120g Paneer Bhurji.',
          },
        ],
      },
      {
        id: 'm-tn-veg-fri',
        slot: 'Friday · Sprout & Legume Anabolic Density',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-veg-fri-1',
            food: 'Early Morning (6:30 AM): Warm Lemon & Cinnamon Water + 6 Soaked Almonds',
            quantity: '1 glass warm water + 6 almonds',
            notes: 'Regulates morning insulin and jumpstarts metabolism.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-veg-fri-2',
            food: 'Breakfast (8:00 AM): 3 Steamed Idlis + 1 Bowl Vellai Konda Kadalai Sundal (வெள்ளை சுண்டல்) + Sambar',
            quantity: '3 idlis + 120g white chickpeas + 1 cup sambar',
            notes: 'Classic Tamil Nadu temple-style sundal packed with leucine and complex carbs.',
            alternatives: '2 Kambu Dosas + Sprouted Moong Dal.',
          },
          {
            id: 'it-tn-veg-fri-3',
            food: 'Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)',
            quantity: '1 whole coconut',
            notes: 'Rehydrates muscle fibers.',
            alternatives: 'Neer Mor with curry leaves.',
          },
          {
            id: 'it-tn-veg-fri-4',
            food: 'Lunch (1:30 PM): 1.5 Cups Ponni Rice + 100g Soya Chunks Thokku + Vazhaithandu Kootu + Aavin Curd',
            quantity: '1.5 cups rice + 100g soya chunks in spicy onion-tomato thokku + 1 cup banana stem + 1 cup curd',
            notes: 'Banana stem flushes sodium retention; soya provides massive amino acids.',
            alternatives: '150g Paneer Tawa Fry + Dal + Curd.',
          },
          {
            id: 'it-tn-veg-fri-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Boiled Sweet Potato + Roasted Groundnuts + Black Coffee',
            quantity: '120g sweet potato + 30g peanuts + coffee',
            notes: 'Clean gym endurance and muscle pump fuel.',
            alternatives: '2 Poovan bananas + black tea.',
          },
          {
            id: 'it-tn-veg-fri-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Chapatis + 120g Aavin Paneer Bhurji + Cucumber Raitha',
            quantity: '2 chapatis + 120g paneer + 1 cup raitha',
            notes: 'Slow-release protein for continuous muscle recovery.',
            alternatives: '2 Kal Dosas + Soya Chunks Kurma.',
          },
        ],
      },
      {
        id: 'm-tn-veg-sat',
        slot: 'Saturday · Weekend Multi-Lentil Power Feast',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-veg-sat-1',
            food: 'Early Morning (6:30 AM): Warm Methi Water (வெந்தயத் தண்ணீர்)',
            quantity: '1 glass warm water with soaked fenugreek',
            notes: 'Cleans gut wall and stabilizes blood glucose.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-veg-sat-2',
            food: 'Breakfast (8:00 AM): 2 Kambu Dosas (கம்பு தோசை) + 1 Cup Pasi Payiru Sundal + Sambar',
            quantity: '2 pearl millet dosas + 120g green gram sundal + sambar',
            notes: 'Pearl millet cools body heat generated from intense weekly lifting.',
            alternatives: '3 Idlis + 100g Paneer bhurji.',
          },
          {
            id: 'it-tn-veg-sat-3',
            food: 'Mid-Morning (11:00 AM): 1 Country Guava (நாட்டு கொய்யா) + 1 Glass Neer Mor',
            quantity: '1 guava + 250ml buttermilk',
            notes: 'Digestive enzyme boost and gut microbiome care.',
            alternatives: '1 slice Papaya.',
          },
          {
            id: 'it-tn-veg-sat-4',
            food: 'Lunch (1:30 PM): 1.5 Cups Ponni Rice + 150g Fresh Paneer & Capsicum Masala + Kollu Rasam + Kovaikkai Poriyal',
            quantity: '1.5 cups rice + 150g paneer + 1 cup rasam + 1 cup ivy gourd',
            notes: 'High protein and metabolic stimulation before Sunday rest.',
            alternatives: '100g Soya Chunks Curry + Curd.',
          },
          {
            id: 'it-tn-veg-sat-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Bowl Sathu Maavu Kanji with Milk OR Boiled Peanuts + Black Coffee',
            quantity: '1 bowl porridge + coffee',
            notes: 'Final workout energy boost of the week.',
            alternatives: 'Kaara pori with roasted gram.',
          },
          {
            id: 'it-tn-veg-sat-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Phulkas + 100g Soya Chunks Curry + 1 Cup Aavin Curd',
            quantity: '2 phulkas + 100g soya chunks + 1 cup curd',
            notes: 'Completes 140g protein target with zero meat or eggs.',
            alternatives: '2 Kal Dosas + 120g Paneer Bhurji.',
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. TAMIL NADU 6-DAY BODY RECOMPOSITION & LEAN MUSCLE TONE (1950 KCAL · 145g PROTEIN)
  // -------------------------------------------------------------------------
  {
    id: 'dt-tn-recomp-6d',
    name: 'Tamil Nadu 6-Day Body Recomposition & Lean Muscle Tone Food Chart',
    goal: 'General fitness',
    description: 'Scientifically crafted for the classic "skinny-fat" or moderate body fat trainee aiming to drop belly fat while sculpting sharp muscle tone (Monday to Saturday, Sunday Maintenance). Fuses local Tamil staples: Millets (Thinai, Samai, Kambu), Seer/Red Snapper Fish, Boiled Egg Whites, Pepper Chicken Breast, Elaneer, Banana Stem, and Neer Mor.',
    calories: 1950,
    protein: 145,
    carbs: 190,
    fat: 55,
    mealCount: 6,
    meals: [
      {
        id: 'm-tn-rec-mon',
        slot: 'Monday · High-Protein Recomp Kickoff',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-rec-mon-1',
            food: 'Early Morning (6:30 AM): Warm Jeera & Lemon Water',
            quantity: '1 glass (300ml) warm water + 1/2 tsp crushed cumin + 1/2 lemon',
            notes: 'Jumpstarts morning hydration and bile secretion.',
            alternatives: 'Warm water with tulsi leaves.',
          },
          {
            id: 'it-tn-rec-mon-2',
            food: 'Breakfast (8:00 AM): 3 Soft Steamed Idlis + 4 Boiled Egg Whites + Drumstick Tomato Sambar',
            quantity: '3 idlis + 4 egg whites + 1 cup sambar',
            notes: 'Clean low-fat carbohydrates and pure egg albumin.',
            alternatives: 'Vegetarian: 3 Idlis + 1 cup Pasi Payiru Sundal.',
          },
          {
            id: 'it-tn-rec-mon-3',
            food: 'Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)',
            quantity: '1 whole coconut',
            notes: 'Natural intra-cellular potassium.',
            alternatives: 'Neer Mor with curry leaves.',
          },
          {
            id: 'it-tn-rec-mon-4',
            food: 'Lunch (1:30 PM): 1 Cup Thinai Millet Rice (தினை சாதம்) + 180g Chicken Breast Pepper Sukka + Murungai Keerai Poriyal + Garlic Rasam',
            quantity: '1 cup cooked thinai + 180g chicken breast + 1 cup greens + 1 cup rasam',
            notes: 'Foxtail millet prevents insulin spikes; pepper chicken delivers 45g pure protein.',
            alternatives: 'Vegetarian: 120g Soya Chunks Curry + 1 cup Dal.',
          },
          {
            id: 'it-tn-rec-mon-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Small Boiled Sweet Potato + Black Filter Coffee + 3 Boiled Egg Whites',
            quantity: '100g sweet potato + coffee + 3 egg whites',
            notes: 'Fuels gym performance and initiates immediate muscle repair.',
            alternatives: '1 Poovan banana + 30g roasted peanuts.',
          },
          {
            id: 'it-tn-rec-mon-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Phulkas + 150g Vanjaram / Sankara Meen Tawa Fry + Vazhaithandu Poriyal',
            quantity: '2 phulkas + 150g fish + 1 cup banana stem poriyal',
            notes: 'Fish omega-3 fatty acids enhance insulin sensitivity and shred belly fat.',
            alternatives: 'Vegetarian: 2 Phulkas + 120g Paneer Bhurji + Vazhaithandu.',
          },
        ],
      },
      {
        id: 'm-tn-rec-tue',
        slot: 'Tuesday · Millet Fiber & Lean Seafood Toning',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-rec-tue-1',
            food: 'Early Morning (6:30 AM): Warm Kollu Water (கொள்ளு சூப்)',
            quantity: '1 cup warm horse gram broth',
            notes: 'Thermogenic metabolic primer.',
            alternatives: 'Warm methi water.',
          },
          {
            id: 'it-tn-rec-tue-2',
            food: 'Breakfast (8:00 AM): 2 Ragi Dosas + 3 Boiled Egg Whites + 1 Whole Egg Omelette with Onions & Curry Leaves',
            quantity: '2 ragi dosas + 4 eggs total (3 whites, 1 whole)',
            notes: 'Low glycemic finger millet paired with complete egg protein.',
            alternatives: 'Vegetarian: 2 Ragi dosas + 1 cup Sprouted Moong Dal.',
          },
          {
            id: 'it-tn-rec-tue-3',
            food: 'Mid-Morning (11:00 AM): 1 Country Guava (நாட்டு கொய்யா) + 1 Glass Neer Mor',
            quantity: '1 guava + 250ml buttermilk',
            notes: 'High fiber and probiotics.',
            alternatives: '1 slice Papaya.',
          },
          {
            id: 'it-tn-rec-tue-4',
            food: 'Lunch (1:30 PM): 1 Cup Samai Millet Rice (சாமை சாதம்) + 180g Meen Kuzhambu (Seer/Mackerel) + Beans Poriyal + Poondu Rasam',
            quantity: '1 cup cooked samai + 180g fish in tamarind gravy + 1 cup beans + 1 cup rasam',
            notes: 'Little millet is rich in B-vitamins and magnesium for muscle contractions.',
            alternatives: 'Vegetarian: 150g Tawa Paneer + 1 cup Dal.',
          },
          {
            id: 'it-tn-rec-tue-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Karuppu Chana Sundal + Black Coffee',
            quantity: '100g black chickpeas + coffee',
            notes: 'Slow-burning carb fuel for evening workout.',
            alternatives: 'Boiled groundnuts (40g).',
          },
          {
            id: 'it-tn-rec-tue-6',
            food: 'Dinner (8:00 PM): 2 Kal Dosas + 150g Pepper Chicken Breast Sukka + Cucumber Raitha',
            quantity: '2 kal dosas + 150g chicken + 1 cup raitha',
            notes: 'Fermented tiffin with lean chicken ensures zero night indigestion.',
            alternatives: 'Vegetarian: 2 Kal dosas + 100g Soya chunks curry + raitha.',
          },
        ],
      },
      {
        id: 'm-tn-rec-wed',
        slot: 'Wednesday · Clean Thermogenic Density',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-rec-wed-1',
            food: 'Early Morning (6:30 AM): Poosanaikkai (Ash Gourd) Juice',
            quantity: '1 glass (250ml) fresh juice',
            notes: 'Cools body and reduces water retention.',
            alternatives: 'Warm lemon water.',
          },
          {
            id: 'it-tn-rec-wed-2',
            food: 'Breakfast (8:00 AM): Godhumai Rava Upma with Veggies & Peanuts + 4 Boiled Egg Whites',
            quantity: '1 plate wheat rava upma + 4 egg whites',
            notes: 'High satiety breakfast.',
            alternatives: 'Vegetarian: Upma with 80g paneer cubes.',
          },
          {
            id: 'it-tn-rec-wed-3',
            food: 'Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)',
            quantity: '1 whole coconut',
            notes: 'Restores natural minerals.',
            alternatives: 'Neer Mor with ginger and hing.',
          },
          {
            id: 'it-tn-rec-wed-4',
            food: 'Lunch (1:30 PM): 1 Cup Ponni Boiled Rice + 180g Country Chicken Curry + Vendakkai Poriyal + Milagu Rasam',
            quantity: '1 cup rice + 180g chicken + 1 cup ladies finger + 1 cup pepper rasam',
            notes: 'Black pepper in rasam increases bioavailability of nutrients.',
            alternatives: 'Vegetarian: 100g Soya chunks + 1 cup Dal + rice.',
          },
          {
            id: 'it-tn-rec-wed-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Poovan Banana + 3 Boiled Egg Whites + Black Coffee',
            quantity: '1 banana + 3 egg whites + coffee',
            notes: 'Direct amino acid and glycogen reload.',
            alternatives: 'Roasted pottukadali drink.',
          },
          {
            id: 'it-tn-rec-wed-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Phulkas + 150g Meen Tawa Fry (Sankara / Vanjaram) + Keerai Masiyal',
            quantity: '2 phulkas + 150g fish + 1 cup greens',
            notes: 'Lean protein and iron-rich greens.',
            alternatives: 'Vegetarian: 2 Phulkas + 120g Paneer Bhurji + Keerai.',
          },
        ],
      },
      {
        id: 'm-tn-rec-thu',
        slot: 'Thursday · High-Protein Nitrogen Balance',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-rec-thu-1',
            food: 'Early Morning (6:30 AM): Murungai Keerai Clear Broth (முருங்கைக்கீரை சூப்)',
            quantity: '1 bowl drumstick leaves soup',
            notes: 'High iron and chlorophyll for blood purification.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-rec-thu-2',
            food: 'Breakfast (8:00 AM): Sigappu Aval Upma + 3 Boiled Egg Whites + 1 Whole Egg Omelette',
            quantity: '1 plate red poha + 4 eggs total',
            notes: 'Complex low-GI carbs from red rice flakes.',
            alternatives: 'Vegetarian: Red poha with 50g peanuts & 50g paneer.',
          },
          {
            id: 'it-tn-rec-thu-3',
            food: 'Mid-Morning (11:00 AM): 1 Cup Nattu Mathulai (Pomegranate) + Neer Mor',
            quantity: '1 cup pomegranate + 1 glass buttermilk',
            notes: 'Vascular blood pump support.',
            alternatives: '1 Country Guava.',
          },
          {
            id: 'it-tn-rec-thu-4',
            food: 'Lunch (1:30 PM): 1 Cup Kuthiraivali Millet Rice (குதிரைவாலி சாதம்) + 180g Chicken Breast Sukka + Cabbage Poriyal + Curd',
            quantity: '1 cup millet rice + 180g chicken + 1 cup cabbage + 1/2 cup curd',
            notes: 'Barnyard millet has highest fiber among small millets.',
            alternatives: 'Vegetarian: 150g Paneer Tawa Fry + Dal.',
          },
          {
            id: 'it-tn-rec-thu-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Pasi Payiru Sundal + Black Filter Coffee',
            quantity: '100g green gram sundal + coffee',
            notes: 'Light plant protein and caffeine.',
            alternatives: 'Boiled sweet potato.',
          },
          {
            id: 'it-tn-rec-thu-6',
            food: 'Dinner (8:00 PM): 3 Soft Idlis + Egg Podimas (3 egg whites + 1 whole egg) + Sambar',
            quantity: '3 idlis + 4-egg podimas + sambar',
            notes: 'Effortlessly digested before bed.',
            alternatives: 'Vegetarian: 3 Idlis + 100g Soya Chunks Curry.',
          },
        ],
      },
      {
        id: 'm-tn-rec-fri',
        slot: 'Friday · Lean Mass Striations & Water Cut',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-rec-fri-1',
            food: 'Early Morning (6:30 AM): Warm Lemon & Cinnamon Water',
            quantity: '1 glass warm water + 1/2 lemon + cinnamon',
            notes: 'Insulin priming.',
            alternatives: 'Warm methi water.',
          },
          {
            id: 'it-tn-rec-fri-2',
            food: 'Breakfast (8:00 AM): 2 Kambu Dosas + 4 Boiled Egg Whites + Tomato Chutney',
            quantity: '2 pearl millet dosas + 4 egg whites + chutney',
            notes: 'Cooling pearl millet with pure protein.',
            alternatives: 'Vegetarian: 2 Kambu dosas + 1 cup Karuppu Chana Sundal.',
          },
          {
            id: 'it-tn-rec-fri-3',
            food: 'Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)',
            quantity: '1 whole coconut',
            notes: 'Intracellular hydration.',
            alternatives: 'Neer Mor with curry leaves.',
          },
          {
            id: 'it-tn-rec-fri-4',
            food: 'Lunch (1:30 PM): 1 Cup Ponni Rice + 180g Fish Tawa Roast (Vanjaram / Mackerel) + Vazhaithandu Poriyal + Garlic Rasam',
            quantity: '1 cup rice + 180g fish + 1 cup banana stem + 1 cup rasam',
            notes: 'Banana stem actively flushes water weight.',
            alternatives: 'Vegetarian: 150g Paneer Tawa Fry + Vazhaithandu.',
          },
          {
            id: 'it-tn-rec-fri-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Boiled Sweet Potato + 3 Boiled Egg Whites + Black Coffee',
            quantity: '120g sweet potato + 3 egg whites + coffee',
            notes: 'Clean gym endurance.',
            alternatives: 'Roasted peanuts + banana.',
          },
          {
            id: 'it-tn-rec-fri-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Phulkas + 150g Pepper Chicken Breast Sukka + Raitha',
            quantity: '2 phulkas + 150g chicken + 1 cup raitha',
            notes: 'Sustained overnight amino acid delivery.',
            alternatives: 'Vegetarian: 2 Phulkas + 120g Paneer Bhurji.',
          },
        ],
      },
      {
        id: 'm-tn-rec-sat',
        slot: 'Saturday · Weekend Glycogen Depletion & Clean Finish',
        time: '6:30 AM – 8:30 PM',
        items: [
          {
            id: 'it-tn-rec-sat-1',
            food: 'Early Morning (6:30 AM): Warm Methi Water',
            quantity: '1 glass warm water with soaked fenugreek',
            notes: 'Digestion and glucose control.',
            alternatives: 'Warm jeera water.',
          },
          {
            id: 'it-tn-rec-sat-2',
            food: 'Breakfast (8:00 AM): 3 Steamed Idlis + 4 Boiled Egg Whites + Sambar',
            quantity: '3 idlis + 4 egg whites + sambar',
            notes: 'Fast-digesting clean breakfast.',
            alternatives: 'Vegetarian: 3 Idlis + 1 cup Pasi Payiru sundal.',
          },
          {
            id: 'it-tn-rec-sat-3',
            food: 'Mid-Morning (11:00 AM): 1 Country Guava + Neer Mor',
            quantity: '1 guava + 1 glass buttermilk',
            notes: 'High fiber and probiotics.',
            alternatives: 'Tender coconut water.',
          },
          {
            id: 'it-tn-rec-sat-4',
            food: 'Lunch (1:30 PM): 1 Cup Thinai Millet Rice + 180g Chicken Breast Curry + Kovaikkai Poriyal + Curd',
            quantity: '1 cup thinai + 180g chicken + 1 cup ivy gourd + 1/2 cup curd',
            notes: 'Low-glycemic recomp lunch.',
            alternatives: 'Vegetarian: 120g Soya chunks curry + Curd.',
          },
          {
            id: 'it-tn-rec-sat-5',
            food: 'Pre/Post-Workout (5:00 PM): 1 Cup Kaara Pori with Roasted Pottukadali & Groundnuts + Black Coffee',
            quantity: '1 bowl puffed rice with 3 tbsp fried gram & peanuts + coffee',
            notes: 'Crunchy clean energy.',
            alternatives: '1 Sevvazhai banana.',
          },
          {
            id: 'it-tn-rec-sat-6',
            food: 'Dinner (8:00 PM): 2 Whole Wheat Phulkas + 150g Meen Tawa Fry + Rasam & Curd',
            quantity: '2 phulkas + 150g fish + rasam + curd',
            notes: 'High protein recovery meal before Sunday rest.',
            alternatives: 'Vegetarian: 2 Phulkas + 120g Paneer Bhurji.',
          },
        ],
      },
    ],
  },
,
{
  "id": "dt-tn-budget-protein-6d",
  "name": "Tamil Nadu 6-Day Student / Budget-Friendly High-Protein Food Chart",
  "goal": "High protein",
  "description": "Engineered specifically for college students and budget-conscious lifters across Tamil Nadu (costing under ₹100–130/day!). Maximizes protein per rupee with high-yield Tamil market staples: Farm Eggs (₹6/egg), Soya Chunks / Meal Maker (₹35/box = 104g protein!), Green Gram (Pasi Payiru), Roasted Peanuts (Nilakkadalai), Ragi Flour, and Bananas.",
  "calories": 2000,
  "protein": 130,
  "carbs": 240,
  "fat": 55,
  "mealCount": 6,
  "meals": [
    {
      "id": "m-tn-bud-mon",
      "slot": "Monday · Maximum Protein Per Rupee Protocol",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-bud-mon-1",
          "food": "Early Morning (6:30 AM): Warm Water with 1 Tsp Soaked Methi / Jeera",
          "quantity": "1 large glass (300ml)",
          "notes": "Zero cost digestive primer and metabolism jumpstart.",
          "alternatives": "Plain warm water."
        },
        {
          "id": "it-tn-bud-mon-2",
          "food": "Breakfast (8:00 AM): 3 Steamed Idlis + 3 Boiled Farm Eggs (2 whites + 1 whole) + Sambar",
          "quantity": "3 idlis + 3 eggs (Cost: ~₹18 for eggs) + 1 cup sambar",
          "notes": "Delivers 20g high biological value protein for under ₹25.",
          "alternatives": "Vegetarian: 3 Idlis + 1 cup Boiled Pasi Payiru (Green Gram) Sundal."
        },
        {
          "id": "it-tn-bud-mon-3",
          "food": "Mid-Morning (11:00 AM): 1 Poovan Banana (பூவன் பழம் - ₹4) + 1 Glass Neer Mor (மோர் - ₹5)",
          "quantity": "1 banana + 1 cup buttermilk with curry leaves & salt",
          "notes": "Potassium, quick workout carbs, and gut cooling for less than ₹10.",
          "alternatives": "1 Country Guava (₹10)."
        },
        {
          "id": "it-tn-bud-mon-4",
          "food": "Lunch (1:30 PM): 1.5 Cups Ponni Rice + 75g Soya Chunks (Meal Maker) Curry (₹15) + Cabbage / Beans Poriyal + Rasam",
          "quantity": "1.5 cups rice + 75g dry soya chunks cooked in spicy onion-tomato gravy + 1 cup poriyal + rasam",
          "notes": "75g soya chunks yields an incredible 39g pure protein for just ₹15!",
          "alternatives": "3 Boiled Eggs in thick tomato curry + Rice."
        },
        {
          "id": "it-tn-bud-mon-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Cup Roasted Groundnuts (வறுத்த நிலக்கடலை - ₹10) + Black Filter Coffee / Tea (₹5)",
          "quantity": "40g peanuts + 1 cup black coffee (no sugar)",
          "notes": "10g plant protein, healthy fats, and natural caffeine workout fuel.",
          "alternatives": "1 cup Kaara Pori with roasted pottukadali (பொட்டுக்கடலை)."
        },
        {
          "id": "it-tn-bud-mon-6",
          "food": "Dinner (8:00 PM): 3 Whole Wheat Phulkas (சப்பாத்தி) + Muttai Podimas (2 Farm Eggs scrambled with onions - ₹12) + Dal / Rasam",
          "quantity": "3 phulkas + 2-egg podimas + 1 cup dal",
          "notes": "Cheap, nutritious, complete 25g protein dinner. Total day budget under ₹110!",
          "alternatives": "Vegetarian: 3 Phulkas + 50g Soya Chunks Bhurji."
        }
      ]
    },
    {
      "id": "m-tn-bud-tue",
      "slot": "Tuesday · Ragi & Green Gram High-Yield Fuel",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-bud-tue-1",
          "food": "Early Morning (6:30 AM): Warm Jeera Water",
          "quantity": "1 glass",
          "notes": "Natural digestion stimulant.",
          "alternatives": "Warm water with lemon."
        },
        {
          "id": "it-tn-bud-tue-2",
          "food": "Breakfast (8:00 AM): 2 Ragi Dosas (கேழ்வரகு தோசை) + 3 Boiled Eggs (2 whites + 1 whole) + Tomato Thokku",
          "quantity": "2 ragi dosas + 3 eggs + chutney",
          "notes": "Ragi flour costs just ₹40/kg and provides high calcium and sustained energy.",
          "alternatives": "Vegetarian: 2 Ragi dosas + 1 cup Sprouted Moong Dal (முளைகட்டிய பயறு)."
        },
        {
          "id": "it-tn-bud-tue-3",
          "food": "Mid-Morning (11:00 AM): 1 Cup Boiled Peanuts (வேகவைத்த நிலக்கடலை)",
          "quantity": "50g boiled groundnuts",
          "notes": "Nutrient-dense natural protein and minerals.",
          "alternatives": "1 Poovan banana + Neer Mor."
        },
        {
          "id": "it-tn-bud-tue-4",
          "food": "Lunch (1:30 PM): 1.5 Cups Ponni Rice + 1 Cup Pasi Payiru Kootu (பச்சைப்பயறு கூட்டு) + Keerai Poriyal + Garlic Rasam",
          "quantity": "1.5 cups rice + 1 cup thick green gram dal + 1 cup greens + rasam",
          "notes": "Green gram (Pasi payiru) is the easiest lentil on student digestion.",
          "alternatives": "100g Soya chunks curry + rice."
        },
        {
          "id": "it-tn-bud-tue-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Poovan Banana + Black Coffee + 2 Boiled Egg Whites",
          "quantity": "1 banana + coffee + 2 egg whites",
          "notes": "Quick-release glycogen and amino acids.",
          "alternatives": "Pottukadali drink (2 tbsp powder in water)."
        },
        {
          "id": "it-tn-bud-tue-6",
          "food": "Dinner (8:00 PM): 2 Kal Dosas + 2 Eggs in Spicy Onion Curry (முட்டை குழம்பு) + Cucumber slices",
          "quantity": "2 kal dosas + 2 eggs in curry",
          "notes": "Economical home-style dinner loaded with 20g protein.",
          "alternatives": "Vegetarian: 2 Kal dosas + 70g Soya chunks gravy."
        }
      ]
    },
    {
      "id": "m-tn-bud-wed",
      "slot": "Wednesday · Black Chana & Egg Power Day",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-bud-wed-1",
          "food": "Early Morning (6:30 AM): Warm Lemon Water",
          "quantity": "1 glass",
          "notes": "Vitamin C and hydration.",
          "alternatives": "Warm water with cumin."
        },
        {
          "id": "it-tn-bud-wed-2",
          "food": "Breakfast (8:00 AM): 3 Steamed Idlis + 1 Large Bowl Karuppu Konda Kadalai Sundal (கருப்பு கொண்டைக்கடலை) + Sambar",
          "quantity": "3 idlis + 120g boiled black chickpeas + sambar",
          "notes": "Black chana costs ₹90/kg and yields 20g protein and 15g fiber per cup.",
          "alternatives": "3 Idlis + 3 boiled egg whites."
        },
        {
          "id": "it-tn-bud-wed-3",
          "food": "Mid-Morning (11:00 AM): 1 Glass Neer Mor with Ginger & Curry Leaves (மோர் - ₹5)",
          "quantity": "250ml buttermilk",
          "notes": "Probiotic digestion aid.",
          "alternatives": "1 Country Guava."
        },
        {
          "id": "it-tn-bud-wed-4",
          "food": "Lunch (1:30 PM): 1.5 Cups Ponni Rice + 75g Soya Chunks Kurma + Murungai Keerai Poriyal + Rasam",
          "quantity": "1.5 cups rice + 75g soya chunks + 1 cup drumstick greens + 1 cup rasam",
          "notes": "Drumstick leaves cost ₹10/bunch at Uzhavar Sandhai; massive natural iron and calcium.",
          "alternatives": "3 Boiled eggs in curry + rice."
        },
        {
          "id": "it-tn-bud-wed-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Bowl Kaara Pori with Roasted Gram (பொட்டுக்கடலை பொரி) + Black Coffee",
          "quantity": "1 bowl puffed rice with 3 tbsp fried gram + coffee",
          "notes": "Affordable, clean carbohydrate and protein crunch.",
          "alternatives": "1 banana + peanuts."
        },
        {
          "id": "it-tn-bud-wed-6",
          "food": "Dinner (8:00 PM): 3 Whole Wheat Chapatis + 3 Boiled Egg Whites & 1 Whole Egg Curry + Curd",
          "quantity": "3 chapatis + 4 eggs total in gravy + 1/2 cup curd",
          "notes": "Heavy protein recovery before sleep.",
          "alternatives": "Vegetarian: 3 Chapatis + 100g Soya chunks bhurji + Curd."
        }
      ]
    },
    {
      "id": "m-tn-bud-thu",
      "slot": "Thursday · Wheat Rava & Legume Strength",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-bud-thu-1",
          "food": "Early Morning (6:30 AM): Warm Methi Water",
          "quantity": "1 glass",
          "notes": "Gut health and blood sugar stability.",
          "alternatives": "Warm jeera water."
        },
        {
          "id": "it-tn-bud-thu-2",
          "food": "Breakfast (8:00 AM): Godhumai Rava Upma with Peanuts & Green Peas + 3 Boiled Egg Whites",
          "quantity": "1 plate wheat rava upma + 3 egg whites",
          "notes": "Low glycemic, filling, and inexpensive.",
          "alternatives": "Vegetarian: Upma with 50g peanuts and green peas."
        },
        {
          "id": "it-tn-bud-thu-3",
          "food": "Mid-Morning (11:00 AM): 1 Country Guava (நாட்டு கொய்யா - ₹10)",
          "quantity": "1 guava",
          "notes": "4x vitamin C of imported fruits.",
          "alternatives": "1 Poovan banana."
        },
        {
          "id": "it-tn-bud-thu-4",
          "food": "Lunch (1:30 PM): 1.5 Cups Ponni Rice + 1 Cup Thick Toor Dal / Sambar with Drumstick & Carrots + 2 Boiled Eggs + Rasam",
          "quantity": "1.5 cups rice + 1 cup dal + 2 eggs + rasam",
          "notes": "Complete essential amino acid profile.",
          "alternatives": "Vegetarian: 1.5 cups rice + 75g Soya chunks curry + Dal."
        },
        {
          "id": "it-tn-bud-thu-5",
          "food": "Pre/Post-Workout (5:00 PM): Roasted Pottukadali Drink (2 tbsp in 250ml water/milk) + 1 Banana",
          "quantity": "1 glass drink + 1 banana",
          "notes": "Instant 10g protein and glycogen.",
          "alternatives": "Boiled peanuts."
        },
        {
          "id": "it-tn-bud-thu-6",
          "food": "Dinner (8:00 PM): 3 Whole Wheat Phulkas + 75g Soya Chunks Pepper Fry + 1 Cup Aavin Curd",
          "quantity": "3 phulkas + 75g soya chunks + 1 cup curd",
          "notes": "Budget-friendly 40g protein dinner.",
          "alternatives": "2 Kal dosas + Muttai podimas."
        }
      ]
    },
    {
      "id": "m-tn-bud-fri",
      "slot": "Friday · Sathu Maavu & High-Fiber Protein",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-bud-fri-1",
          "food": "Early Morning (6:30 AM): Warm Jeera Water",
          "quantity": "1 glass",
          "notes": "Digestive activation.",
          "alternatives": "Warm water with lemon."
        },
        {
          "id": "it-tn-bud-fri-2",
          "food": "Breakfast (8:00 AM): 3 Steamed Idlis + 3 Boiled Eggs (2 whites + 1 whole) + Mint Coriander Chutney",
          "quantity": "3 idlis + 3 eggs + chutney",
          "notes": "Clean, easily digested, zero cooking oil.",
          "alternatives": "Vegetarian: 3 Idlis + 1 cup Pasi Payiru sundal."
        },
        {
          "id": "it-tn-bud-fri-3",
          "food": "Mid-Morning (11:00 AM): 1 Glass Neer Mor with Ginger & Curry Leaves (மோர்)",
          "quantity": "250ml buttermilk",
          "notes": "Probiotic and natural cooling.",
          "alternatives": "1 banana."
        },
        {
          "id": "it-tn-bud-fri-4",
          "food": "Lunch (1:30 PM): 1.5 Cups Ponni Rice + 75g Soya Chunks & Potato Curry + Cabbage Poriyal + Garlic Rasam",
          "quantity": "1.5 cups rice + 75g soya chunks + 1 cup cabbage + 1 cup rasam",
          "notes": "High protein density on a minimal student grocery bill.",
          "alternatives": "3 Boiled eggs in curry + rice."
        },
        {
          "id": "it-tn-bud-fri-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Bowl Sathu Maavu Kanji (சத்து மாவு கஞ்சி - Homemade health mix porridge)",
          "quantity": "1 bowl porridge made with water or Aavin blue milk",
          "notes": "Traditional multigrain porridge containing ragi, kambu, maize, and roasted gram.",
          "alternatives": "Roasted peanuts + black coffee."
        },
        {
          "id": "it-tn-bud-fri-6",
          "food": "Dinner (8:00 PM): 3 Whole Wheat Chapatis + Muttai Podimas (3 Farm Eggs with onions - ₹18) + Tomato Onion Raitha",
          "quantity": "3 chapatis + 3-egg podimas + 1 cup raitha",
          "notes": "Delicious 25g protein student dinner.",
          "alternatives": "Vegetarian: 3 Chapatis + 70g Soya chunks bhurji + Raitha."
        }
      ]
    },
    {
      "id": "m-tn-bud-sat",
      "slot": "Saturday · Weekend Complete Amino Acid Finish",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-bud-sat-1",
          "food": "Early Morning (6:30 AM): Warm Lemon Water",
          "quantity": "1 glass",
          "notes": "System hydration.",
          "alternatives": "Warm jeera water."
        },
        {
          "id": "it-tn-bud-sat-2",
          "food": "Breakfast (8:00 AM): 2 Ragi Dosas + 3 Boiled Egg Whites + Sambar",
          "quantity": "2 ragi dosas + 3 egg whites + sambar",
          "notes": "Calcium and bioavailable amino acids.",
          "alternatives": "Vegetarian: 2 Ragi dosas + 1 cup Karuppu Chana sundal."
        },
        {
          "id": "it-tn-bud-sat-3",
          "food": "Mid-Morning (11:00 AM): 1 Poovan Banana + 1 Cup Boiled Peanuts",
          "quantity": "1 banana + 40g peanuts",
          "notes": "Healthy fats, potassium, and minerals.",
          "alternatives": "1 Country Guava."
        },
        {
          "id": "it-tn-bud-sat-4",
          "food": "Lunch (1:30 PM): 1.5 Cups Ponni Rice + 1 Cup Pasi Payiru Kootu + 2 Boiled Eggs + Keerai Masiyal",
          "quantity": "1.5 cups rice + 1 cup green gram dal + 2 eggs + 1 cup greens",
          "notes": "Clean whole foods hitting 30g+ protein.",
          "alternatives": "Vegetarian: 75g Soya chunks curry + Dal + Rice."
        },
        {
          "id": "it-tn-bud-sat-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Bowl Kaara Pori with Roasted Gram + Black Coffee",
          "quantity": "1 bowl puffed rice with fried gram + coffee",
          "notes": "Workout fuel for under ₹10.",
          "alternatives": "Sathu Maavu porridge."
        },
        {
          "id": "it-tn-bud-sat-6",
          "food": "Dinner (8:00 PM): 3 Whole Wheat Phulkas + 75g Soya Chunks Curry + Curd & Rasam",
          "quantity": "3 phulkas + 75g soya chunks + curd + rasam",
          "notes": "Concludes the budget-friendly week with 130g protein. Total 6-day food cost under ₹700!",
          "alternatives": "Vegetarian: 3 Phulkas + 100g Paneer Bhurji + Curd."
        }
      ]
    }
  ]
},
{
  "id": "dt-tn-women-tone-6d",
  "name": "Tamil Nadu 6-Day Women's Tone, Hourglass & Hormone Balance Food Chart",
  "goal": "Weight loss",
  "description": "A coach-engineered 1450 kcal nutritional blueprint specifically designed for women trainees across Tamil Nadu (Monday to Saturday, Sunday Maintenance). Balances female hormones, boosts iron to prevent anemia (Murungai Keerai, Country Pomegranate, Dates), flushes bloating (Vazhaithandu, Jeera water, Neer Mor), and delivers 110g+ lean protein for firm glutes and a sculpted waistline.",
  "calories": 1450,
  "protein": 110,
  "carbs": 140,
  "fat": 38,
  "mealCount": 6,
  "meals": [
    {
      "id": "m-tn-wom-mon",
      "slot": "Monday · Iron Enrichment & Anti-Bloat Kickoff",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-wom-mon-1",
          "food": "Early Morning (6:30 AM): Warm Jeera & Methi Water (சீரகம் வெந்தயத் தண்ணீர்)",
          "quantity": "1 glass (300ml) with soaked cumin and fenugreek",
          "notes": "Relieves water retention, promotes healthy insulin sensitivity, and soothes hormonal cramps.",
          "alternatives": "Warm water with freshly squeezed lemon."
        },
        {
          "id": "it-tn-wom-mon-2",
          "food": "Breakfast (8:00 AM): 2 Soft Steamed Idlis + 3 Boiled Egg Whites + Drumstick & Tomato Sambar",
          "quantity": "2 idlis + 3 egg whites + 1 cup sambar",
          "notes": "Clean protein with zero dietary fat. Suppresses mid-morning sweet cravings.",
          "alternatives": "Vegetarian: 2 Idlis + 1 cup Pasi Payiru (Green Gram) Sundal."
        },
        {
          "id": "it-tn-wom-mon-3",
          "food": "Mid-Morning (11:00 AM): Fresh Tender Coconut Water (இளநீர்) + 2 Lion Dates (பேரீச்சம்பழம்)",
          "quantity": "1 tender coconut + 2 dates",
          "notes": "Restores electrolytes and delivers natural plant iron for energetic gym stamina.",
          "alternatives": "1 glass Neer Mor with curry leaves and ginger."
        },
        {
          "id": "it-tn-wom-mon-4",
          "food": "Lunch (1:30 PM): 1 Cup Thinai Millet Rice (தினை சாதம்) + 120g Chicken Breast Pepper Sukka + Murungai Keerai Poriyal (முருங்கைக்கீரை) + Garlic Pepper Rasam",
          "quantity": "1 cup cooked foxtail millet + 120g chicken breast + 1 cup drumstick greens + 1 cup rasam",
          "notes": "Moringa leaves provide 25x more iron than spinach, preventing female fatigue and hair thinning.",
          "alternatives": "Vegetarian: 100g Fresh Aavin Paneer Tawa Fry + 1 cup Dal + Murungai Keerai."
        },
        {
          "id": "it-tn-wom-mon-5",
          "food": "Pre/Post-Workout (5:00 PM): Green Tea or Sukku Malli Tea + 1 Small Bowl Karuppu Chana Sundal (கருப்பு சுண்டல்)",
          "quantity": "1 cup herbal tea + 60g boiled black chickpeas",
          "notes": "High-fiber, slow-burning complex carbs for evening workout stamina.",
          "alternatives": "Roasted peanuts (25g)."
        },
        {
          "id": "it-tn-wom-mon-6",
          "food": "Dinner (8:00 PM): 2 Whole Wheat Phulkas + Vazhaithandu Poriyal (வாழைத்தண்டு பொரியல்) + 2 Boiled Egg Whites Podimas",
          "quantity": "2 phulkas + 1 cup banana stem poriyal + 2 egg whites scrambled with onions",
          "notes": "Banana stem flushes visceral water weight to give a flat, tight abdominal wall.",
          "alternatives": "Vegetarian: 2 Phulkas + 80g Paneer Bhurji + Vazhaithandu."
        }
      ]
    },
    {
      "id": "m-tn-wom-tue",
      "slot": "Tuesday · Calcium & Bone Strength Protocol",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-wom-tue-1",
          "food": "Early Morning (6:30 AM): Poosanaikkai (Ash Gourd) Juice with Pepper",
          "quantity": "1 glass (250ml) fresh juice",
          "notes": "Traditional Tamil beauty and detox tonic. Clears skin blemishes and reduces systemic heat.",
          "alternatives": "Warm jeera water."
        },
        {
          "id": "it-tn-wom-tue-2",
          "food": "Breakfast (8:00 AM): 2 Ragi Dosas (கேழ்வரகு தோசை) + 3 Boiled Egg Whites + Tomato Chutney",
          "quantity": "2 ragi dosas + 3 egg whites + 2 tbsp chutney",
          "notes": "Ragi has 344mg calcium per 100g — essential for female bone mineral density.",
          "alternatives": "Vegetarian: 2 Ragi dosas + 1 cup Sprouted Moong Dal."
        },
        {
          "id": "it-tn-wom-tue-3",
          "food": "Mid-Morning (11:00 AM): 1 Nattu Koyyappazham (Country Guava with Chilli Salt)",
          "quantity": "1 medium guava",
          "notes": "High pectin fiber prevents constipation and keeps skin glowing with vitamin C.",
          "alternatives": "1 slice fresh Papaya."
        },
        {
          "id": "it-tn-wom-tue-4",
          "food": "Lunch (1:30 PM): 1 Cup Samai Millet Rice (சாமை சாதம்) + 120g Vanjaram / Sankara Meen Tawa Fry + Beans Carrot Poriyal + Milagu Rasam",
          "quantity": "1 cup cooked samai + 120g fish tawa pan-fried + 1 cup veggies + 1 cup rasam",
          "notes": "Seer fish provides anti-inflammatory Omega-3s that balance female endocrine hormones.",
          "alternatives": "Vegetarian: 100g Soya Chunks Curry + 1 cup Toor Dal + Samai rice."
        },
        {
          "id": "it-tn-wom-tue-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Cup Pasi Payiru Sundal (பச்சைப்பயறு) + Filter Coffee Decoction (Black)",
          "quantity": "80g boiled green gram + black coffee",
          "notes": "Natural caffeine boost and lean plant amino acids.",
          "alternatives": "1 small Poovan banana + roasted chana."
        },
        {
          "id": "it-tn-wom-tue-6",
          "food": "Dinner (8:00 PM): 2 Soft Kal Dosas + 100g Chicken Breast Pepper Sukka + Keerai Masiyal",
          "quantity": "2 kal dosas + 100g chicken + 1 cup greens masiyal",
          "notes": "Fermented kal dosa is gentle on stomach; leaves zero morning bloating.",
          "alternatives": "Vegetarian: 2 Kal dosas + 80g Paneer Bhurji + Keerai."
        }
      ]
    },
    {
      "id": "m-tn-wom-wed",
      "slot": "Wednesday · Collagen & Lean Muscle Sculpting",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-wom-wed-1",
          "food": "Early Morning (6:30 AM): Murungai Keerai Clear Broth (முருங்கைக்கீரை சூப்)",
          "quantity": "1 bowl fresh soup with shallots & cumin",
          "notes": "High iron and chlorophyll for natural blood building.",
          "alternatives": "Warm methi water."
        },
        {
          "id": "it-tn-wom-wed-2",
          "food": "Breakfast (8:00 AM): Sigappu Aval Upma (சிகப்பு அவல் with peanuts & carrots) + 3 Boiled Egg Whites",
          "quantity": "1 plate red poha + 3 egg whites",
          "notes": "Red rice flakes provide iron, zinc, and slow-burning morning carbohydrates.",
          "alternatives": "Vegetarian: Red poha with 50g paneer cubes."
        },
        {
          "id": "it-tn-wom-wed-3",
          "food": "Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)",
          "quantity": "1 whole coconut",
          "notes": "Hydrates skin and cellular tissues.",
          "alternatives": "Neer Mor with mint and ginger."
        },
        {
          "id": "it-tn-wom-wed-4",
          "food": "Lunch (1:30 PM): 1 Cup Ponni Boiled Rice + 120g Country Chicken Curry + Vendakkai Poriyal + Garlic Rasam",
          "quantity": "1 cup rice + 120g chicken + 1 cup ladies finger + 1 cup rasam",
          "notes": "Country chicken broth is rich in natural collagen for joint flexibility and skin firmness.",
          "alternatives": "Vegetarian: 100g Fresh Aavin Paneer Curry + 1 cup Dal + Rice."
        },
        {
          "id": "it-tn-wom-wed-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Small Boiled Sweet Potato (சர்க்கரைவள்ளி கிழங்கு) + Green Tea",
          "quantity": "100g sweet potato + green tea",
          "notes": "Clean gym endurance carbs with zero added sugars.",
          "alternatives": "Boiled peanuts (30g)."
        },
        {
          "id": "it-tn-wom-wed-6",
          "food": "Dinner (8:00 PM): 2 Whole Wheat Phulkas + 100g Fish Tawa Roast (Vanjaram) + Vazhaithandu Kootu",
          "quantity": "2 phulkas + 100g fish + 1 cup banana stem kootu",
          "notes": "Sheds subcutaneous water retention before sleep.",
          "alternatives": "Vegetarian: 2 Phulkas + 80g Soya Chunks Curry + Vazhaithandu."
        }
      ]
    },
    {
      "id": "m-tn-wom-thu",
      "slot": "Thursday · Hormonal Health & Nitric Oxide Boost",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-wom-thu-1",
          "food": "Early Morning (6:30 AM): Warm Lemon & Cinnamon Water",
          "quantity": "1 glass warm water + 1/2 lemon + pinch of true cinnamon",
          "notes": "Sensitizes insulin receptors; helps manage PCOS / hormonal weight gain.",
          "alternatives": "Warm jeera water."
        },
        {
          "id": "it-tn-wom-thu-2",
          "food": "Breakfast (8:00 AM): 3 Steamed Idlis + 2 Egg White Omelette with Small Onions & Curry Leaves + Sambar",
          "quantity": "3 idlis + 2 egg whites + sambar",
          "notes": "Shallots (Chinna Vengayam) provide quercetin antioxidants for heart and hormonal balance.",
          "alternatives": "Vegetarian: 3 Idlis + 1 cup Vellai Konda Kadalai Sundal."
        },
        {
          "id": "it-tn-wom-thu-3",
          "food": "Mid-Morning (11:00 AM): 1 Cup Nattu Mathulai (Country Pomegranate Seeds)",
          "quantity": "1 cup fresh pomegranate pearls",
          "notes": "Potent polyphenols support arterial blood flow and female hormonal equilibrium.",
          "alternatives": "1 Country Guava."
        },
        {
          "id": "it-tn-wom-thu-4",
          "food": "Lunch (1:30 PM): 1 Cup Kuthiraivali Millet Rice (குதிரைவாலி சாதம்) + 120g Chicken Breast Pepper Sukka + Cabbage Poriyal + Curd",
          "quantity": "1 cup barnyard millet + 120g chicken + 1 cup cabbage + 1/2 cup curd",
          "notes": "Barnyard millet has highest soluble fiber, stabilizing estrogen levels.",
          "alternatives": "Vegetarian: 100g Soya Chunks Thokku + 1 cup Dal + Curd."
        },
        {
          "id": "it-tn-wom-thu-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Cup Boiled Peanuts (வேர்க்கடலை) + Black Coffee",
          "quantity": "40g boiled peanuts + black coffee",
          "notes": "Plant monounsaturated fats and arginine for muscle tone.",
          "alternatives": "Kaara Pori with roasted gram."
        },
        {
          "id": "it-tn-wom-thu-6",
          "food": "Dinner (8:00 PM): 2 Ragi Dosas + Muttai Thokku (2 Boiled Eggs in onion-tomato gravy) + Cucumber slices",
          "quantity": "2 ragi dosas + 2 eggs in gravy + cucumber",
          "notes": "High calcium and complete amino acid profile for overnight recovery.",
          "alternatives": "Vegetarian: 2 Ragi dosas + 80g Paneer Bhurji + Cucumber."
        }
      ]
    },
    {
      "id": "m-tn-wom-fri",
      "slot": "Friday · Cooling Pearl Millet & Glute Toning",
      "time": "6:30 AM – 8:30 PM",
      "items": [
        {
          "id": "it-tn-wom-fri-1",
          "food": "Early Morning (6:30 AM): Warm Methi Water",
          "quantity": "1 glass warm water with soaked fenugreek",
          "notes": "Lowers bloating and cools internal body heat.",
          "alternatives": "Warm jeera water."
        },
        {
          "id": "it-tn-wom-fri-2",
          "food": "Breakfast (8:00 AM): 2 Kambu Dosas (கம்பு தோசை) + 3 Boiled Egg Whites + Tomato Onion Thokku",
          "quantity": "2 pearl millet dosas + 3 egg whites + 2 tbsp thokku",
          "notes": "Pearl millet (Kambu) is naturally cooling and packed with iron and zinc.",
          "alternatives": "Vegetarian: 2 Kambu dosas + 1 cup Pasi Payiru sundal."
        },
        {
          "id": "it-tn-wom-fri-3",
          "food": "Mid-Morning (11:00 AM): Tender Coconut Water (இளநீர்)",
          "quantity": "1 whole coconut",
          "notes": "Cellular electrolyte rebalancing.",
          "alternatives": "Neer Mor with curry leaves and ginger."
        },
        {
          "id": "it-tn-wom-fri-4",
          "food": "Lunch (1:30 PM): 1 Cup Ponni Rice + 120g Nethili Meen Kuzhambu (நெத்திலி மீன்) + Kovaikkai Poriyal + Poondu Rasam",
          "quantity": "1 cup rice + 120g anchovies in tamarind gravy + 1 cup ivy gourd + 1 cup garlic rasam",
          "notes": "Anchovies provide massive organic calcium and vitamin D.",
          "alternatives": "Vegetarian: 100g Fresh Paneer Curry + Dal + Ivy gourd."
        },
        {
          "id": "it-tn-wom-fri-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Poovan Banana + Green Tea or Filter Coffee",
          "quantity": "1 banana + coffee",
          "notes": "Fast-acting workout fuel.",
          "alternatives": "1 cup Karuppu Chana sundal."
        },
        {
          "id": "it-tn-wom-fri-6",
          "food": "Dinner (8:00 PM): 2 Whole Wheat Phulkas + 100g Chicken Breast Sukka + Vazhaithandu Poriyal",
          "quantity": "2 phulkas + 100g chicken + 1 cup banana stem",
          "notes": "Lean protein and sodium-clearing fiber.",
          "alternatives": "Vegetarian: 2 Phulkas + 80g Paneer Tikka + Vazhaithandu."
        }
      ]
    },
    {
      "id": "m-tn-wom-sat",
      "slot": "Saturday · Weekend Clean Finish & Deep Recovery",
      "time": "6:30 AM – 9:00 PM",
      "items": [
        {
          "id": "it-tn-wom-sat-1",
          "food": "Early Morning (6:30 AM): Warm Jeera Water with Lemon",
          "quantity": "1 glass",
          "notes": "Metabolic refresh.",
          "alternatives": "Warm water with tulsi."
        },
        {
          "id": "it-tn-wom-sat-2",
          "food": "Breakfast (8:00 AM): 3 Steamed Idlis + 3 Boiled Egg Whites + Sambar & Mint Chutney",
          "quantity": "3 idlis + 3 egg whites + sambar + chutney",
          "notes": "Gentle on digestion, clean energy for Saturday training.",
          "alternatives": "Vegetarian: 3 Idlis + 1 cup Karuppu Chana sundal."
        },
        {
          "id": "it-tn-wom-sat-3",
          "food": "Mid-Morning (11:00 AM): 1 Country Guava + 1 Glass Neer Mor",
          "quantity": "1 guava + 1 glass buttermilk",
          "notes": "Probiotic gut health and high vitamin C.",
          "alternatives": "1 slice Papaya."
        },
        {
          "id": "it-tn-wom-sat-4",
          "food": "Lunch (1:30 PM): 1 Cup Thinai Millet Rice + 120g Fish Tawa Roast (Vanjaram / Sankara) + Cabbage Poriyal + Curd",
          "quantity": "1 cup thinai + 120g fish + 1 cup cabbage + 1/2 cup curd",
          "notes": "Lean protein and healthy fats.",
          "alternatives": "Vegetarian: 100g Soya chunks curry + Curd."
        },
        {
          "id": "it-tn-wom-sat-5",
          "food": "Pre/Post-Workout (5:00 PM): 1 Bowl Kaara Pori with Roasted Gram & Peanuts + Black Coffee",
          "quantity": "1 bowl puffed rice with fried gram & peanuts + coffee",
          "notes": "Light energy snack.",
          "alternatives": "Boiled sweet potato."
        },
        {
          "id": "it-tn-wom-sat-6",
          "food": "Dinner (8:00 PM): 2 Whole Wheat Phulkas + Egg Podimas (2 egg whites + 1 whole egg) + Warm Turmeric Milk before bed",
          "quantity": "2 phulkas + 3-egg podimas + 150ml warm Aavin milk with turmeric & black pepper at bedtime",
          "notes": "Warm turmeric pepper milk soothes central nervous system and ensures deep regenerative sleep before Sunday rest.",
          "alternatives": "Vegetarian: 2 Phulkas + 80g Paneer Bhurji + Warm Turmeric Milk."
        }
      ]
    }
  ]
}
];

// Write out to src/constants/dietTemplatesCatalog.js
const outPath = path.join(__dirname, '../src/constants/dietTemplatesCatalog.js');
const fileHeader = `// Comprehensive K7 Fitness Studio Tamil Nadu 6-Day (Monday-to-Saturday) Food Charts Catalog
// 100% locally available Tamil Nadu foods: Idli, Dosa, Ragi, Kambu, Millets, Farm Eggs, Country Chicken,
// Seer/Mackerel Fish, Soya Chunks (Meal Maker), Fresh Aavin Paneer, Sundal, Murungai Keerai, Elaneer, Neer Mor
// Engineered by Master Gym Coaches for Tamil Nadu gym trainees (Monday to Saturday, Sunday Maintenance)

export const ALL_DIET_TEMPLATES = `;

const jsContent = fileHeader + JSON.stringify(DIET_TEMPLATES, null, 2) + ';\n';
fs.writeFileSync(outPath, jsContent, 'utf8');

console.log(`Successfully generated ${DIET_TEMPLATES.length} Tamil Nadu diet templates in ${outPath}`);

DIET_TEMPLATES.forEach((t, i) => {
  console.log(`[${i+1}] ${t.name} -> ${t.meals.length} days (Calories: ${t.calories} kcal | Protein: ${t.protein}g | Goal: ${t.goal})`);
});
