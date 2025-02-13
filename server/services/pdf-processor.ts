import fs from 'fs/promises';
import path from 'path';

type QAData = {
  question: string;
  answer: string;
  category: string;
};

export async function extractQAFromPDF(): Promise<QAData[]> {
  try {
    // For now, we'll return a structured array of QA pairs
    // This will be enhanced once we process the actual PDF
    return [
      {
        question: "What are the requirements for maintaining F1 status?",
        answer: "To maintain F1 status, you must: 1) Maintain a full course load, 2) Make normal academic progress, 3) Not work without authorization, 4) Keep your I-20 valid and passport current, 5) Maintain health insurance coverage.",
        category: "status_maintenance"
      },
      {
        question: "Can F1 students work off-campus?",
        answer: "F1 students can work off-campus through: 1) Curricular Practical Training (CPT), 2) Optional Practical Training (OPT), or 3) Economic hardship authorization. Each type requires specific eligibility criteria and authorization from USCIS or your DSO.",
        category: "employment"
      }
    ];
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process F1 visa helper document');
  }
}
