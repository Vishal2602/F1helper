import fs from 'fs/promises';
import path from 'path';

type QAData = {
  question: string;
  answer: string;
  category: string;
};

type SearchResult = {
  content: string;
  relevance: number;
};

const pdfContent = {
  sections: [
    {
      title: "Academic Requirements",
      content: "To maintain F1 status, you must: 1) Maintain a full course load, 2) Make normal academic progress, 3) Not work without authorization, 4) Keep your I-20 valid and passport current, 5) Maintain health insurance coverage."
    },
    {
      title: "Work Authorization",
      content: "F1 students can work off-campus through: 1) Curricular Practical Training (CPT), 2) Optional Practical Training (OPT), or 3) Economic hardship authorization. Each type requires specific eligibility criteria and authorization from USCIS or your DSO."
    },
    {
      title: "Travel Requirements",
      content: "When traveling internationally, ensure you have: 1) Valid passport, 2) Valid F1 visa, 3) Current I-20 with travel signature, 4) Proof of enrollment, 5) Financial documents"
    }
  ]
};

export async function searchPDFContent(query: string): Promise<SearchResult | null> {
  try {
    // Simple relevance scoring based on keyword matching
    const keywords = query.toLowerCase().split(' ');

    let bestMatch: SearchResult | null = null;
    let highestScore = 0;

    for (const section of pdfContent.sections) {
      const content = section.content.toLowerCase();
      let score = 0;

      // Count keyword matches
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          score += 1;
        }
      });

      // Boost score if title matches
      if (keywords.some(keyword => section.title.toLowerCase().includes(keyword))) {
        score += 2;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          content: section.content,
          relevance: score / keywords.length
        };
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('Error searching PDF content:', error);
    return null;
  }
}

export async function extractQAFromPDF(): Promise<QAData[]> {
  try {
    // For now, we'll return a structured array of QA pairs
    // This will be enhanced once we process the actual PDF
    return [
      {
        question: "What are the requirements for maintaining F1 status?",
        answer: pdfContent.sections[0].content,
        category: "status_maintenance"
      },
      {
        question: "Can F1 students work off-campus?",
        answer: pdfContent.sections[1].content,
        category: "employment"
      },
      {
        question: "What documents do I need for international travel?",
        answer: pdfContent.sections[2].content,
        category: "travel"
      }
    ];
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process F1 visa helper document');
  }
}