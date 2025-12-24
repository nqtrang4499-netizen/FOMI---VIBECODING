
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Meal, IngredientInput, HealthRecord, DailyLog } from "../types";

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
  const prompt = `Gợi ý 3 COMBO mâm cơm gia đình miền ${profile.region} từ nguyên liệu: ${ingredients.map(i => i.name).join(", ")}. 
  Dựa trên khẩu vị: ${profile.flavors.join(", ")} và mục tiêu: ${profile.goal}.
  
  QUY TẮC NGƯỜI VIỆT:
  1. Mỗi gợi ý là một "Mâm cơm" gồm: 1 Món Mặn (Kho/Chiên/Xào) + 1 Món Canh/Rau + Tráng miệng (Trái cây như dưa hấu, chuối...).
  2. Hạn chế gợi ý bún/phở nấu tại nhà vì cầu kỳ, trừ khi user yêu cầu.
  3. Đặt tên món theo kiểu: "Cơm [Món Mặn] & [Món Canh]".
  
  Trả về JSON chi tiết.`;

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

export const generateDailyPlan = async (profile: UserProfile, customCalories?: number, customFlavors?: string[]) => {
  const ai = getAIClient();
  const targetCalories = customCalories || profile.calorieGoal || 2000;
  const targetFlavors = customFlavors && customFlavors.length > 0 ? customFlavors : profile.flavors;
  
  const prompt = `Tạo thực đơn 3 bữa (Sáng, Trưa, Tối) hoàn chỉnh cho 1 ngày theo phong cách người Việt miền ${profile.region}.
  Mục tiêu sức khỏe: ${profile.goal}. 
  Khẩu vị ưu tiên: ${targetFlavors.join(", ")}.
  Tổng calo mục tiêu: ${targetCalories} kcal.

  QUY TẮC QUAN TRỌNG:
  1. Bữa Sáng: Người Việt thường không nấu cầu kỳ buổi sáng. Hãy gợi ý món nhanh (Bánh mì, Xôi, Trứng luộc) hoặc "Ăn ngoài" (Phở, Bún bò - đánh dấu isEatOut=true).
  2. Bữa Trưa & Tối: Phải là Mâm cơm gồm Cơm + Món Mặn (Kho/Rim) + Món Canh/Rau + Tráng miệng trái cây. Đặt tên món là combo (VD: "Cơm Sườn rim & Canh cải").
  3. Không gợi ý nấu Phở/Bún tại nhà cho bữa trưa/tối vì tốn thời gian.
  4. Chia calo hợp lý: Sáng (25%), Trưa (40%), Tối (35%).

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
                  isEatOut: { type: Type.BOOLEAN },
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
                required: ["name", "type", "description", "calories", "hackTip", "isEatOut"]
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

export const analyzeHealthTrends = async (profile: UserProfile, history: HealthRecord[], recentLogs: DailyLog[]) => {
  const ai = getAIClient();
  const prompt = `Phân tích tình trạng sức khỏe của user tên ${profile.name} (${profile.age} tuổi, ${profile.gender}, mục tiêu ${profile.goal}).
  
  Dữ liệu cân nặng (gần nhất đến xa nhất):
  ${history.slice(0, 5).map(h => `- ${h.date}: ${h.weight}kg`).join('\n')}

  Dữ liệu ăn uống 3 ngày gần đây:
  ${recentLogs.slice(0, 3).map(log => `- ${log.date}: Tổng ${log.meals.reduce((a,b) => a+b.calories, 0)} kcal`).join('\n')}

  Hãy đưa ra nhận xét ngắn gọn, súc tích (dưới 100 từ) về:
  1. Xu hướng cân nặng (Tăng/Giảm/Ổn định có đúng mục tiêu không?).
  2. Lời khuyên dinh dưỡng cho tuần tới dựa trên thói quen ăn uống gần đây.
  3. Giọng văn thân thiện, động viên như một bác sĩ gia đình.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Hiện tại tôi chưa đủ dữ liệu để phân tích chi tiết. Hãy tiếp tục ghi chép nhé!";
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
