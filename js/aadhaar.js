/**
 * Aadhaar Validation & Formatting Module
 * Implements the exact Verhoeff Checksum Algorithm
 */

const Verhoeff = (() => {
  // Multiplication table d
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];

  // Permutation table p
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 1, 4, 6, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];

  // Inverse table inv
  const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

  /**
   * Validates a numeric string using Verhoeff checksum algorithm
   * @param {string} str 12-digit numeric string
   * @returns {boolean}
   */
  function validate(str) {
    const raw = String(str).replace(/\s+/g, '');
    if (!/^\d{12}$/.test(raw)) return false;

    // Reject invalid initial digits (Aadhaar cannot start with 0 or 1)
    if (raw.startsWith('0') || raw.startsWith('1')) return false;

    let c = 0;
    const myArray = raw.split('').map(Number).reverse();

    for (let i = 0; i < myArray.length; i++) {
      c = d[c][p[i % 8][myArray[i]]];
    }

    return c === 0;
  }

  /**
   * Formats raw digits into 1234 5678 9012 format
   * @param {string} val
   * @returns {string}
   */
  function format(val) {
    const clean = String(val).replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join(' ');
  }

  /**
   * Returns clean unformatted 12-digit string
   * @param {string} val
   * @returns {string}
   */
  function unformat(val) {
    return String(val).replace(/\D/g, '').slice(0, 12);
  }

  return {
    validate,
    format,
    unformat
  };
})();

if (typeof window !== 'undefined') {
  window.Verhoeff = Verhoeff;
}
