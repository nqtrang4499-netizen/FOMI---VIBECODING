
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Meal, IngredientInput } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const recognizeIngredientsFromPhoto = async (base64Image: string) => {
  const ai = getAIClient();
  const prompt = `Bạn là trợ lý Fomi. Hãy nhìn ảnh chụp tủ lạnh và liệt kê thực phẩm thấy được. 
  Yêu cầu trả về mảng JSON gồm: name (tên tiếng Việt), category (Thịt, Rau, Củ, Quả, Gia vị, Khác).
  Chỉ liệt kê thực phẩm thô.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["name", "category"]
              }
            }
          },
          required: ["ingredients"]
        }
      }
    });
    return JSON.parse(response.text).ingredients;
  } catch (error) {
    return [];
  }
};

export const getMarketDetails = async (ingredients: string[], latitude?: number, longitude?: number) => {
  const ai = getAIClient();
  const prompt = `Tôi cần mua: ${ingredients.join(", ")}. Tìm nơi bán gần nhất, ước tính giá VNĐ và thời gian nhận hàng.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: { latLng: latitude && longitude ? { latitude, longitude } : undefined }
        }
      },
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      advice: response.text || "",
      links: chunks.map((c: any) => ({ title: c.maps?.title || c.web?.title, uri: c.maps?.uri || c.web?.uri })).filter(l => l.uri)
    };
  } catch (error) {
    return null;
  }
};

export const generateMealImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `High-quality food photography: ${prompt}. Vietnamese style, clean background.` }] },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: size } },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getDishesFromIngredients = async (profile: UserProfile, ingredients: IngredientInput[]) => {
  const ai = getAIClient();
  const prompt = `Gợi ý 3 món ăn ngon miền ${profile.region} từ nguyên liệu: ${ingredients.map(i => i.name).join(", ")}. 
  Dựa trên khẩu vị: ${profile.flavors.join(", ")} và mục tiêu: ${profile.goal}.
  Trả về JSON bao gồm tên món, mô tả, mẹo nấu ăn, thời gian hoàn thành (ví dụ: 15 phút), độ khó, các bước thực hiện và danh sách nguyên liệu thiếu kèm giá.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            combos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  ingredientsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredientsMissing: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER }
                      },
                      required: ["name", "estimatedPrice"]
                    }
                  },
                  calories: { type: Type.NUMBER },
                  hackTip: { type: Type.STRING },
                  recipeSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "description", "estimatedTime", "difficulty", "ingredientsFound", "ingredientsMissing", "calories", "hackTip", "recipeSteps"]
              }
            }
          },
          required: ["combos"]
        }
      }
    });
    return JSON.parse(response.text).combos;
  } catch (error) {
    return [];
  }
};

export const generateDailyPlan = async (profile: UserProfile) => {
  const ai = getAIClient();
  const prompt = `Tạo thực đơn 3 bữa (Sáng, Trưa, Tối) hoàn chỉnh cho 1 ngày.
  Phong cách: Miền ${profile.region}.
  Mục tiêu: ${profile.goal}. 
  Khẩu vị: ${profile.flavors.join(", ")}.
  Tổng calo mục tiêu: ${profile.calorieGoal || 2000}.
  Yêu cầu trả về JSON mảng 3 món ăn chi tiết.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['Bữa sáng', 'Bữa trưa', 'Bữa tối'] },
                  description: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  ingredientsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredientsMissing: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER }
                      },
                      required: ["name", "estimatedPrice"]
                    }
                  },
                  calories: { type: Type.NUMBER },
                  hackTip: { type: Type.STRING },
                  recipeSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "type", "description", "calories", "hackTip"]
              }
            }
          },
          required: ["meals"]
        }
      }
    });
    return JSON.parse(response.text).meals;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const estimateCaloriesFromText = async (text: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ước tính calo và thông tin dinh dưỡng cho món ăn: "${text}". Nếu không phải món ăn, trả về null. Trả về JSON.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            hackTip: { type: Type.STRING, description: "Nhận xét ngắn về độ healthy của món này" }
          },
          required: ["name", "calories", "hackTip"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};

export const recognizeMealFromPhoto = async (base64Image: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "Nhận diện món ăn này, lượng calo và mẹo dinh dưỡng. Trả về JSON." },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            hackTip: { type: Type.STRING }
          },
          required: ["name", "calories", "hackTip"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};
