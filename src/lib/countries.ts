/**
 * European countries list for RentVault
 * Based on ISO 3166-1 alpha-2 codes
 * Includes: EU member states, EEA countries, UK, Switzerland, and common European countries
 */

export interface Country {
    code: string      // ISO 3166-1 alpha-2 code
    name: string      // Full country name in English
}

// European countries in alphabetical order by name
export const EUROPEAN_COUNTRIES: Country[] = [
    { code: 'AL', name: 'Albania' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AT', name: 'Austria' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'EE', name: 'Estonia' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'GR', name: 'Greece' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IT', name: 'Italy' },
    { code: 'XK', name: 'Kosovo' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malta' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'NO', name: 'Norway' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'RO', name: 'Romania' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'ES', name: 'Spain' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'TR', name: 'Turkey' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'GB', name: 'United Kingdom' },
]

// Special "Other" option for countries not in the list
export const OTHER_COUNTRY: Country = { code: 'OTHER', name: 'Other' }

// Get country name from code
export function getCountryName(code: string | null): string {
    if (!code) return 'Country not set'
    if (code === 'OTHER') return 'Other'

    // Handle legacy 'UK' code
    const normalizedCode = code.toUpperCase() === 'UK' ? 'GB' : code.toUpperCase()

    const country = EUROPEAN_COUNTRIES.find(c => c.code === normalizedCode)
    return country ? country.name : code.toUpperCase()
}

// Get country name with code for display
export function formatCountryWithCode(code: string | null): string {
    if (!code) return 'Country not set'
    if (code === 'OTHER') return 'Other'

    // Handle legacy 'UK' code
    const normalizedCode = code.toUpperCase() === 'UK' ? 'GB' : code.toUpperCase()

    const country = EUROPEAN_COUNTRIES.find(c => c.code === normalizedCode)
    return country ? `${country.name} (${country.code})` : code.toUpperCase()
}

// All countries including "Other" at the end
export function getAllCountryOptions(): Country[] {
    return [...EUROPEAN_COUNTRIES, OTHER_COUNTRY]
}
