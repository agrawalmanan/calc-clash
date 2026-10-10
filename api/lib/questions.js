import Papa from 'papaparse';

export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv";

export async function fetchQuestionsFromSheet(sheetUrl = GOOGLE_SHEET_CSV_URL) {
  try {
    if (!sheetUrl) return [];
    const res = await fetch(sheetUrl);
    const csvText = await res.text();
    
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true, transformHeader: h => h.trim() });
    if (!parsed.data || parsed.data.length === 0) return [];

    return parsed.data.filter(row => row['Question']?.trim()).map((row, index) => {
      const type = (row['Type']?.trim() || 'MCQ').toUpperCase();
      const rawCorrect = row['Correct Answer']?.trim() || '1';
      
      // For NUM, correct answer is the actual value. For MCQ/TF, it's the index (0-based).
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
        options: [row['Opt 1'], row['Opt 2'], row['Opt 3'], row['Opt 4']].map(o => o?.trim() || ''),
        correct: correctVal,
        explanation: row['Explanation']?.trim() || '',
        points: parseInt(row['Points']) || 100
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}