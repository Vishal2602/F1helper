import { QAResponse, InsertQA, Notification, InsertNotification, QuestionAnalytics } from "@shared/schema";

export interface IStorage {
  getAllQA(): Promise<QAResponse[]>;
  getQAByCategory(category: string): Promise<QAResponse[]>;
  createQA(qa: InsertQA): Promise<QAResponse>;
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  trackQuestion(question: string, category: string): Promise<void>;
  getQuestionAnalytics(): Promise<QuestionAnalytics[]>;
  getTopQuestions(limit?: number): Promise<QuestionAnalytics[]>;
}

export class MemStorage implements IStorage {
  private qaResponses: Map<number, QAResponse>;
  private notifications: Map<number, Notification>;
  private analytics: Map<number, QuestionAnalytics>;
  private qaCurrentId: number;
  private notifCurrentId: number;
  private analyticsCurrentId: number;

  constructor() {
    this.qaResponses = new Map();
    this.notifications = new Map();
    this.analytics = new Map();
    this.qaCurrentId = 1;
    this.notifCurrentId = 1;
    this.analyticsCurrentId = 1;

    // Populate initial Q&A data with comprehensive F1 visa information
    const initialQA: InsertQA[] = [
      {
        question: "What is the minimum credit requirement for F1 students?",
        answer: "F1 students must maintain full-time enrollment: 12 credits for undergraduates or 9 credits for graduates per semester. Exceptions require prior DSO approval.",
        category: "academic"
      },
      {
        question: "Can I work off-campus with an F1 visa?",
        answer: "F1 students can only work off-campus through authorized programs: CPT (Curricular Practical Training) or OPT (Optional Practical Training). On-campus work is limited to 20 hours/week during semesters.",
        category: "work"
      },
      {
        question: "What is CPT?",
        answer: "Curricular Practical Training (CPT) allows F1 students to work in jobs directly related to their major. It requires DSO authorization and must be integral to your curriculum.",
        category: "work"
      },
      {
        question: "What is OPT?",
        answer: "Optional Practical Training (OPT) permits up to 12 months of work experience in your field of study. STEM majors may be eligible for a 24-month extension. Apply through your DSO up to 90 days before graduation.",
        category: "work"
      },
      {
        question: "Can I travel internationally with an F1 visa?",
        answer: "Yes, but you need: 1) Valid F1 visa 2) Valid passport 3) Current I-20 signed for travel 4) Proof of enrollment/good standing. Consult your DSO before traveling.",
        category: "travel"
      },
      {
        question: "What happens if I drop below full-time enrollment?",
        answer: "Dropping below full-time enrollment without prior DSO authorization can violate F1 status. Contact your DSO immediately if you need to reduce course load for medical or academic difficulties.",
        category: "academic"
      },
      {
        question: "How long can I stay in the US after graduation?",
        answer: "F1 students have a 60-day grace period after program completion. During this time, you must either: 1) Start OPT 2) Transfer to another program 3) Change visa status 4) Leave the US.",
        category: "academic"
      },
      {
        question: "Can I take online classes?",
        answer: "F1 students can only count one online class (3 credits) toward their full-time requirement per semester. You must take mostly in-person classes to maintain status.",
        category: "academic"
      }
    ];

    const initialNotifications: InsertNotification[] = [
      {
        title: "OPT Application Deadline Approaching",
        content: "If graduating this semester, submit your OPT application 90 days before your program end date to ensure timely processing.",
        priority: "high",
        date: new Date()
      },
      {
        title: "Course Registration Reminder",
        content: "Spring 2024 registration opens next week. Remember to maintain full-time status (12 credits for undergrad, 9 for grad students).",
        priority: "medium",
        date: new Date()
      },
      {
        title: "Travel Advisory",
        content: "If planning international travel, ensure your I-20 is signed for travel and your visa is valid for re-entry.",
        priority: "medium",
        date: new Date()
      }
    ];

    initialQA.forEach(qa => this.createQA(qa));
    initialNotifications.forEach(notif => this.createNotification(notif));
  }

  async getAllQA(): Promise<QAResponse[]> {
    return Array.from(this.qaResponses.values());
  }

  async getQAByCategory(category: string): Promise<QAResponse[]> {
    return Array.from(this.qaResponses.values()).filter(
      qa => qa.category === category
    );
  }

  async createQA(qa: InsertQA): Promise<QAResponse> {
    const id = this.qaCurrentId++;
    const newQA = { ...qa, id };
    this.qaResponses.set(id, newQA);
    return newQA;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notifCurrentId++;
    const newNotification = { ...notification, id };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async trackQuestion(question: string, category: string): Promise<void> {
    const existingAnalytic = Array.from(this.analytics.values()).find(
      a => a.question.toLowerCase() === question.toLowerCase()
    );

    if (existingAnalytic) {
      const updated = {
        ...existingAnalytic,
        count: existingAnalytic.count + 1,
        lastAsked: new Date()
      };
      this.analytics.set(existingAnalytic.id, updated);
    } else {
      const id = this.analyticsCurrentId++;
      this.analytics.set(id, {
        id,
        question,
        category,
        count: 1,
        lastAsked: new Date()
      });
    }
  }

  async getQuestionAnalytics(): Promise<QuestionAnalytics[]> {
    return Array.from(this.analytics.values());
  }

  async getTopQuestions(limit: number = 10): Promise<QuestionAnalytics[]> {
    return Array.from(this.analytics.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();