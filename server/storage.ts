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

    // Populate initial Q&A data
    const initialQA: InsertQA[] = [
      {
        question: "Can I work off-campus with an F1 visa?",
        answer: "F1 students can only work off-campus through authorized programs like CPT or OPT. On-campus work is limited to 20 hours/week during semesters.",
        category: "work"
      },
      {
        question: "What is the minimum credit requirement?",
        answer: "F1 students must maintain full-time enrollment with at least 12 credits for undergraduates or 9 credits for graduates per semester.",
        category: "academic"
      }
    ];

    const initialNotifications: InsertNotification[] = [
      {
        title: "OPT Application Deadline",
        content: "Submit your OPT application 90 days before your program end date.",
        priority: "high",
        date: new Date()
      },
      {
        title: "Course Registration",
        content: "Spring 2024 registration opens next week. Maintain full-time status.",
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