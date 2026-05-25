import { Range } from 'vscode-languageserver';

export interface CustomDiagnosticConfig {
  name: string;
  description: string;
}

export interface AnalysisResult {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  range: Range;
  analyzer: string;
  suggestion?: string;
}

export interface LLMProxyRequest {
  prompt: string;
  systemPrompt: string;
  /**
   * Tier hint for the proxy. 'deep' requests a more capable model for
   * tasks that require multi-step reasoning (e.g. contradiction detection).
   * The proxy may ignore this if only one model is configured.
   */
  modelTier?: 'standard' | 'deep';
}

export interface LLMProxyResponse {
  text: string;
  error?: string;
}

export type LLMProxyFn = (request: LLMProxyRequest) => Promise<LLMProxyResponse>;

// Typed LLM response shapes for extractJSON
export interface LLMContradictionResponse {
  contradictions?: {
    instruction1: string;
    instruction2: string;
    severity: 'error' | 'warning';
    explanation: string;
    line1_estimate?: number;
    line2_estimate?: number;
  }[];
}

export interface LLMAmbiguityResponse {
  issues?: {
    text: string;
    type: 'quantifier' | 'reference' | 'term' | 'scope' | 'other';
    severity: 'warning' | 'info';
    problem: string;
    suggestion: string;
  }[];
}

export interface LLMPersonaResponse {
  issues?: {
    description: string;
    trait1: string;
    trait2: string;
    relevant_text: string;
    severity: 'warning' | 'info';
    suggestion: string;
  }[];
}

export interface LLMCognitiveLoadResponse {
  issues?: {
    type: string;
    description: string;
    relevant_text: string;
    severity: 'warning' | 'info';
    suggestion: string;
  }[];
  overall_complexity?: 'low' | 'medium' | 'high' | 'very-high';
}

export interface LLMCoverageResponse {
  coverage_analysis?: {
    coverage_gaps?: { gap: string; relevant_text: string; impact: 'high' | 'medium' | 'low'; suggestion: string }[];
    missing_error_handling?: { scenario: string; relevant_text: string; suggestion: string }[];
    overall_coverage?: 'comprehensive' | 'adequate' | 'limited' | 'minimal';
  };
}

export interface LLMHygieneResponse {
  hygiene_issues?: {
    type: 'redundant-instruction' | 'non-actionable-preamble' | 'vague-directive' | 'missing-agent' | 'dead-instruction' | 'unordered-process';
    relevant_text: string;
    description: string;
    suggestion: string;
    severity: 'warning' | 'info';
  }[];
}

// Analysis history tracking for loop detection
export interface RecommendationRecord {
  /** Timestamp when recommendation was made */
  timestamp: number;
  /** Code/category of the issue (e.g., 'contradiction', 'ambiguity') */
  issueCode: string;
  /** Exact text from the prompt where issue was found */
  relevantText: string;
  /** Unique hash of the issue (to detect re-reports of same issue) */
  issueHash: string;
  /** Severity level */
  severity: 'error' | 'warning' | 'info' | 'hint';
  /** The suggestion made to fix this issue */
  suggestion: string;
}

export interface AnalysisHistory {
  /** Document URI */
  uri: string;
  /** Previous recommendations for this document */
  recommendations: RecommendationRecord[];
  /** Last analysis fingerprint (SHA256 of content) */
  lastFingerprint: string;
  /** Skill frontmatter metadata (if available) */
  skillMetadata?: SkillMetadata;
}

export interface SkillMetadata {
  /** Skill name from frontmatter */
  name?: string;
  /** Skill description from frontmatter */
  description?: string;
  /** Extracted use case keywords to validate findings scope */
  useCaseKeywords: string[];
  /** Whether this is a skill (vs regular prompt) */
  isSkill: boolean;
}

export interface LoopDetectionResult {
  /** True if a potential feedback loop was detected */
  isLoop: boolean;
  /** Which recommendation(s) from history are being re-reported */
  reportsInHistory: RecommendationRecord[];
  /** Confidence level of loop detection */
  confidence: 'high' | 'medium' | 'low';
  /** Human-readable explanation */
  explanation: string;
}

/** Combined LLM response for single-call analysis. */
export interface LLMCombinedAnalysisResponse {
  contradictions?: LLMContradictionResponse['contradictions'];
  ambiguity_issues?: LLMAmbiguityResponse['issues'];
  persona_issues?: LLMPersonaResponse['issues'];
  cognitive_load?: {
    issues?: LLMCognitiveLoadResponse['issues'];
    overall_complexity?: LLMCognitiveLoadResponse['overall_complexity'];
  };
  coverage_analysis?: LLMCoverageResponse['coverage_analysis'];
  hygiene_issues?: LLMHygieneResponse['hygiene_issues'];
  composition_conflicts?: {
    summary: string;
    instruction1: string;
    instruction2: string;
    severity: 'error' | 'warning';
    suggestion: string;
  }[];
  custom_diagnostics?: {
    title: string;
    description: string;
    relevant_text: string;
    severity: 'error' | 'warning' | 'info';
    suggestion: string;
  }[];
}
