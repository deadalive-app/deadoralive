// Dead.Alive — Country Data with Dial Codes & Flags

export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dial: string; // e.g. "+1"
  flag: string; // emoji flag
}

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', code: 'AF', dial: '+93', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', dial: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', dial: '+213', flag: '🇩🇿' },
  { name: 'Argentina', code: 'AR', dial: '+54', flag: '🇦🇷' },
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
  { name: 'Austria', code: 'AT', dial: '+43', flag: '🇦🇹' },
  { name: 'Bangladesh', code: 'BD', dial: '+880', flag: '🇧🇩' },
  { name: 'Belgium', code: 'BE', dial: '+32', flag: '🇧🇪' },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'Chile', code: 'CL', dial: '+56', flag: '🇨🇱' },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳' },
  { name: 'Colombia', code: 'CO', dial: '+57', flag: '🇨🇴' },
  { name: 'Costa Rica', code: 'CR', dial: '+506', flag: '🇨🇷' },
  { name: 'Croatia', code: 'HR', dial: '+385', flag: '🇭🇷' },
  { name: 'Cuba', code: 'CU', dial: '+53', flag: '🇨🇺' },
  { name: 'Czech Republic', code: 'CZ', dial: '+420', flag: '🇨🇿' },
  { name: 'Denmark', code: 'DK', dial: '+45', flag: '🇩🇰' },
  { name: 'Dominican Republic', code: 'DO', dial: '+1-809', flag: '🇩🇴' },
  { name: 'Ecuador', code: 'EC', dial: '+593', flag: '🇪🇨' },
  { name: 'Egypt', code: 'EG', dial: '+20', flag: '🇪🇬' },
  { name: 'Ethiopia', code: 'ET', dial: '+251', flag: '🇪🇹' },
  { name: 'Finland', code: 'FI', dial: '+358', flag: '🇫🇮' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'Ghana', code: 'GH', dial: '+233', flag: '🇬🇭' },
  { name: 'Greece', code: 'GR', dial: '+30', flag: '🇬🇷' },
  { name: 'Guatemala', code: 'GT', dial: '+502', flag: '🇬🇹' },
  { name: 'Hong Kong', code: 'HK', dial: '+852', flag: '🇭🇰' },
  { name: 'Hungary', code: 'HU', dial: '+36', flag: '🇭🇺' },
  { name: 'Iceland', code: 'IS', dial: '+354', flag: '🇮🇸' },
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', dial: '+62', flag: '🇮🇩' },
  { name: 'Iran', code: 'IR', dial: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', dial: '+964', flag: '🇮🇶' },
  { name: 'Ireland', code: 'IE', dial: '+353', flag: '🇮🇪' },
  { name: 'Israel', code: 'IL', dial: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: 'IT', dial: '+39', flag: '🇮🇹' },
  { name: 'Jamaica', code: 'JM', dial: '+1-876', flag: '🇯🇲' },
  { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵' },
  { name: 'Jordan', code: 'JO', dial: '+962', flag: '🇯🇴' },
  { name: 'Kenya', code: 'KE', dial: '+254', flag: '🇰🇪' },
  { name: 'South Korea', code: 'KR', dial: '+82', flag: '🇰🇷' },
  { name: 'Kuwait', code: 'KW', dial: '+965', flag: '🇰🇼' },
  { name: 'Lebanon', code: 'LB', dial: '+961', flag: '🇱🇧' },
  { name: 'Libya', code: 'LY', dial: '+218', flag: '🇱🇾' },
  { name: 'Malaysia', code: 'MY', dial: '+60', flag: '🇲🇾' },
  { name: 'Mexico', code: 'MX', dial: '+52', flag: '🇲🇽' },
  { name: 'Morocco', code: 'MA', dial: '+212', flag: '🇲🇦' },
  { name: 'Myanmar', code: 'MM', dial: '+95', flag: '🇲🇲' },
  { name: 'Nepal', code: 'NP', dial: '+977', flag: '🇳🇵' },
  { name: 'Netherlands', code: 'NL', dial: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', dial: '+64', flag: '🇳🇿' },
  { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
  { name: 'Norway', code: 'NO', dial: '+47', flag: '🇳🇴' },
  { name: 'Pakistan', code: 'PK', dial: '+92', flag: '🇵🇰' },
  { name: 'Panama', code: 'PA', dial: '+507', flag: '🇵🇦' },
  { name: 'Peru', code: 'PE', dial: '+51', flag: '🇵🇪' },
  { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭' },
  { name: 'Poland', code: 'PL', dial: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', dial: '+351', flag: '🇵🇹' },
  { name: 'Qatar', code: 'QA', dial: '+974', flag: '🇶🇦' },
  { name: 'Romania', code: 'RO', dial: '+40', flag: '🇷🇴' },
  { name: 'Russia', code: 'RU', dial: '+7', flag: '🇷🇺' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦' },
  { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦' },
  { name: 'Spain', code: 'ES', dial: '+34', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: 'LK', dial: '+94', flag: '🇱🇰' },
  { name: 'Sudan', code: 'SD', dial: '+249', flag: '🇸🇩' },
  { name: 'Sweden', code: 'SE', dial: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', dial: '+41', flag: '🇨🇭' },
  { name: 'Syria', code: 'SY', dial: '+963', flag: '🇸🇾' },
  { name: 'Taiwan', code: 'TW', dial: '+886', flag: '🇹🇼' },
  { name: 'Tanzania', code: 'TZ', dial: '+255', flag: '🇹🇿' },
  { name: 'Thailand', code: 'TH', dial: '+66', flag: '🇹🇭' },
  { name: 'Tunisia', code: 'TN', dial: '+216', flag: '🇹🇳' },
  { name: 'Turkey', code: 'TR', dial: '+90', flag: '🇹🇷' },
  { name: 'Uganda', code: 'UG', dial: '+256', flag: '🇺🇬' },
  { name: 'Ukraine', code: 'UA', dial: '+380', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Uruguay', code: 'UY', dial: '+598', flag: '🇺🇾' },
  { name: 'Venezuela', code: 'VE', dial: '+58', flag: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', dial: '+84', flag: '🇻🇳' },
  { name: 'Yemen', code: 'YE', dial: '+967', flag: '🇾🇪' },
  { name: 'Zimbabwe', code: 'ZW', dial: '+263', flag: '🇿🇼' },
];

// Popular countries shown at top of picker
export const POPULAR_COUNTRY_CODES = ['US', 'GB', 'CA', 'AU', 'IN', 'CN', 'DE', 'FR', 'JP', 'BR', 'NG', 'KE'];

export const getCountryByCode = (code: string): Country | undefined =>
  COUNTRIES.find((c) => c.code === code);

export const getDefaultCountry = (): Country =>
  COUNTRIES.find((c) => c.code === 'US')!;

export const searchCountries = (query: string): Country[] => {
  const q = query.toLowerCase().trim();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
  );
};
