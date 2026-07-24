/**
 * Comprehensive Validation Engine for NSS Form Data
 */

const ValidationEngine = (() => {
  /**
   * Validates Full Name
   * Rule: Min 2 words, Max 60 chars, Letters & spaces only.
   */
  function validateName(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return { valid: false, message: 'Full Name is required.' };
    if (trimmed.length > 60) return { valid: false, message: 'Name must not exceed 60 characters.' };
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return { valid: false, message: 'Name must contain only letters.' };
    
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) return { valid: false, message: 'Please enter at least 2 words (e.g., First Last).' };

    return { valid: true, message: 'Valid Name' };
  }

  /**
   * Validates DOB in strict DD/MM/YYYY format with leap year math
   * Returns age if valid.
   */
  function validateDOB(dobStr) {
    const str = String(dobStr || '').trim();
    if (!str) return { valid: false, message: 'Date of Birth is required.', age: null };

    // Strict regex check for DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      return { valid: false, message: 'Date must be in DD/MM/YYYY format (e.g., 15/07/2008).', age: null };
    }

    const [dayStr, monthStr, yearStr] = str.split('/');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    const currentYear = new Date().getFullYear();
    if (year < 1920 || year > currentYear) {
      return { valid: false, message: `Year must be between 1920 and ${currentYear}.`, age: null };
    }

    if (month < 1 || month > 12) {
      return { valid: false, message: 'Month must be between 01 and 12.', age: null };
    }

    // Days per month check including Leap Year for February
    const daysInMonth = [0, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if (day < 1 || day > daysInMonth[month]) {
      if (month === 2 && day === 29 && !isLeapYear(year)) {
        return { valid: false, message: `${year} is not a leap year. Feb has 28 days.`, age: null };
      }
      return { valid: false, message: `Invalid day ${dayStr} for month ${monthStr}.`, age: null };
    }

    // Calculate age
    const dobDate = new Date(year, month - 1, day);
    const today = new Date();
    
    if (dobDate > today) {
      return { valid: false, message: 'Date of Birth cannot be in the future.', age: null };
    }

    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 12 || age > 35) {
      return { valid: false, message: `Age must be between 12 and 35 for NSS enrolment (Calculated: ${age} years).`, age };
    }

    return { valid: true, message: 'Valid Date of Birth', age };
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Validates 10-digit Indian Mobile Number starting with 6,7,8,9
   */
  function validateMobile(mobileStr) {
    const clean = String(mobileStr || '').replace(/\D/g, '');
    if (!clean) return { valid: false, message: 'Mobile number is required.' };
    if (clean.length !== 10) return { valid: false, message: 'Mobile number must be exactly 10 digits.' };
    if (!/^[6-9]/.test(clean)) return { valid: false, message: 'Mobile number must start with 6, 7, 8, or 9.' };

    return { valid: true, message: 'Valid Mobile Number', clean };
  }

  /**
   * Validates WhatsApp Number
   */
  function validateWhatsApp(waStr) {
    const clean = String(waStr || '').replace(/\D/g, '');
    if (!clean) return { valid: false, message: 'WhatsApp number is required.' };
    if (clean.length !== 10) return { valid: false, message: 'WhatsApp number must be exactly 10 digits.' };
    if (!/^[6-9]/.test(clean)) return { valid: false, message: 'WhatsApp number must start with 6, 7, 8, or 9.' };

    return { valid: true, message: 'Valid WhatsApp Number', clean };
  }

  /**
   * Validates Email
   */
  function validateEmail(emailStr) {
    const str = String(emailStr || '').trim();
    if (!str) return { valid: false, message: 'Email address is required.' };
    
    // Strict RFC email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(str)) {
      return { valid: false, message: 'Enter a valid email address (e.g., student@example.com).' };
    }

    return { valid: true, message: 'Valid Email' };
  }

  /**
   * Validates Aadhaar via Verhoeff algorithm
   */
  function validateAadhaar(aadhaarStr) {
    const clean = window.Verhoeff ? window.Verhoeff.unformat(aadhaarStr) : String(aadhaarStr).replace(/\D/g, '');
    if (!clean) return { valid: false, message: 'Aadhaar number is required.' };
    if (clean.length !== 12) return { valid: false, message: 'Aadhaar must be exactly 12 digits.' };
    
    if (window.Verhoeff && !window.Verhoeff.validate(clean)) {
      return { valid: false, message: 'Invalid Aadhaar Number (Verhoeff checksum failed).' };
    }

    return { valid: true, message: 'Valid Aadhaar Number' };
  }

  /**
   * Validates 6-digit Indian PIN Code
   */
  function validatePIN(pinStr) {
    const clean = String(pinStr || '').replace(/\D/g, '');
    if (!clean) return { valid: false, message: 'PIN code is required.' };
    if (clean.length !== 6) return { valid: false, message: 'PIN code must be exactly 6 digits.' };

    return { valid: true, message: 'Valid PIN Code' };
  }

  /**
   * Validates simple required text fields
   */
  function validateRequired(val, fieldName = 'This field') {
    const str = String(val || '').trim();
    if (!str) return { valid: false, message: `${fieldName} is required.` };
    return { valid: true, message: 'Valid' };
  }

  return {
    validateName,
    validateDOB,
    validateMobile,
    validateWhatsApp,
    validateEmail,
    validateAadhaar,
    validatePIN,
    validateRequired,
    isLeapYear
  };
})();

if (typeof window !== 'undefined') {
  window.ValidationEngine = ValidationEngine;
}
