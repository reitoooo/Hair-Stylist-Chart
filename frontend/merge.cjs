const fs = require('fs');

const recipeContent = fs.readFileSync('src/pages/stylist/RecipeViewPage.tsx', 'utf-8');
const calcContent = fs.readFileSync('src/pages/stylist/ChemicalCalculatorPage.tsx', 'utf-8');

// Extract constants and functions from Calculator
const constantsRegex = /const TREATMENT_TYPES.*?function analyzeColor/s;
const calcConsts = calcContent.match(constantsRegex)[0].replace('function analyzeColor', '');
const analyzeColorFunc = calcContent.match(/function analyzeColor.*?^}/ms)[0];

// Extract state from Calculator
const stateRegex = /\/\/ Form state.*?const \[isCalculating, setIsCalculating\] = useState\(false\);/s;
const calcState = calcContent.match(stateRegex)[0];

// Extract handleCalculate from Calculator
const handleCalculate = calcContent.match(/const handleCalculate = async \(\) => \{.*?^  \};/ms)[0];

// Extract getRiskColor and getRiskLabel
const utilsFuncs = calcContent.match(/const getRiskColor =.*?^  \};/ms)[0] + '\n\n' + calcContent.match(/const getRiskLabel =.*?^  \};/ms)[0];

// Extract Calculator UI
let calcUI = calcContent.match(/<div className="grid grid-cols-2 gap-lg">.*?^        <\/div>/ms)[0];
calcUI = calcUI.replace(/result/g, 'calcResult');
calcUI = calcUI.replace(/setCalcResult/g, 'setResult'); // fix reverse mapping
calcUI = calcUI.replace(/calcResult\.risk/g, 'calcResult?.risk');
calcUI = calcUI.replace(/calcResult\.recommended/g, 'calcResult?.recommended');
calcUI = calcUI.replace(/setResult/g, 'setCalcResult');

// Extract useEffect inside calculator for calc state change
let calcUseEffect = calcContent.match(/useEffect\(\(\) => \{\s*if \(calcResult.*?\s*\}, \[.*?\]\);/s);
if (calcUseEffect) calcUseEffect = calcUseEffect[0];

// Update RecipeViewPage activeTab state
let newRecipe = recipeContent.replace(
  /const \[activeTab, setActiveTab\] = useState<'recipe' \| 'soap' \| 'record'>\('recipe'\);/,
  "const [activeTab, setActiveTab] = useState<'recipe' | 'calculator' | 'soap' | 'record'>('recipe');\n\n" + calcState.replace(/result/g, 'calcResult')
);

// Inject handleCalculate and utils
newRecipe = newRecipe.replace(
  /const hasAllergyRisk = allergyData &&/,
  handleCalculate.replace(/setResult/g, 'setCalcResult') + '\n\n  ' + utilsFuncs + '\n\n  const hasAllergyRisk = allergyData &&'
);

// Inject constants and analyzeColor
newRecipe = newRecipe.replace(
  /const calculateDynamicRecipe =/,
  "import type { ChemicalCalculationResult } from '../../types';\n\n" + calcConsts + analyzeColorFunc + '\n\nconst calculateDynamicRecipe ='
);

// Add Tab Button
const tabButtonStr = `
              <button 
                className={\`px-lg py-sm font-semibold transition-colors \${activeTab === 'calculator' ? 'text-primary-light border-b-2 border-primary' : 'text-secondary hover:text-primary'}\`}
                style={{ padding: '0.75rem 1.5rem', borderBottom: activeTab === 'calculator' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('calculator')}
              >
                <Beaker size={16} className="inline-block mr-xs" style={{ marginRight: '6px' }} /> AI薬剤計算
              </button>
`;
newRecipe = newRecipe.replace(
  /<\/button>\s*<button \s*className={`px-lg py-sm font-semibold transition-colors \${activeTab === 'soap'/,
  '</button>' + tabButtonStr + '              <button \n                className={`px-lg py-sm font-semibold transition-colors ${activeTab === \'soap\''
);

// Insert Calculator Tab Content
const tabContentStr = `
            {/* TAB CONTENT: CALCULATOR */}
            {activeTab === 'calculator' && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-md">
                  <h2 className="text-xl font-bold flex items-center gap-sm">
                    <Beaker className="text-primary" size={24} />
                    AI薬剤計算シミュレータ
                  </h2>
                </div>
                ${calcUI}
              </div>
            )}
`;
newRecipe = newRecipe.replace(
  /{\/\* TAB CONTENT: SOAP CHART/,
  tabContentStr + '\n            {/* TAB CONTENT: SOAP CHART'
);

// Pre-fill state from recipe.customer
const useEffectStr = `
  useEffect(() => {
    if (recipe && recipe.customer) {
      const c = recipe.customer;
      setDamageLevel(c.damage_level || 3);
      setBleachCount(c.bleach_count >= 0 ? c.bleach_count : 0);
      setHasStraightening(c.has_straightening === 'yes');
      setHasPerm(c.has_perm === 'yes');
      setHasBlackDye(c.has_black_dye === 'yes');
      setHairLength(c.hair_length || 'medium');
      setPermCount(c.perm_count >= 0 ? c.perm_count : 0);
      setHairType(c.hair_type || 'normal');
      if (c.current_hair_color && c.current_hair_color !== 'consult') setCurrentColor(c.current_hair_color);
      if (c.target_color && c.target_color !== 'consult') setTargetColor(c.target_color);
    }
  }, [recipe]);
`;
newRecipe = newRecipe.replace(
  /const sendChat =/,
  useEffectStr + '\n  const sendChat ='
);

// Remove the AI Chemical Calculator button from header
newRecipe = newRecipe.replace(
  /<button \s*className="btn btn-secondary" \s*onClick=\{\(\) => navigate\(`\/stylist\/chemicals\/\$\{bookingId\}`\)\}\s*>\s*<Beaker size=\{16\} \/> AI薬剤計算ツール\s*<\/button>/,
  ''
);

fs.writeFileSync('src/pages/stylist/RecipeViewPage.tsx', newRecipe);
console.log('Merged successfully!');
