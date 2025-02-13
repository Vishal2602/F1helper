import fs from 'fs/promises';
import path from 'path';

type QAData = {
  question: string;
  answer: string;
  category: string;
};

export const VISA_CATEGORIES = [
  "status_maintenance",
  "employment",
  "academic",
  "travel",
  "health_insurance",
  "program_extension"
] as const;

export type VisaCategory = typeof VISA_CATEGORIES[number];

export const CATEGORY_LABELS: Record<VisaCategory, string> = {
  status_maintenance: "Status Maintenance",
  employment: "Employment & Work",
  academic: "Academic Requirements",
  travel: "Travel & Re-entry",
  health_insurance: "Health Insurance",
  program_extension: "Program Extension"
};

export async function extractQAFromPDF(): Promise<QAData[]> {
  try {
    // Enhanced structured array of QA pairs with more categories
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
      },
      {
        question: "What are the academic requirements for F1 students?",
        answer: "F1 students must maintain full-time enrollment: Undergraduates need 12 credits per semester, graduates need 9 credits. Only one online class (3 credits) can count toward the full-time requirement. Exceptions require DSO approval.",
        category: "academic"
      },
      {
        question: "What documents do I need for international travel?",
        answer: "For international travel, you need: 1) Valid passport, 2) Valid F1 visa, 3) Current I-20 with travel signature (less than 1 year old), 4) Proof of enrollment/financial documentation recommended.",
        category: "travel"
      },
      {
        question: "What health insurance is required for F1 students?",
        answer: "F1 students must maintain adequate health insurance coverage. Most schools require: 1) Medical coverage, 2) Emergency evacuation, 3) Repatriation coverage. Check with your school for specific requirements.",
        category: "health_insurance"
      },
      {
        question: "How do I extend my program?",
        answer: "To extend your program: 1) Contact your DSO before I-20 expiration, 2) Provide academic justification, 3) Show updated financial documentation, 4) Receive new I-20 with extended end date. Must apply before current program end date.",
        category: "program_extension"
      }
    ];
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process F1 visa helper document');
  }
}