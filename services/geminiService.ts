
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Meal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMealSuggestions = async (profile: UserProfile, previousMeals: Meal[]) => {
  const prompt = `
    Bạn là chuyên gia dinh dưỡng Fomi, tập trung vào "Healthy Thỏa Hiệp" (Ăn ngon nhưng có điều chỉnh).
    Người dùng: Miền ${profile.region}, ${profile.goal}.
    Bữa đã ăn: ${previousMeals.map(m => m.name).join(", ")}.

    Hãy gợi ý 1 bữa ăn tiếp theo (Bữa sáng/trưa/tối) ĐƠN GIẢN, dễ tìm.
    Cung cấp:
    1. homeMeal: Món tự nấu (nguyên liệu đơn giản).
    2. eatOutMeal: Món ăn ngoài kèm "hackTip". 
    3. keyPoints: Danh sách tối đa 3 bullet points cực ngắn về lý do chọn món này hoặc lưu ý quan trọng nhất (Vd: "Giảm tinh bột buổi tối", "Bù protein sau pizza").

    QUAN TRỌNG: description và hackTip phải cực kỳ ngắn gọn, dễ hiểu theo phong cách nhân viên văn phòng bận rộn.
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
            homeMeal: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "description", "calories"]
            },
            eatOutMeal: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hackTip: { type: Type.STRING },
                calories: { type: Type.NUMBER }
              },
              required: ["name", "hackTip", "calories"]
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short bullet points explaining the logic"
            }
          },
          required: ["homeMeal", "eatOutMeal", "keyPoints"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating meal suggestion:", error);
    return null;
  }
};

export const getSmartShoppingList = async (profile: UserProfile) => {
  const prompt = `Tạo danh sách đi chợ cho 3 ngày tới cho người dùng ở miền ${profile.region}, mục tiêu ${profile.goal}.
  Tập trung tối ưu phần Thịt/Hải sản (Protein) để mua 1 lần dùng được cho nhiều món khác nhau, tránh lãng phí.
  Danh sách bao gồm tên thực phẩm, đơn vị (kg, gram, bó, quả) và danh mục.`;

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
              isProtein: { type: Type.BOOLEAN }
            },
            required: ["name", "category", "amount", "isProtein"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return [];
  }
};
