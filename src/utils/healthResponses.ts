
import { ChatView } from "@/types";

const getWelcomeMessage = (): string => {
  return "Hello! I'm your Heart Health Assistant. I'm here to help you manage your cardiovascular health. How can I assist you today?\n\n• Check your risk profile\n• Get health recommendations\n• Talk to your health coach";
};

const getRiskProfileResponse = (query: string): string => {
  // In a real app, this would connect to a backend for personalized responses
  const lowRiskResponses = [
    "Based on the information you've shared, your cardiovascular risk appears to be relatively low. However, it's always good to monitor your health regularly.",
    "Your risk factors appear to be well-managed. Regular check-ups with your doctor are still important to maintain this positive status.",
    "Your current cardiovascular health metrics suggest a lower risk profile. This is great news, but continued monitoring is recommended."
  ];
  
  const mediumRiskResponses = [
    "I've analyzed your health data and there are some factors that suggest a moderate cardiovascular risk. Let's discuss how to address these specific areas.",
    "Your cardiovascular risk assessment shows some areas of concern. With targeted lifestyle changes, we can work to improve these factors.",
    "Based on your health metrics, you have a moderate risk level. The good news is that many of these factors can be improved with the right approach."
  ];
  
  const highRiskResponses = [
    "After reviewing your health information, I notice several significant risk factors for cardiovascular disease that should be addressed promptly.",
    "Your current health metrics indicate a higher risk profile for heart disease. It's important to work closely with your healthcare provider on a management plan.",
    "Your cardiovascular risk assessment shows several areas that need attention. Let's focus on creating an action plan to address these risks systematically."
  ];

  // Simplified logic - in a real app, this would use actual user data
  if (query.toLowerCase().includes("high") || query.toLowerCase().includes("serious")) {
    return highRiskResponses[Math.floor(Math.random() * highRiskResponses.length)];
  } else if (query.toLowerCase().includes("medium") || query.toLowerCase().includes("moderate")) {
    return mediumRiskResponses[Math.floor(Math.random() * mediumRiskResponses.length)];
  } else {
    return lowRiskResponses[Math.floor(Math.random() * lowRiskResponses.length)];
  }
};

const getRecommendationsResponse = (query: string): string => {
  // Diet recommendations
  if (query.toLowerCase().includes("diet") || query.toLowerCase().includes("food") || query.toLowerCase().includes("eat")) {
    return "Here are some heart-healthy dietary recommendations:\n\n• Follow a Mediterranean-style diet rich in fruits, vegetables, whole grains, and lean proteins\n• Reduce sodium intake to less than 2,300mg per day\n• Limit saturated fats and avoid trans fats\n• Include omega-3 fatty acids from sources like fatty fish\n• Moderate alcohol consumption\n\nWould you like more specific information about any of these recommendations?";
  }
  
  // Exercise recommendations
  if (query.toLowerCase().includes("exercise") || query.toLowerCase().includes("activity") || query.toLowerCase().includes("move")) {
    return "Here are exercise recommendations for heart health:\n\n• Aim for at least 150 minutes of moderate-intensity aerobic activity weekly\n• Include muscle-strengthening activities at least 2 days per week\n• Start slowly and gradually increase intensity if you're new to exercise\n• Consider activities like walking, swimming, or cycling\n• Break up prolonged sitting with short activity breaks\n\nWould you like help creating a specific exercise plan?";
  }
  
  // Stress management
  if (query.toLowerCase().includes("stress") || query.toLowerCase().includes("anxiety") || query.toLowerCase().includes("relax")) {
    return "Managing stress is important for heart health. Here are some recommendations:\n\n• Practice mindfulness meditation for 10-15 minutes daily\n• Try deep breathing exercises when feeling stressed\n• Maintain social connections and support networks\n• Consider speaking with a mental health professional\n• Ensure adequate sleep of 7-9 hours nightly\n\nWould you like to learn more about any specific stress management technique?";
  }
  
  // General recommendations
  return "Here are key recommendations for cardiovascular health:\n\n• Maintain a healthy diet rich in fruits, vegetables, and whole grains\n• Exercise regularly (aim for 150 minutes weekly)\n• Manage stress through mindfulness and relaxation techniques\n• Get 7-9 hours of quality sleep nightly\n• Don't smoke and limit alcohol consumption\n• Take medications as prescribed by your doctor\n\nWould you like more specific information about any of these areas?";
};

const getCoachingResponse = (query: string): string => {
  // Motivation and habit formation
  if (query.toLowerCase().includes("motivation") || query.toLowerCase().includes("habit") || query.toLowerCase().includes("routine")) {
    return "Building healthy habits takes time and consistency. Try these approaches:\n\n• Start with small, achievable goals rather than major changes\n• Track your progress with a health journal or app\n• Create environmental cues to remind you of your new habits\n• Find an accountability partner for mutual support\n• Celebrate small victories along the way\n\nWhat specific habit would you like to work on first?";
  }
  
  // Overcoming challenges
  if (query.toLowerCase().includes("struggle") || query.toLowerCase().includes("hard") || query.toLowerCase().includes("difficult") || query.toLowerCase().includes("challenge")) {
    return "It's normal to face challenges when making health changes. Here's how to overcome them:\n\n• Identify specific barriers and brainstorm solutions for each\n• Have contingency plans for common obstacles\n• Focus on progress rather than perfection\n• Reconnect with your deeper motivation for improving health\n• Consider seeking additional support from healthcare providers\n\nWhat specific challenge are you facing right now?";
  }
  
  // Progress tracking
  if (query.toLowerCase().includes("track") || query.toLowerCase().includes("progress") || query.toLowerCase().includes("monitor")) {
    return "Tracking your progress is essential for long-term success. Consider:\n\n• Monitoring key health metrics like blood pressure and weight\n• Keeping a food and exercise journal\n• Using health-tracking apps or devices\n• Setting regular check-in times to review your progress\n• Adjusting your goals as needed based on your results\n\nWhat aspects of your health would you find most helpful to track?";
  }
  
  // General coaching response
  return "As your heart health coach, I'm here to support your journey to better cardiovascular health. I can help you:\n\n• Set realistic health goals\n• Develop sustainable habits\n• Overcome challenges and barriers\n• Track and celebrate your progress\n• Stay motivated for the long term\n\nWhat specific aspect of your heart health journey would you like support with today?";
};

export const generateResponse = (query: string, view: ChatView): string => {
  switch (view) {
    case "risk":
      return getRiskProfileResponse(query);
    case "recommendations":
      return getRecommendationsResponse(query);
    case "coaching":
      return getCoachingResponse(query);
    case "general":
    default:
      // Handle navigation between views
      if (query.toLowerCase().includes("risk") || query.toLowerCase().includes("profile")) {
        return "I'd be happy to discuss your cardiovascular risk profile. What specific aspects of your health would you like to review?";
      } else if (query.toLowerCase().includes("recommend") || query.toLowerCase().includes("suggestion") || query.toLowerCase().includes("advice")) {
        return "I can provide heart health recommendations tailored to your needs. Would you like to hear about diet, exercise, or stress management strategies?";
      } else if (query.toLowerCase().includes("coach") || query.toLowerCase().includes("support") || query.toLowerCase().includes("help me")) {
        return "As your heart health coach, I'm here to help you implement positive changes. What specific area would you like coaching with today?";
      } else {
        return "I'm your cardiovascular health assistant. I can help with:\n\n• Assessing your risk profile\n• Providing health recommendations\n• Coaching you through lifestyle changes";
      }
  }
};

export default {
  getWelcomeMessage,
  getRiskProfileResponse,
  getRecommendationsResponse,
  getCoachingResponse,
  generateResponse
};
