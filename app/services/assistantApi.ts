import axiosClient from "@/app/utils/axiosClient";

export interface CaptionImprovementRequest {
    description: string;
}

export interface CaptionImprovementResponse {
    original: string;
    suggestions: string[];
}

export class AssistantApi {
    /**
     * Improve product description using AI
     */
    static async improveCaptions(description: string): Promise<string[]> {
        const res = await axiosClient.post<CaptionImprovementResponse>("/api/assistant/captions", description, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Extract suggestions from response and limit to top 4
        const data = res.data;
        if (data && data.suggestions && Array.isArray(data.suggestions)) {
            return data.suggestions.slice(0, 4);
        }

        // Fallback for unexpected response format
        if (Array.isArray(data)) {
            return (data as string[]).slice(0, 4);
        }

        return [data as unknown as string];
    }

    /**
     * Improve video/content description using AI
     */
    static async improveDescription(description: string): Promise<string[]> {
        const res = await axiosClient.post<CaptionImprovementResponse>("/api/assistant/descriptions", description, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Extract suggestions from response and limit to top 4
        const data = res.data;
        if (data && data.suggestions && Array.isArray(data.suggestions)) {
            return data.suggestions.slice(0, 4);
        }

        // Fallback for unexpected response format
        if (Array.isArray(data)) {
            return (data as string[]).slice(0, 4);
        }

        return [data as unknown as string];
    }

    /**
     * Generate product suggestions based on input
     */
    static async generateSuggestions(input: string): Promise<string[]> {
        const res = await axiosClient.post<string[]>("/api/assistant/suggestions", input, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return res.data;
    }

    /**
     * Generate quiz questions based on topics
     */
    static async generateQuiz(topics: string[]): Promise<{
        Question: string;
        A: string;
        B: string;
        C: string;
        D: string;
        Answer: string; // The key of the correct answer (A, B, C, or D)
    }> {
        const res = await axiosClient.post("/api/assistant/quizzes", topics, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return res.data;
    }

    /**
     * Analyze product content for improvements
     */
    static async analyzeContent(content: string): Promise<{
        score: number;
        recommendations: string[];
    }> {
        const res = await axiosClient.post("/api/assistant/analyze", content, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return res.data;
    }
}

// Export singleton instance
export const assistantApi = AssistantApi;