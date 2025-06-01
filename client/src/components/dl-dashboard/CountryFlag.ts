const countryFlags: Record<string, string> = {
  México: "🇲🇽",
  "Estados Unidos": "🇺🇸",
  Canadá: "🇨🇦",
  "Reino Unido": "🇬🇧",
  Alemania: "🇩🇪",
  Francia: "🇫🇷",
  India: "🇮🇳",
  Australia: "🇦🇺",
  Japón: "🇯🇵",
  Brasil: "🇧🇷",
  Sudáfrica: "🇿🇦",
  Argentina: "🇦🇷",
  China: "🇨🇳",
  "Corea del Sur": "🇰🇷",
  Italia: "🇮🇹",
  España: "🇪🇸",
  Egipto: "🇪🇬",
  Rusia: "🇷🇺",
  "Nueva Zelanda": "🇳🇿",
  Colombia: "🇨🇴",
};

export const countryFlag = (country: string) => {
  return countryFlags[country] || "";
};
