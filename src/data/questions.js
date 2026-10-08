import Papa from 'papaparse';

// Default question set in case Google Sheets fails or is offline
export const fallbackQuestions = [
  {
    id: 1,
    topic: "Limits",
    question: "Evaluate: lim(x→2) (x² - 4) / (x - 2)",
    options: ["0", "2", "4", "Does not exist"],
    correct: 2, // index 2 = "4"
    explanation: "Factor numerator: (x-2)(x+2)/(x-2) = x+2. At x=2, answer is 4.",
    difficulty: "easy",
    timeLimit: 30,
    points: 100
  },
  {
    id: 2,
    topic: "Limits",
    question: "Evaluate: lim(x→0) sin(x) / x",
    options: ["0", "1", "∞", "Undefined"],
    correct: 1, // index 1 = "1"
    explanation: "Standard limit: lim(x→0) sin(x)/x = 1",
    difficulty: "easy",
    timeLimit: 20,
    points: 100
  },
  {
    id: 3,
    topic: "Derivatives",
    question: "Find d/dx [x³ + 5x² - 3x + 7]",
    options: ["3x² + 10x - 3", "3x² + 5x - 3", "x⁴/4 + 5x³/3", "3x² + 10x"],
    correct: 0,
    explanation: "Apply power rule term by term: d/dx(x³) = 3x², d/dx(5x²) = 10x, d/dx(-3x) = -3",
    difficulty: "easy",
    timeLimit: 25,
    points: 100
  },
  {
    id: 4,
    topic: "Derivatives",
    question: "Find d/dx [sin(x²)]",
    options: ["cos(x²)", "2x · cos(x²)", "2x · sin(x²)", "-cos(x²)"],
    correct: 1,
    explanation: "Chain rule: derivative of sin(u) is cos(u) · u'. Here u = x², so u' = 2x.",
    difficulty: "medium",
    timeLimit: 35,
    points: 150
  },
  {
    id: 5,
    topic: "Integrals",
    question: "Evaluate: ∫ 2x dx",
    options: ["x²", "x² + C", "2x² + C", "x + C"],
    correct: 1,
    explanation: "∫ 2x dx = 2(x²/2) + C = x² + C",
    difficulty: "easy",
    timeLimit: 20,
    points: 100
  },
  {
    id: 6,
    topic: "Integrals",
    question: "Evaluate: ∫₀¹ 3x² dx",
    options: ["0", "1", "3", "1/3"],
    correct: 1,
    explanation: "Anti-derivative is x³. [x³] from 0 to 1 = 1³ - 0³ = 1.",
    difficulty: "easy",
    timeLimit: 30,
    points: 100
  },
  {
    id: 7,
    topic: "Derivatives",
    question: "Find d/dx [eˣ · sin(x)]",
    options: ["eˣ cos(x)", "eˣ(sin(x) + cos(x))", "eˣ sin(x) cos(x)", "eˣ(sin(x) - cos(x))"],
    correct: 1,
    explanation: "Product rule: u'v + uv' = eˣ sin(x) + eˣ cos(x) = eˣ(sin(x) + cos(x))",
    difficulty: "medium",
    timeLimit: 40,
    points: 150
  },
  {
    id: 8,
    topic: "Applications",
    question: "Find the slope of y = x³ - 3x at x = 2",
    options: ["0", "3", "9", "12"],
    correct: 2,
    explanation: "y' = 3x² - 3. At x = 2: y'(2) = 3(4) - 3 = 9.",
    difficulty: "medium",
    timeLimit: 35,
    points: 150
  }
];

// Optional: Paste your own Google Sheet CSV URL here
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQgS-_M3s2y0YJp5A3R6-3B8m9Y8J4-xO1o-R7o-Z1X1m0A3-1/pub?output=csv"; 

export async function fetchAllQuestions() {
  if (!GOOGLE_SHEET_CSV_URL) {
    return fallbackQuestions;
  }

  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL);
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    if (!parsed.data || parsed.data.length === 0) {
      return fallbackQuestions;
    }

    return parsed.data.map((row, idx) => ({
      id: idx + 1,
      topic: row['Topic']?.trim() || "Mixed",
      question: row['Question']?.trim(),
      options: [
        row['Option 1']?.trim(),
        row['Option 2']?.trim(),
        row['Option 3']?.trim(),
        row['Option 4']?.trim()
      ],
      correct: (parseInt(row['Correct Answer (1-4)']) || 1) - 1,
      explanation: row['Explanation']?.trim() || "No explanation provided.",
      difficulty: (row['Difficulty']?.trim() || "medium").toLowerCase(),
      timeLimit: parseInt(row['Time Limit']) || 30,
      points: parseInt(row['Points']) || 100
    }));
  } catch (err) {
    console.warn("Could not load Google Sheet, using fallback questions.", err);
    return fallbackQuestions;
  }
}