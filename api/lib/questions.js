export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv';

export async function fetchQuestions(csvUrl) {
  const target = csvUrl || DEFAULT_SHEET_URL;
  
  const response = await fetch(target, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
  
  const text = await response.text();
  if (!text || text.includes('<!DOCTYPE html>')) {
    throw new Error("Link is not a valid CSV. Ensure it is 'Published to Web' as 'CSV'.");
  }

  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  const rows = lines.map(line => {
    // Simple split for standard CSVs; handles quotes roughly
    return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(item => item.replace(/^"|"$/g, '').trim());
  });

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const questions = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const q = { 
      Topic: 'Calculus', Type: 'MCQ', Question: '', 
      'Opt 1': '', 'Opt 2': '', 'Opt 3': '', 'Opt 4': '', 
      'Correct Answer': '1', Explanation: '', 'Image URL': '' 
    };

    headers.forEach((header, idx) => {
      const val = row[idx];
      if (!val) return;
      if (header.includes('question')) q.Question = val;
      else if (header.includes('opt1') || header === 'a') q['Opt 1'] = val;
      else if (header.includes('opt2') || header === 'b') q['Opt 2'] = val;
      else if (header.includes('opt3') || header === 'c') q['Opt 3'] = val;
      else if (header.includes('opt4') || header === 'd') q['Opt 4'] = val;
      else if (header.includes('correct') || header.includes('ans')) q['Correct Answer'] = val;
      else if (header.includes('explanation')) q.Explanation = val;
      else if (header.includes('type')) q.Type = val;
      else if (header.includes('topic')) q.Topic = val;
      else if (header.includes('image')) q['Image URL'] = val;
    });

    if (q.Question) questions.push(q);
  }

  return questions;
}