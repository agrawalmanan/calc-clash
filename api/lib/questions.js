import Papa from 'papaparse';

// Optional default Google Sheet CSV URL (leave blank if not using one yet)
export const GOOGLE_SHEET_CSV_URL = "";

// 🛡️ Fallback questions so create-room NEVER fails!
const FALLBACK_QUESTIONS = [
  {
    id: 1, topic: "Limits", type: "MCQ", question: "Evaluate: lim(x→2) (x² - 4)/(x - 2)",
    options: ["0", "2", "4", "Does not exist"], correct: 2, explanation: "Factor (x-2)(x+2)/(x-2) = x+2 → at x=2, answer is 4", points: 100
  },
  {
    id: 2, topic: "Limits", type: "NUM", question: "Evaluate: lim(x→0) (sin x)/x",
    options: [], correct: 1, explanation: "Standard limit: lim(x→0) sin(x)/x = 1", points: 100
  },
  {
    id: 3, topic: "Derivatives", type: "MCQ", question: "Find d/dx [x³ + 5x² - 3x + 7]",
    options: ["3x² + 10x - 3", "3x² + 5x - 3", "x⁴/4 + 5x³/3", "3x² + 10x"], correct: 0, explanation: "Power rule term by term: 3x² + 10x - 3", points: 100
  },
  {
    id: 4, topic: "Integrals", type: "NUM", question: "Evaluate: ∫₀¹ 3x² dx",
    options: [], correct: 1, explanation: "Anti-derivative is x³. [x³] from 0 to 1 = 1.", points: 100
  },
  {
    id: 5, topic: "Speed", type: "TF", question: "The derivative of e^x is e^x.",
    options: ["True", "False"], correct: 0, explanation: "Standard derivative rule: d/dx(e^x) = e^x", points: 100
  }
];

export async function fetchQuestionsFromSheet(sheetUrl = GOOGLE_SHEET_CSV_URL) {
  const targetUrl = sheetUrl && !sheetUrl.includes("YOUR_GOOGLE_SHEET") ? sheetUrl : GOOGLE_SHEET_CSV_URL;

  // Use fallback if no URL is specified
  if (!targetUrl || targetUrl.trim() === "" || targetUrl.includes("YOUR_GOOGLE_SHEET")) {
    return FALLBACK_QUESTIONS;
  }

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true, transformHeader: h => h.trim() });
    if (!parsed.data || parsed.data.length === 0) return FALLBACK_QUESTIONS;

    const questions = parsed.data
      .filter(row => row['Question'] && row['Question'].trim() !== '')
      .map((row, index) => {
        const type = (row['Type']?.trim() || 'MCQ').toUpperCase();
        
        // Support both "Opt 1" and "Option 1" header names
        const opt1 = row['Opt 1']?.trim() || row['Option 1']?.trim() || '';
        const opt2 = row['Opt 2']?.trim() || row['Option 2']?.trim() || '';
        const opt3 = row['Opt 3']?.trim() || row['Option 3']?.trim() || '';
        const opt4 = row['Opt 4']?.trim() || row['Option 4']?.trim() || '';

        // Support both "Correct Answer" and "Correct Answer (1-4)" header names
        const rawCorrect = row['Correct Answer']?.trim() || row['Correct Answer (1-4)']?.trim() || '1';
        
        let correctVal;
        if (type === 'NUM') {
          correctVal = parseFloat(rawCorrect);
        } else {
          correctVal = Math.max(0, parseInt(rawCorrect) - 1);
        }

        return {
          id: index + 1,
          topic: row['Topic']?.trim() || 'Mixed',
          type: type,
          imageUrl: row['Image URL']?.trim() || null,
          question: row['Question']?.trim(),
          options: type === 'TF' ? ['True', 'False'] : [opt1, opt2, opt3, opt4],
          correct: correctVal,
          explanation: row['Explanation']?.trim() || 'No explanation provided.',
          points: parseInt(row['Points']) || 100
        };
      });

    return questions.length > 0 ? questions : FALLBACK_QUESTIONS;
  } catch (err) {
    console.error("Fetch sheet error, using fallback questions:", err);
    return FALLBACK_QUESTIONS;
  }
}