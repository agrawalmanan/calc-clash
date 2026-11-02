// YOUR PUBLISHED GOOGLE SHEET CSV URL
export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv';

export async function fetchQuestions(csvUrl) {
  const targetUrl = csvUrl || DEFAULT_SHEET_URL;

  let response;
  try {
    response = await fetch(targetUrl);
  } catch (err) {
    throw new Error(`Could not connect to Google Sheets URL: ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(`Google Sheets returned HTTP status ${response.status}. Please check sheet permissions.`);
  }

  const text = await response.text();

  if (!text || !text.trim()) {
    throw new Error('Google Sheet returned empty data.');
  }

  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error('Google returned HTML instead of CSV. Ensure "File > Share > Publish to web" is set to CSV.');
  }

  const rows = parseCSV(text);
  if (rows.length < 2) {
    throw new Error('Google Sheet CSV has no data rows below the header.');
  }

  const rawHeaders = rows[0].map(h => h.trim());
  const questions = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const rawObj = {};
    rawHeaders.forEach((header, index) => {
      rawObj[header] = row[index] ? row[index].trim() : '';
    });

    // Smart flexible column matcher (handles case variations and spaces)
    const normalized = normalizeQuestionRow(rawObj);

    if (normalized.Question) {
      questions.push(normalized);
    }
  }

  if (questions.length === 0) {
    throw new Error('No valid questions found in sheet. Make sure row 1 contains standard headers like Question, Opt 1, Opt 2, Opt 3, Opt 4, Correct Answer.');
  }

  return questions;
}

function normalizeQuestionRow(row) {
  const norm = {
    Topic: 'Calculus',
    Type: 'MCQ',
    'Image URL': '',
    Question: '',
    'Opt 1': '',
    'Opt 2': '',
    'Opt 3': '',
    'Opt 4': '',
    'Correct Answer': '1',
    Explanation: ''
  };

  for (const [key, val] of Object.entries(row)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanKey.includes('topic')) norm.Topic = val;
    else if (cleanKey.includes('type')) norm.Type = val.toUpperCase();
    else if (cleanKey.includes('image')) norm['Image URL'] = val;
    else if (cleanKey === 'question' || cleanKey === 'q') norm.Question = val;
    else if (cleanKey.includes('opt1') || cleanKey.includes('option1') || cleanKey === 'a') norm['Opt 1'] = val;
    else if (cleanKey.includes('opt2') || cleanKey.includes('option2') || cleanKey === 'b') norm['Opt 2'] = val;
    else if (cleanKey.includes('opt3') || cleanKey.includes('option3') || cleanKey === 'c') norm['Opt 3'] = val;
    else if (cleanKey.includes('opt4') || cleanKey.includes('option4') || cleanKey === 'd') norm['Opt 4'] = val;
    else if (cleanKey.includes('correct') || cleanKey.includes('answer')) norm['Correct Answer'] = val;
    else if (cleanKey.includes('explanation') || cleanKey.includes('reason')) norm.Explanation = val;
  }

  return norm;
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