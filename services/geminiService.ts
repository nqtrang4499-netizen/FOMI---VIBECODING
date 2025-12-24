
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
  // Prompt yêu cầu trả về JSON chi tiết giá và địa điểm
  const prompt = `Với danh sách cần mua: ${ingredients.join(", ")}.
  Vị trí người dùng: Latitude ${latitude}, Longitude ${longitude} (Nếu có).
  
  Nhiệm vụ:
  1. Ước lượng giá trung bình (VNĐ) cho 1 phần ăn/1 đơn vị của TỪNG món trong danh sách tại thị trường Việt Nam hiện nay.
  2. Tìm 3-4 địa điểm mua sắm phù hợp nhất (Siêu thị/Chợ) gần vị trí đó (hoặc gợi ý chung nếu không có toạ độ).
  3. Đưa ra lời khuyên ngắn gọn cách chọn đồ tươi ngon.

  Trả về JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Dùng model mới nhất để support search tốt hơn
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: { latLng: latitude && longitude ? { latitude, longitude } : undefined }
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemPrices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Tên nguyên liệu khớp với danh sách" },
                  price: { type: Type.NUMBER, description: "Giá ước tính VNĐ" }
                }
              }
            },
            locations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            },
            advice: { type: Type.STRING }
          },
          required: ["itemPrices", "locations", "advice"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Market Error", error);
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

export const generateDailyPlan = async (profile: UserProfile, customCalories?: number, customFlavors?: string[], ingredients?: string[]) => {
  const ai = getAIClient();
  const targetCalories = customCalories || profile.calorieGoal || 2000;
  const targetFlavors = customFlavors && customFlavors.length > 0 ? customFlavors : profile.flavors;
  
  // Xây dựng prompt chặt chẽ hơn
  const hasIngredients = ingredients && ingredients.length > 0;
  const ingredientPrompt = hasIngredients ? `BẮT BUỘC SỬ DỤNG nguyên liệu: ${ingredients.join(", ")}.` : "Gợi ý nguyên liệu dễ tìm.";
  
  const allergyPrompt = profile.allergies && profile.allergies.length > 0 
    ? `TUYỆT ĐỐI TRÁNH các thành phần sau: ${profile.allergies.join(", ")}.` 
    : "";

  const preferencesPrompt = profile.preferences && profile.preferences.length > 0
    ? `Ưu tiên các món chính từ: ${profile.preferences.join(", ")}.`
    : "";

  const prompt = `Tạo thực đơn 3 bữa (Sáng, Trưa, Tối) hoàn chỉnh cho 1 ngày theo phong cách người Việt miền ${profile.region}.
  
  THÔNG TIN NGƯỜI DÙNG:
  - Mục tiêu: ${profile.goal}
  - Khẩu vị: ${targetFlavors.join(", ")}
  - Tổng calo mục tiêu: ${targetCalories} kcal
  - ${preferencesPrompt}
  - ${ingredientPrompt}
  - ${allergyPrompt}

  QUY TẮC BẮT BUỘC:
  1. Bữa Sáng: Món nhanh (Bánh mì, Xôi, Trứng) hoặc "Ăn ngoài" (Phở, Bún).
  2. Bữa Trưa & Tối: Phải là Mâm cơm gồm Cơm + Món Mặn + Canh/Rau. Đặt tên món là combo (VD: "Cơm Sườn rim & Canh cải").
  3. Nếu có nguyên liệu đầu vào, phải ưu tiên dùng chúng cho món chính.
  4. Nếu dị ứng được nêu, kiểm tra kỹ thành phần để loại bỏ hoàn toàn.
  5. Chia calo hợp lý: Sáng (25%), Trưa (40%), Tối (35%).

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
