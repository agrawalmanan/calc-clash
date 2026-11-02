/**
 * Fetches and parses CSV questions from a published Google Sheet.
 */
export async function fetchQuestions(csvUrl) {
  if (!csvUrl || typeof csvUrl !== 'string' || !csvUrl.startsWith('http')) {
    throw new Error('Invalid Google Sheet CSV URL. Please publish your Google Sheet as a CSV.');
  }

  let response;
  try {
    response = await fetch(csvUrl);
  } catch (err) {
    throw new Error('Network error attempting to fetch Google Sheet CSV.');
  }

  if (!response.ok) {
    throw new Error(`Google Sheet fetch failed with HTTP status ${response.status}. Ensure the sheet is published to web.`);
  }

  const text = await response.text();
  
  // Detect if Google returned an HTML login/error page instead of raw CSV
  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error('Google returned HTML instead of CSV. Make sure you selected "File > Share > Publish to web" and chose "Comma-separated values (.csv)".');
  }

  const rows = parseCSV(text);
  if (rows.length < 2) {
    throw new Error('Google Sheet CSV contains no question rows.');
  }

  const headers = rows[0].map(h => h.trim());
  const questions = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = row[index] ? row[index].trim() : '';
    });

    if (rowObj.Question && rowObj.Type) {
      questions.push(rowObj);
    }
  }

  if (questions.length === 0) {
    throw new Error('No valid questions found in Google Sheet. Ensure headers include: Topic, Type, Question, Opt 1, Opt 2, Opt 3, Opt 4, Correct Answer, Explanation.');
  }

  return questions;
}

// Lightweight RFC 4180 CSV Parser
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