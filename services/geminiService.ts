
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Meal, IngredientInput, MarketLocation } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * NHẬN DIỆN NGUYÊN LIỆU THÔ TỪ ẢNH CHỤP TỦ LẠNH
 */
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
    console.error("Lỗi nhận diện nguyên liệu:", error);
    return [];
  }
};

/**
 * TÌM CỬA HÀNG VÀ ƯỚC TÍNH GIÁ CẢ
 */
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

/**
 * TẠO ẢNH MÓN ĂN PREMIUM
 */
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

/**
 * GỢI Ý MÓN ĂN TỪ NGUYÊN LIỆU CÓ SẴN
 */
export const getDishesFromIngredients = async (profile: UserProfile, ingredients: IngredientInput[]) => {
  const ai = getAIClient();
  const prompt = `Gợi ý 3 món ăn ngon miền ${profile.region} từ nguyên liệu: ${ingredients.map(i => i.name).join(", ")}. 
  Trả về JSON bao gồm tên món, mô tả, mẹo nấu ăn và danh sách nguyên liệu thiếu kèm giá.`;

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
                  comboDishes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Thành phần món ăn" },
                  description: { type: Type.STRING },
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
                required: ["name", "comboDishes", "description", "ingredientsFound", "ingredientsMissing", "calories", "hackTip", "recipeSteps"]
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

/**
 * NHẬN DIỆN MÓN ĂN QUA CAMERA
 */
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
