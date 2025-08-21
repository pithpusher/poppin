// A/B Testing service for testing different UI variations

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  properties: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  startDate: number;
  endDate?: number;
  active: boolean;
  metrics: string[];
  targetAudience?: string[];
  trafficAllocation?: number; // Percentage of users to include
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  page: string;
  userAgent: string;
}

export interface ABTestMetrics {
  testId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  revenue?: number;
  customMetrics: Record<string, number>;
}

class ABTestingService {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private sessionAssignments: Map<string, Map<string, string>> = new Map(); // sessionId -> testId -> variantId
  private results: ABTestResult[] = [];
  private isInitialized = false;

  constructor() {
    this.loadTests();
    this.isInitialized = true;
  }

  // Load A/B tests from configuration
  private loadTests(): void {
    // Example tests - in production, these would come from a database or API
    const defaultTests: ABTest[] = [
      {
        id: 'button_color_test',
        name: 'Button Color Test',
        description: 'Test different button colors for conversion rate',
        variants: [
          { id: 'control', name: 'Control (Red)', weight: 50, properties: { color: 'red' } },
          { id: 'blue', name: 'Blue Button', weight: 25, properties: { color: 'blue' } },
          { id: 'green', name: 'Green Button', weight: 25, properties: { color: 'green' } }
        ],
        startDate: Date.now(),
        active: true,
        metrics: ['conversion_rate', 'click_through_rate', 'session_duration']
      },
      {
        id: 'layout_test',
        name: 'Layout Test',
        description: 'Test different event card layouts',
        variants: [
          { id: 'control', name: 'Control (Grid)', weight: 50, properties: { layout: 'grid' } },
          { id: 'list', name: 'List Layout', weight: 25, properties: { layout: 'list' } },
          { id: 'masonry', name: 'Masonry Layout', weight: 25, properties: { layout: 'masonry' } }
        ],
        startDate: Date.now(),
        active: true,
        metrics: ['engagement_rate', 'time_on_page', 'scroll_depth']
      },
      {
        id: 'search_ui_test',
        name: 'Search UI Test',
        description: 'Test different search interface designs',
        variants: [
          { id: 'control', name: 'Control (Standard)', weight: 50, properties: { design: 'standard' } },
          { id: 'minimal', name: 'Minimal Design', weight: 25, properties: { design: 'minimal' } },
          { id: 'enhanced', name: 'Enhanced Design', weight: 25, properties: { design: 'enhanced' } }
        ],
        startDate: Date.now(),
        active: true,
        metrics: ['search_completion_rate', 'search_time', 'results_clicked']
      }
    ];

    defaultTests.forEach(test => this.tests.set(test.id, test));
  }

  // Get variant for a user/session
  public getVariant(testId: string, userId?: string, sessionId?: string): ABTestVariant | null {
    const test = this.tests.get(testId);
    if (!test || !test.active) return null;

    // Check if user/session already has an assignment
    let assignment: string | undefined;
    
    if (userId && this.userAssignments.has(userId)) {
      assignment = this.userAssignments.get(userId)!.get(testId);
    }
    
    if (!assignment && sessionId && this.sessionAssignments.has(sessionId)) {
      assignment = this.sessionAssignments.get(sessionId)!.get(testId);
    }

    // If no assignment exists, create one
    if (!assignment) {
      assignment = this.assignVariant(test);
      
      // Store the assignment
      if (userId) {
        if (!this.userAssignments.has(userId)) {
          this.userAssignments.set(userId, new Map());
        }
        this.userAssignments.get(userId)!.set(testId, assignment);
      }
      
      if (sessionId) {
        if (!this.sessionAssignments.has(sessionId)) {
          this.sessionAssignments.set(sessionId, new Map());
        }
        this.sessionAssignments.get(sessionId)!.set(testId, assignment);
      }
    }

    return test.variants.find(v => v.id === assignment) || null;
  }

  // Assign variant based on weights
  private assignVariant(test: ABTest): string {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return test.variants[0].id;
  }

  // Get all active tests
  public getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.active);
  }

  // Get test by ID
  public getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  // Create new A/B test
  public createTest(test: Omit<ABTest, 'id'>): string {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTest: ABTest = {
      ...test,
      id: testId,
      startDate: Date.now()
    };
    
    this.tests.set(testId, newTest);
    return testId;
  }

  // Update test
  public updateTest(testId: string, updates: Partial<ABTest>): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;
    
    this.tests.set(testId, { ...test, ...updates });
    return true;
  }

  // Deactivate test
  public deactivateTest(testId: string): boolean {
    return this.updateTest(testId, { active: false, endDate: Date.now() });
  }

  // Record test result
  public recordResult(result: Omit<ABTestResult, 'timestamp'>): void {
    const fullResult: ABTestResult = {
      ...result,
      timestamp: Date.now()
    };
    
    this.results.push(fullResult);
    
    // In production, this would be sent to analytics service
    this.sendResultToAnalytics(fullResult);
  }

  // Send result to analytics
  private async sendResultToAnalytics(result: ABTestResult): Promise<void> {
    try {
      await fetch('/api/analytics/ab-test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.error('Failed to send A/B test result:', error);
    }
  }

  // Get test metrics
  public getTestMetrics(testId: string): ABTestMetrics[] {
    const test = this.tests.get(testId);
    if (!test) return [];

    const variantResults = new Map<string, ABTestResult[]>();
    
    // Group results by variant
    this.results
      .filter(r => r.testId === testId)
      .forEach(result => {
        if (!variantResults.has(result.variantId)) {
          variantResults.set(result.variantId, []);
        }
        variantResults.get(result.variantId)!.push(result);
      });

    // Calculate metrics for each variant
    return Array.from(variantResults.entries()).map(([variantId, results]) => {
      const impressions = results.length;
      const conversions = results.filter(r => r.page.includes('conversion')).length;
      const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;
      
      // Calculate average session duration (simplified)
      const sessionDurations = results.map(r => Date.now() - r.timestamp);
      const averageSessionDuration = sessionDurations.length > 0 
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
        : 0;

      // Calculate bounce rate (simplified)
      const singlePageSessions = results.filter(r => 
        results.filter(r2 => r2.sessionId === r.sessionId).length === 1
      ).length;
      const bounceRate = impressions > 0 ? (singlePageSessions / impressions) * 100 : 0;

      return {
        testId,
        variantId,
        impressions,
        conversions,
        conversionRate,
        averageSessionDuration,
        bounceRate,
        customMetrics: {}
      };
    });
  }

  // Get user's current test assignments
  public getUserAssignments(userId: string): Record<string, string> {
    const assignments = this.userAssignments.get(userId);
    if (!assignments) return {};
    
    const result: Record<string, string> = {};
    assignments.forEach((variantId, testId) => {
      result[testId] = variantId;
    });
    
    return result;
  }

  // Get session's current test assignments
  public getSessionAssignments(sessionId: string): Record<string, string> {
    const assignments = this.sessionAssignments.get(sessionId);
    if (!assignments) return {};
    
    const result: Record<string, string> = {};
    assignments.forEach((variantId, testId) => {
      result[testId] = variantId;
    });
    
    return result;
  }

  // Check if user is in a specific test
  public isUserInTest(testId: string, userId?: string, sessionId?: string): boolean {
    if (userId && this.userAssignments.has(userId)) {
      return this.userAssignments.get(userId)!.has(testId);
    }
    
    if (sessionId && this.sessionAssignments.has(sessionId)) {
      return this.sessionAssignments.get(sessionId)!.has(testId);
    }
    
    return false;
  }

  // Get test statistics
  public getTestStatistics(testId: string): {
    totalUsers: number;
    variantDistribution: Record<string, number>;
    startDate: number;
    duration: number;
  } {
    const test = this.tests.get(testId);
    if (!test) {
      return { totalUsers: 0, variantDistribution: {}, startDate: 0, duration: 0 };
    }

    const variantCounts = new Map<string, number>();
    let totalUsers = 0;

    // Count user assignments
    this.userAssignments.forEach(assignments => {
      const variantId = assignments.get(testId);
      if (variantId) {
        variantCounts.set(variantId, (variantCounts.get(variantId) || 0) + 1);
        totalUsers++;
      }
    });

    // Count session assignments
    this.sessionAssignments.forEach(assignments => {
      const variantId = assignments.get(testId);
      if (variantId) {
        variantCounts.set(variantId, (variantCounts.get(variantId) || 0) + 1);
        totalUsers++;
      }
    });

    const variantDistribution: Record<string, number> = {};
    variantCounts.forEach((count, variantId) => {
      variantDistribution[variantId] = count;
    });

    return {
      totalUsers,
      variantDistribution,
      startDate: test.startDate,
      duration: Date.now() - test.startDate
    };
  }

  // Reset test assignments (for testing purposes)
  public resetTestAssignments(testId: string): void {
    this.userAssignments.forEach(assignments => {
      assignments.delete(testId);
    });
    
    this.sessionAssignments.forEach(assignments => {
      assignments.delete(testId);
    });
  }

  // Get all test results
  public getAllResults(): ABTestResult[] {
    return [...this.results];
  }

  // Clear all results (for testing purposes)
  public clearResults(): void {
    this.results = [];
  }

  // Export test data
  public exportTestData(testId: string): {
    test: ABTest;
    results: ABTestResult[];
    metrics: ABTestMetrics[];
    statistics: any;
  } | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    return {
      test,
      results: this.results.filter(r => r.testId === testId),
      metrics: this.getTestMetrics(testId),
      statistics: this.getTestStatistics(testId)
    };
  }
}

// Create singleton instance
export const abTesting = new ABTestingService();

// Export for use in components
export default abTesting;
