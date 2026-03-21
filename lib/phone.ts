const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeBdPhone(value: string) {
  const digits = digitsOnly(value);

  if (digits.startsWith("8801") && digits.length === 13) {
    const local = `0${digits.slice(2)}`;
    return BD_MOBILE_REGEX.test(local) ? local : null;
  }

  if (digits.startsWith("01") && digits.length === 11) {
    return BD_MOBILE_REGEX.test(digits) ? digits : null;
  }

  return null;
}

export function formatBdPhone(value: string) {
  const normalized = normalizeBdPhone(value);
  if (!normalized) return value;

  return `+880 ${normalized.slice(1, 5)}-${normalized.slice(5)}`;
}

export function toBdTel(value: string) {
  const normalized = normalizeBdPhone(value);
  return normalized ? `+88${normalized}` : value;
}
