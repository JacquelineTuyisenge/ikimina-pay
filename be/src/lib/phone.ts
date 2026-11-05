// Turns 078..., +25078... or 78.. into 25078...
// Returns null if it is not a valid Rwandan mobile number.
export function normalizeRwandaPhone(input: string): string | null {
    
  let digits = input.replace(/[\s\-+]/g, "");

  if (digits.startsWith("0")) digits = "250" + digits.slice(1);

  else if (digits.startsWith("7") && digits.length === 9) digits = "250" + digits;

  return /^2507\d{8}$/.test(digits) ? digits : null;
}