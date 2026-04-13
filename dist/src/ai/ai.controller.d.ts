interface ToneAnalysisResult {
    score: 'neutral' | 'mild' | 'hostile';
    issues: string[];
    rewrite: string | null;
}
export declare class AiController {
    private readonly anthropic;
    analyzeTone(body: {
        text: string;
    }): Promise<ToneAnalysisResult>;
}
export {};
