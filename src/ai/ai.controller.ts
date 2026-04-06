import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface ToneAnalysisResult {
  score: 'neutral' | 'mild' | 'hostile';
  issues: string[];
  rewrite: string | null;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  private readonly anthropic = new Anthropic();

  @Post('tone-analysis')
  async analyzeTone(@Body() body: { text: string }): Promise<ToneAnalysisResult> {
    const text = (body.text ?? '').trim();
    if (!text) return { score: 'neutral', issues: [], rewrite: null };

    const response = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a co-parenting communication coach. Analyze this message for hostile language, accusations, sarcasm, passive-aggression, blame, or emotionally charged wording that could escalate conflict.

Return ONLY a raw JSON object — no markdown, no code blocks:
{
  "score": "neutral" | "mild" | "hostile",
  "issues": ["short description of each issue found"],
  "rewrite": "calm, neutral rewrite of the message, or null if already neutral"
}

Rules:
- "neutral": no issues, rewrite = null
- "mild": subtle tension but not overtly hostile
- "hostile": clear aggression, accusations, or inflammatory language
- Keep the rewrite concise and preserve the original intent
- Write issues in the same language as the original message

Message to analyze:
"""
${text}
"""`,
        },
      ],
    });

    const raw = (response.content[0] as { text: string }).text.trim();
    const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const result = JSON.parse(clean) as ToneAnalysisResult;
      return {
        score: result.score ?? 'neutral',
        issues: Array.isArray(result.issues) ? result.issues : [],
        rewrite: result.rewrite ?? null,
      };
    } catch {
      return { score: 'neutral', issues: [], rewrite: null };
    }
  }
}
