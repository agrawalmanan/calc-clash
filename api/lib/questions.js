export const DEFAULT_SHEET_URL = process.env.GOOGLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv';


export async function fetchQuestions(csvUrl) {
  const targetUrl = csvUrl || DEFAULT_SHEET_URL;

  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.startsWith('http')) {
    throw new Error('No Google Sheet URL set! Please paste your published Google Sheet CSV URL into DEFAULT_SHEET_URL in api/lib/questions.js');
  }

  let response;
  try {
    response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CalcClash/1.0'
      }
    });
  } catch (err) {
    throw new Error(`Network error connecting to Google Sheet: ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(`Google Sheets responded with status ${response.status}. Make sure your sheet is published to web as CSV.`);
  }

  const text = await response.text();

  if (!text || text.trim() === '') {
    throw new Error('The Google Sheet CSV returned an empty document.');
  }

  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error('Google returned HTML instead of CSV. Go to "File > Share > Publish to web" and choose "Comma-separated values (.csv)".');
  }

  const rows = parseCSV(text);
  if (rows.length < 2) {
    throw new Error('Google Sheet CSV has no question rows.');
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
    throw new Error('No valid questions found. Ensure CSV headers: Topic, Type, Question, Opt 1, Opt 2, Opt 3, Opt 4, Correct Answer, Explanation.');
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