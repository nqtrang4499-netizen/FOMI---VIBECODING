
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Meal, IngredientInput, MarketLocation } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * TÌM CỬA HÀNG VÀ ƯỚC TÍNH GIÁ CẢ (Sử dụng Maps Grounding)
 */
export const getMarketDetails = async (ingredients: string[], latitude?: number, longitude?: number) => {
  const ai = getAIClient();
  const prompt = `
    Tôi đang cần mua các nguyên liệu: ${ingredients.join(", ")}.
    Hãy tìm các siêu thị hoặc cửa hàng tiện lợi gần nhất có bán những thứ này.
    Yêu cầu:
    1. Trả về danh sách 3 địa điểm tốt nhất.
    2. Với mỗi địa điểm, hãy ước tính:
       - Thời gian giao hàng (Delivery).
       - Thời gian chuẩn bị để đến lấy (Pickup).
       - Ước tính tổng giá tiền cho danh sách nguyên liệu trên (bằng VNĐ).
    
    Hãy dùng Google Maps để tìm địa điểm chính xác.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: latitude && longitude ? { latitude, longitude } : undefined
          }
        }
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Phân tích kết quả từ text và grounding chunks
    // Vì text là markdown, chúng ta sẽ cần một cấu trúc hiển thị linh hoạt
    return {
      advice: text,
      links: chunks.map((c: any) => ({
        title: c.maps?.title || c.web?.title,
        uri: c.maps?.uri || c.web?.uri
      })).filter(l => l.uri)
    };
  } catch (error) {
    console.error("Lỗi tìm địa điểm:", error);
    return null;
  }
};

/**
 * TẠO ẢNH MÓN ĂN PREMIUM (1K, 2K, 4K)
 */
export const generateMealImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `A professional, high-end food photography shot of: ${prompt}. Vietnamese style, vibrant colors, natural lighting, bokeh background, styled for a premium health and fitness app.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Lỗi tạo ảnh AI:", error);
    throw error;
  }
};

/**
 * GỢI Ý MÓN ĂN "KHÉO CO THÌ ẤM" TỪ TỦ LẠNH
 */
export const getDishesFromIngredients = async (profile: UserProfile, ingredients: IngredientInput[]) => {
  const ai = getAIClient();
  const mandatory = ingredients.filter(i => i.isMandatory).map(i => i.name);
  const optional = ingredients.filter(i => !i.isMandatory).map(i => i.name);

  const prompt = `
    Bạn là trợ lý Fomi, chuyên gia "Healthy Thỏa Hiệp". 
    Người dùng là người miền ${profile.region}, mục tiêu ${profile.goal}.
    Họ đang có:
    - BẮT BUỘC DÙNG: ${mandatory.join(", ")}
    - CÓ SẴN KHÁC: ${optional.join(", ")}
    
    HÃY GỢI Ý 3 COMBO MÂM CƠM (Gồm món mặn + canh/rau) sao cho:
    1. Tận dụng tối đa đồ đang có.
    2. Hợp khẩu vị miền ${profile.region}.
    3. Công thức nấu cực đơn giản cho dân văn phòng.

    Trả về JSON:
    - combos: mảng các đối tượng:
      - name: Tên mâm cơm.
      - comboDishes: Danh sách món trong combo.
      - description: Tại sao combo này tốt và tiết kiệm.
      - ingredientsFound: Danh sách nguyên liệu đã có được dùng.
      - ingredientsMissing: Danh sách nguyên liệu nhỏ lẻ cần mua thêm.
      - calories: Tổng calo ước tính.
      - hackTip: Mẹo nhỏ để món này "healthy" hơn.
      - recipeSteps: Mảng các bước nấu ngắn gọn.
  `;

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
                  comboDishes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING },
                  ingredientsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredientsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    console.error("Lỗi Gemini gợi ý món:", error);
    return [];
  }
};

/**
 * NHẬN DIỆN MÓN ĂN QUA CAMERA
 */
export const recognizeMealFromPhoto = async (base64Image: string) => {
  const ai = getAIClient();
  const prompt = `Bạn là Fomi. Hãy nhìn ảnh này và trả về JSON: tên món (name), calo (calories), và 1 mẹo healthy (hackTip).`;
  
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
    console.error("Lỗi nhận diện món:", error);
    return null;
  }
};

/**
 * GỢI Ý ĐI CHỢ THÔNG MINH (TỐI ƯU PROTEIN)
 */
export const getSmartShoppingList = async (profile: UserProfile) => {
  const ai = getAIClient();
  const prompt = `Gợi ý danh sách đi chợ cho người miền ${profile.region}, mục tiêu ${profile.goal}. Tập trung tối ưu Protein.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              amount: { type: Type.STRING },
              isProtein: { type: Type.BOOLEAN },
              price: { type: Type.NUMBER, description: "Giá ước tính bằng VNĐ" },
              plannedUsage: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "category", "amount", "isProtein", "price", "plannedUsage"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Lỗi danh sách đi chợ:", error);
    return [];
  }
};
