import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AspectRatio, AnalysisReport, PredictiveAnalysis, AdOptimizationResponse, AIPilotStrategy, AdCreatorFormData, AIAnalyticsInsight } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number = 1): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A high-resolution, professional marketing image for an advertisement. ${prompt}`,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });
        
        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("La génération d'image n'a renvoyé aucun résultat.");
        }
        
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("La génération d'image a échoué. Vérifiez votre prompt ou réessayez.");
    }
};

export const editImage = async (prompt: string, imageFile: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    try {
        const base64Data = await fileToBase64(imageFile);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: imageFile.type,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            throw new Error("Réponse invalide de l'API de modification d'image.");
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image was generated in the response.");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("La modification de l'image a échoué. L'IA n'a peut-être pas compris l'instruction.");
    }
};

export const generateVideo = async (
    prompt: string, 
    aspectRatio: '16:9' | '9:16', 
    imageFile?: File
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    try {
        
        let operation;
        if (imageFile) {
            const imageBytes = await fileToBase64(imageFile);
            operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                image: { imageBytes, mimeType: imageFile.type },
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
            });
        } else {
            operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
            });
        }

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video generation failed, no URI found.");
        
        const response = await fetch(`${downloadLink}&key=${(process.env as any).API_KEY}`);
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("La génération de vidéo a échoué. Veuillez réessayer.");
    }
};

// Helper functions for audio processing
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Uint8Array {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const dataSize = pcmData.byteLength;
    const fileSize = 36 + dataSize;

    // RIFF chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Sub-chunk size for PCM
    view.setUint16(20, 1, true); // Audio format 1=PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // byte rate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // block align
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    const wavBytes = new Uint8Array(44 + dataSize);
    wavBytes.set(new Uint8Array(header), 0);
    wavBytes.set(pcmData, 44);

    return wavBytes;
}

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
    if (!text) throw new Error("Le script ne peut pas être vide.");

    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("La génération audio n'a renvoyé aucun résultat.");
        }

        const pcmData = decode(base64Audio);
        // The API returns 16-bit PCM at a 24000 Hz sample rate.
        const wavData = pcmToWav(pcmData, 24000, 1, 16);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("La génération audio a échoué. Veuillez réessayer.");
    }
};


export const getAdvancedCompetitorAnalysis = async (url: string, sector: string): Promise<AnalysisReport> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    const prompt = `
        Analyze the advertising strategy of the competitor at ${url}, which operates in the ${sector} sector.
        Extract the company name from the URL.
        Provide an expert-level marketing analysis. Your response MUST be a JSON object.

        The analysis should include:
        1.  competitorName: The name of the company.
        2.  avgCtr: An estimated average Click-Through Rate (CTR) for their ads based on typical performance in the ${sector} sector.
        3.  estBudget: An estimated monthly ad budget range (min, max) with a 'details' string explaining the reasoning.
        4.  report: A detailed report containing:
            - strengths: 3 key strengths of their advertising strategy.
            - opportunities: 3 strategic opportunities we can exploit against them.
            - recommendations: 3 actionable recommendations for our own campaigns.
            - benchmarks: Key performance benchmarks for the ${sector} sector.

        Example for estBudget.details: "Based on high ad frequency on TikTok and aggressive keyword bidding on Google for the SaaS sector, the budget is estimated to be significant."
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        competitorName: { type: Type.STRING },
                        avgCtr: { type: Type.NUMBER },
                        estBudget: {
                            type: Type.OBJECT,
                            properties: {
                                min: { type: Type.INTEGER },
                                max: { type: Type.INTEGER },
                                details: { type: Type.STRING }
                            },
                            required: ["min", "max", "details"]
                        },
                        report: {
                            type: Type.OBJECT,
                            properties: {
                                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                                benchmarks: { type: Type.OBJECT }
                            },
                            required: ["strengths", "opportunities", "recommendations", "benchmarks"]
                        }
                    },
                    required: ["competitorName", "avgCtr", "estBudget", "report"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result as AnalysisReport;
    } catch (error) {
        console.error("Error getting competitor analysis:", error);
        throw new Error("L'analyse du concurrent a échoué. L'IA n'a pas pu traiter la demande.");
    }
};

export const getPredictiveAnalysis = async (prompt: string, mediaType: 'image' | 'video', platform: string): Promise<PredictiveAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    const analysisPrompt = `
        Provide a predictive performance analysis for a ${mediaType} ad on ${platform}, based on the creative concept: "${prompt}".
        Return a JSON object with two keys:
        1. "scores": An object with performance scores (0-100) for 'ctr', 'engagement', and 'conversion'.
        2. "recommendations": An array of 3 short, actionable recommendations to improve the ad's performance.

        Example scores: {"ctr": 85, "engagement": 75, "conversion": 65}
        Base your scores on typical platform performance and the creative prompt. Be realistic.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: analysisPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scores: {
                            type: Type.OBJECT,
                            properties: {
                                ctr: { type: Type.INTEGER },
                                engagement: { type: Type.INTEGER },
                                conversion: { type: Type.INTEGER },
                            },
                            required: ["ctr", "engagement", "conversion"]
                        },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["scores", "recommendations"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result as PredictiveAnalysis;
    } catch (error) {
        console.error("Error getting predictive analysis:", error);
        throw new Error("L'analyse prédictive a échoué.");
    }
};

export const optimizeAdVariations = async (formData: AdCreatorFormData): Promise<AdOptimizationResponse> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    const context = `
        Product: ${formData.productDescription}
        Benefits: ${formData.productBenefits}
        Audience: ${formData.persona}
        Tone: ${formData.brandTone}
        Objective: ${formData.objective}
        Initial Headline: ${formData.headline}
        Initial Main Text: ${formData.mainText}
    `;

    const prompt = `
        Based on the provided context, generate 3 optimized ad variations (headline and description).
        For each variation, provide a "rationale" explaining why it's effective for the target audience and objective.
        Also, provide a "best_pick_index" (0, 1, or 2) indicating which variation you believe will perform best.
        Context: ${context}
        Respond ONLY with a valid JSON object matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        best_pick_index: { type: Type.INTEGER },
                        variations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    headline: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    rationale: { type: Type.STRING }
                                },
                                required: ["headline", "description", "rationale"]
                            }
                        }
                    },
                    required: ["best_pick_index", "variations"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        if (!result.variations || result.variations.length < 1) throw new Error("AI did not generate enough variations.");
        return result as AdOptimizationResponse;
    } catch (error) {
        console.error("Error optimizing ad variations:", error);
        throw new Error("L'optimisation des textes publicitaires a échoué.");
    }
};

export const generateCampaignStrategy = async (prompt: string): Promise<AIPilotStrategy> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    const generationPrompt = `
        You are an expert marketing strategist. Based on the user's high-level goal, generate a comprehensive advertising campaign strategy.
        User Goal: "${prompt}"

        Your output MUST be a JSON object that can be used to pre-fill an ad creation tool. Follow the schema precisely.
        
        - productInfo: Details about the product. Infer from the prompt.
        - audience: Define a primary target audience. Suggest relevant platforms.
        - creativeStrategy: Define the brand tone and target emotions.
        - objective: Choose the most relevant campaign objective from this list: 'Conversions', 'Trafic', 'Notoriété', 'Engagement', 'Leads', 'Ventes'.
        - budgetInfo: Suggest a reasonable starting daily budget and a 2-week duration.
        - adCreatorSettings: Generate compelling and specific creative content. This includes a visual prompt for an image or video, a headline, a description, and a CTA.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro", // Using a more powerful model for this complex task
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productInfo: {
                            type: Type.OBJECT, properties: {
                                name: { type: Type.STRING }, category: { type: Type.STRING },
                                description: { type: Type.STRING }, usp: { type: Type.STRING },
                                problem: { type: Type.STRING }
                            }, required: ["name", "description", "usp", "problem"]
                        },
                        audience: {
                            type: Type.OBJECT, properties: {
                                ageRange: { type: Type.STRING }, gender: { type: Type.STRING },
                                interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                                platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                                audiencePrompt: { type: Type.STRING }, incomeLevel: { type: Type.STRING }
                            }, required: ["ageRange", "interests", "platforms", "audiencePrompt"]
                        },
                        creativeStrategy: {
                            type: Type.OBJECT, properties: {
                                brandTone: { type: Type.STRING },
                                targetEmotions: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }, required: ["brandTone", "targetEmotions"]
                        },
                        objective: { type: Type.STRING },
                        budgetInfo: {
                            type: Type.OBJECT, properties: {
                                dailyBudget: { type: Type.INTEGER },
                                durationInDays: { type: Type.INTEGER }
                            }, required: ["dailyBudget", "durationInDays"]
                        },
                        adCreatorSettings: {
                            type: Type.OBJECT,
                            properties: {
                                image: {
                                    type: Type.OBJECT, properties: {
                                        prompt: { type: Type.STRING }, style: { type: Type.STRING }
                                    }

                                },
                                video: {
                                    type: Type.OBJECT, properties: {
                                        prompt: { type: Type.STRING }, visualStyle: { type: Type.STRING }
                                    }
                                },
                                common: {
                                    type: Type.OBJECT, properties: {
                                        headline: { type: Type.STRING }, description: { type: Type.STRING },
                                        cta: { type: Type.STRING }
                                    }, required: ["headline", "description", "cta"]
                                }
                            }, required: ["common"]
                        }
                    }, required: ["productInfo", "audience", "creativeStrategy", "objective", "budgetInfo", "adCreatorSettings"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result as AIPilotStrategy;
    } catch (error) {
        console.error("Error generating campaign strategy:", error);
        throw new Error("La génération de stratégie par l'IA a échoué.");
    }
};

export const getAnalyticsInsights = async (dataSummary: string): Promise<AIAnalyticsInsight> => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });

    const prompt = `
        Analyze the following advertising campaign analytics data summary.
        Provide a concise, expert-level analysis for a marketing manager.
        The data is: ${dataSummary}

        Your analysis should include:
        1.  **summary**: A brief, high-level overview of the overall performance.
        2.  **positivePoints**: A list of 2-3 key strengths or successes.
        3.  **areasForImprovement**: A list of 2-3 critical weaknesses or areas needing attention.
        4.  **recommendations**: A list of 2-3 actionable recommendations, each with a title, a short description, and its potential impact.

        Format your response as a JSON object matching the provided schema. Be insightful and data-driven.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Brief performance overview." },
                        positivePoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of key strengths."
                        },
                        areasForImprovement: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of critical weaknesses."
                        },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    impact: { type: Type.STRING }
                                },
                                required: ["title", "description", "impact"]
                            },
                            description: "List of actionable recommendations."
                        }
                    },
                    required: ["summary", "positivePoints", "areasForImprovement", "recommendations"]
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        // Basic validation
        if (!result.summary || !Array.isArray(result.positivePoints) || !Array.isArray(result.areasForImprovement) || !Array.isArray(result.recommendations)) {
            throw new Error("Invalid JSON structure from AI.");
        }

        return result as AIAnalyticsInsight;

    } catch (error) {
        console.error("Error getting analytics insights:", error);
        throw new Error("L'analyse par l'IA a échoué. L'API a peut-être renvoyé une réponse inattendue.");
    }
};