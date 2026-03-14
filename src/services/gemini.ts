import { GoogleGenAI } from "@google/genai";

export async function generateProposalContent(
  plan: string, 
  price: string, 
  clientName: string, 
  companyBackground?: string, 
  toneOfVoice?: string
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const model = "gemini-3.1-pro-preview";
  
  const defaultCompanyInfo = `
    - Name: Fuel Drop
    - Location: 25 Burdens Creek Road, Virginia 0834, Darwin, Northern Territory
    - Phone: 0488 845 388
    - Email: admin@fueldrop.com.au
    - Ownership: Proudly Territory Owned & Operated
    - Core Services: Mobile Bulk Fuel Delivery, Commercial & Industrial Fuel Delivery, Bunded Fuel Tank Sales & Hire (Fuel Storage), Oils, Lubricants & AdBlue Fuel/Engine Products.
    - Key Values: Fair pricing (always in line with local rates), transparency (no hidden costs), reliability, and community focus.
  `;

  const prompt = `
    You are a world-class sales representative for a high-end fuel delivery company.
    
    COMPANY BACKGROUND:
    ${companyBackground || defaultCompanyInfo}
    
    TONE OF VOICE:
    ${toneOfVoice || "Professional, authoritative, yet approachable."}
    
    TASK:
    Create a professional, persuasive business proposal for the following:
    Client Name: ${clientName}
    Plan/Service: ${plan}
    Price: ${price}
    
    The proposal should include:
    1. A professional greeting.
    2. Executive Summary: Highlight the company's unique value proposition.
    3. Service Details: Elaborate on "${plan}" using professional industry terminology.
    4. Pricing: Present "${price}" clearly.
    5. Why Choose Us: Mention key values and commitment to reliability.
    6. Terms and Conditions Summary.
    7. Call to Action.
    
    Format the output in Markdown.
    Do not include placeholders like [Insert Date].
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Failed to generate proposal content.";
  } catch (error) {
    console.error("Error generating proposal:", error);
    return "Error generating proposal. Please try again.";
  }
}
