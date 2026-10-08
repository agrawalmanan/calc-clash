import Papa from 'papaparse';

// 🛑 PASTE YOUR PUBLISHED GOOGLE SHEET CSV LINK HERE:
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv";

export async function fetchQuestionsFromSheet(sheetUrl = GOOGLE_SHEET_CSV_URL) {
  try {
    if (!sheetUrl) throw new Error("No Google Sheet URL provided.");

    const res = await fetch(sheetUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const csvText = await res.text();
    
    // Parse CSV
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim() // trim whitespace from header names
    });

    if (!parsed.data || parsed.data.length === 0) {
      console.warn("Google Sheet parsed but returned 0 rows.");
      return [];
    }

    // Map and sanitize each row
    const questions = parsed.data
      .filter(row => row['Question'] && row['Question'].trim() !== '')
      .map((row, index) => {
        const opt1 = row['Option 1']?.trim() || '';
        const opt2 = row['Option 2']?.trim() || '';
        const opt3 = row['Option 3']?.trim() || '';
        const opt4 = row['Option 4']?.trim() || '';

        // Correct answer column (1 to 4 -> array index 0 to 3)
        const rawCorrect = parseInt(row['Correct Answer (1-4)']) || 1;
        const correctIndex = Math.max(0, Math.min(3, rawCorrect - 1));

        return {
          id: index + 1,
          topic: row['Topic']?.trim() || 'Mixed',
          question: row['Question']?.trim(),
          options: [opt1, opt2, opt3, opt4],
          correct: correctIndex,
          explanation: row['Explanation']?.trim() || 'No explanation provided.',
          points: parseInt(row['Points']) || 100
        };
      });

    return questions;
  } catch (err) {
    console.error("Failed to fetch questions from Google Sheets:", err);
    return [];
  }
}