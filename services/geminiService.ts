
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Meal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDishesFromIngredients = async (profile: UserProfile, ingredients: string[]) => {
  const prompt = `
    Bạn là trợ lý Fomi, chuyên gia bếp núc Việt Nam.
    Người dùng đang có các nguyên liệu: ${ingredients.join(", ")}.
    Gu ăn uống của họ: Miền ${profile.region}, sở thích ${profile.preferences.join(", ")}, mục tiêu ${profile.goal}.

    NHIỆM VỤ: Gợi ý 3 món ăn ngon có thể nấu (Ưu tiên dùng nguyên liệu đang có).
    Với mỗi món, hãy chỉ ra:
    1. name: Tên món ăn dân dã.
    2. description: Cách làm cực ngắn gọn (1-2 câu).
    3. ingredientsFound: Những thứ người dùng ĐÃ CÓ trong danh sách trên.
    4. ingredientsMissing: Những thứ CÒN THIẾU cần phải mua thêm để hoàn thành món này.
    5. calories: Ước tính calo.
    6. hackTip: Mẹo nhỏ để món này healthy hơn (đúng chất Healthy Thỏa Hiệp).

    Trả về JSON chuẩn. Dùng từ ngữ đơn giản, gần gũi.
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
            dishes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  ingredientsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredientsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
                  calories: { type: Type.NUMBER },
                  hackTip: { type: Type.STRING }
                },
                required: ["name", "description", "ingredientsFound", "ingredientsMissing", "calories", "hackTip"]
              }
            }
          },
          required: ["dishes"]
        }
      }
    });
    return JSON.parse(response.text).dishes;
  } catch (error) {
    console.error("Lỗi gợi ý món từ nguyên liệu:", error);
    return [];
  }
};

export const getMealSuggestions = async (profile: UserProfile, previousMeals: Meal[]) => {
  const prompt = `
    Bạn là chuyên gia ẩm thực Fomi, am hiểu món Việt 3 miền.
    Phong cách: "Healthy Thỏa Hiệp". Dùng ngôn ngữ gần gũi, dân dã, kiểu đồng nghiệp văn phòng nói chuyện với nhau.
    
    Thông tin user:
    - Quê/Miền: ${profile.region}
    - Mục tiêu: ${profile.goal}
    - Gu: ${profile.preferences.join(", ")}
    - ${profile.isLactoseIntolerant ? "DỊ ỨNG LACTOSE: Không sữa/phô mai." : ""}
    - Đã ăn: ${previousMeals.map(m => m.name).join(", ")}

    NHIỆM VỤ: Gợi ý 1 bữa tiếp theo theo cơ chế "Bù trừ":
    1. homeMeal: Món tự nấu chuẩn vị nhưng healthy (ít dầu, nhiều rau luộc/canh).
    2. eatOutMeal: Món ăn ngoài đặc trưng (Vd: Cơm tấm, Bún chả, Phở). 
       - hackTip: Cách dặn quán cực ngắn (Vd: "Ít nước béo", "Bỏ tóp mỡ").
       - compensationAdvice: Lời khuyên bù trừ cực thực tế (Vd: "Tối nhớ ăn bát canh rau cho thanh").
    3. keyPoints: 2 câu ngắn kích thích vị giác kiểu "Ngon lắm thử đi".

    Trả về JSON. Dùng từ ngữ đời thường Việt Nam.
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
                calories: { type: Type.NUMBER }
              },
              required: ["name", "description", "calories"]
            },
            eatOutMeal: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hackTip: { type: Type.STRING },
                compensationAdvice: { type: Type.STRING },
                calories: { type: Type.NUMBER }
              },
              required: ["name", "hackTip", "compensationAdvice", "calories"]
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
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
  const prompt = `Tạo danh sách đi chợ "Lego-style" cho 3 ngày tới. Người miền ${profile.region}, mục tiêu ${profile.goal}.
  Gu: ${profile.preferences.join(", ")}.
  Tập trung mua sỉ Protein để tiết kiệm. Dùng từ ngữ đi chợ bình dân Việt Nam (Vd: lạng, kg, bó, quả).
  
  Mỗi món đồ cần: name, category, amount, isProtein, plannedUsage (3 món dân dã sẽ nấu).
  Vd: Thịt nạc vai -> [Thịt luộc chấm mắm, Thịt kho trứng, Canh bí đỏ thịt băm]`;

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
              plannedUsage: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "category", "amount", "isProtein", "plannedUsage"]
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

export const recognizeMealFromPhoto = async (base64Image: string) => {
  const prompt = `Bạn là trợ lý Fomi. Hãy nhìn ảnh món ăn này và nhận diện thật khéo:
  1. Tên món ăn (Vd: Bún chả Hà Nội, Cơm tấm Sài Gòn).
  2. Calo ước tính cho một phần ăn bình thường.
  3. Mẹo 'hack' món này để healthy hơn (Vd: Bớt nước béo, thêm rau sống, không ăn da gà).
  
  Trả về JSON chuẩn. Dùng từ ngữ dân dã, thân thiện với người Việt.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ],
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
    console.error("AI Vision error:", error);
    return null;
  }
};
