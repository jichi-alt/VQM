import { GoogleGenAI } from "@google/genai";
import { QuestionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePhilosophicalQuestion = async (): Promise<QuestionData> => {
  try {
    // In a real scenario, we would call the API.
    // To ensure the UI is functional without a key for the user immediately, we can provide a fallback
    // But per instructions, we implement the real call logic.
    
    // Check if API KEY is set in env (simulated check as we can't access process.env in browser reliably without build tool injection usually)
    // Here we assume process.env.API_KEY is available or we use a fallback for demo purposes if it fails.
    
    if (!process.env.API_KEY) {
        console.warn("No API Key found. Using fallback data.");
        return getFallbackQuestion();
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a single, short, profound philosophical or existential question in Chinese. It should be thought-provoking and slightly surreal. Do not include any intro text, just the question.",
    });

    const text = response.text || "人类的本质是复读机吗？";
    
    return {
        id: Math.random().toString(36).substr(2, 9),
        text: text.trim(),
        date: new Date().toISOString().split('T')[0],
        ticketNum: Math.floor(1000 + Math.random() * 9000).toString()
    };

  } catch (error) {
    console.error("Gemini API Error", error);
    return getFallbackQuestion();
  }
};

const getFallbackQuestion = (): QuestionData => {
    const questions = [
        "如果你的影子突然有了自我意识，它做的第一件事会是什么？",
        "记忆是真实的，还是我们为了连贯性编造的故事？",
        "如果梦境才是现实，醒来才是入睡，你会怎么做？",
        "沉默的声音是什么颜色的？",
        "这一刻是过去的终点，还是未来的起点？"
    ];
    return {
        id: Math.random().toString(36).substr(2, 9),
        text: questions[Math.floor(Math.random() * questions.length)],
        date: new Date().toISOString().split('T')[0],
        ticketNum: Math.floor(1000 + Math.random() * 9000).toString()
    };
}
