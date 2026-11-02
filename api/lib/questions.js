export const DEFAULT_SHEET_URL = process.env.GOOGLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv';


export async function fetchQuestions(csvUrl) {
  const targetUrl = csvUrl || DEFAULT_SHEET_URL;

  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.startsWith('http')) {
    throw new Error('Invalid Google Sheet URL. Set GOOGLE_SHEET_URL in Vercel env or provide a valid CSV link.');
  }

  let response;
  try {
    response = await fetch(targetUrl);
  } catch (err) {
    throw new Error(`Failed to reach Google Sheets CSV URL: ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(`Google Sheets fetch failed with HTTP status ${response.status}. Ensure your sheet is published to web as CSV.`);
  }

  const text = await response.text();

  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error('Google returned HTML instead of CSV. Ensure you clicked "File > Share > Publish to web" and chose "Comma-separated values (.csv)".');
  }

  const rows = parseCSV(text);
  if (rows.length < 2) {
    throw new Error('Google Sheet CSV contains no question rows.');
  }

  const headers = rows[0].map(h => h.trim());
  const questions = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = row[index] ? row[index].trim() : '';
    });

    if (rowObj.Question && rowObj.Type) {
      questions.push(rowObj);
    }
  }

  if (questions.length === 0) {
    throw new Error('No valid questions found in sheet. Headers must include: Topic, Type, Question, Opt 1, Opt 2, Opt 3, Opt 4, Correct Answer, Explanation.');
  }

  return questions;
}

function parseCSV(text) {
  const lines = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(field);
      field = '';
      if (row.some(f => f.trim() !== '')) {
        lines.push(row);
      }
      row = [];
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some(f => f.trim() !== '')) {
      lines.push(row);
    }
  }

  return lines;
}