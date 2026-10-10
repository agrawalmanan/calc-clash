import Papa from 'papaparse';

// 🛑 PASTE YOUR PUBLISHED GOOGLE SHEET CSV URL HERE (required)
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv";

export async function fetchQuestionsFromSheet(sheetUrl = GOOGLE_SHEET_CSV_URL) {
  const targetUrl = (sheetUrl && sheetUrl.trim() !== "") ? sheetUrl.trim() : GOOGLE_SHEET_CSV_URL;

  if (!targetUrl || targetUrl.includes("YOUR_ID") || targetUrl.includes("YOUR_GOOGLE_SHEET")) {
    throw new Error("No valid Google Sheet CSV URL configured. Publish your sheet and paste the CSV link.");
  }

  const res = await fetch(targetUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet (HTTP ${res.status}). Check that it is published as CSV.`);
  }

  const csvText = await res.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim()
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error("Google Sheet is empty or headers are wrong.");
  }

  const questions = parsed.data
    .filter((row) => row["Question"] && row["Question"].trim() !== "")
    .map((row, index) => {
      const type = (row["Type"]?.trim() || "MCQ").toUpperCase();

      const opt1 = row["Opt 1"]?.trim() || row["Option 1"]?.trim() || "";
      const opt2 = row["Opt 2"]?.trim() || row["Option 2"]?.trim() || "";
      const opt3 = row["Opt 3"]?.trim() || row["Option 3"]?.trim() || "";
      const opt4 = row["Opt 4"]?.trim() || row["Option 4"]?.trim() || "";

      const rawCorrect =
        row["Correct Answer"]?.trim() ||
        row["Correct Answer (1-4)"]?.trim() ||
        "1";

      let correctVal;
      if (type === "NUM") {
        correctVal = parseFloat(rawCorrect);
      } else {
        correctVal = Math.max(0, parseInt(rawCorrect, 10) - 1);
      }

      return {
        id: index + 1,
        topic: row["Topic"]?.trim() || "Mixed",
        type,
        imageUrl: row["Image URL"]?.trim() || null,
        question: row["Question"].trim(),
        options: type === "TF" ? ["True", "False"] : [opt1, opt2, opt3, opt4],
        correct: correctVal,
        explanation: row["Explanation"]?.trim() || "",
        points: parseInt(row["Points"], 10) || 100
      };
    });

  if (questions.length === 0) {
    throw new Error("No valid questions found in Google Sheet. Check your headers and rows.");
  }

  return questions;
}