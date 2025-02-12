// Simple sentiment analysis for emotion detection
export function detectEmotion(text: string): "neutral" | "happy" | "thinking" | "confused" {
  const lowerText = text.toLowerCase();
  
  // Questions or uncertainty
  if (lowerText.includes("?") || 
      lowerText.includes("don't understand") ||
      lowerText.includes("could you") ||
      lowerText.includes("how to")) {
    return "thinking";
  }
  
  // Positive responses
  if (lowerText.includes("great") ||
      lowerText.includes("thank") ||
      lowerText.includes("yes") ||
      lowerText.includes("good")) {
    return "happy";
  }
  
  // Confusion or errors
  if (lowerText.includes("error") ||
      lowerText.includes("wrong") ||
      lowerText.includes("cannot") ||
      lowerText.includes("sorry")) {
    return "confused";
  }
  
  // Default state
  return "neutral";
}
