// In numberConverter.js
import i18n from '../i18n/i18n';

// Convert only the digits in a string to the target language
export const convertDigitsOnly = (str, language = null) => {
    if (str === undefined || str === null) return '';

    // Use the current language from i18n if language is not provided
    const currentLanguage = language || i18n.language || 'en';

    // If the language is English, return as is
    if (currentLanguage === 'en') return str.toString();

    // Get the digit mapping for the target language
    let targetDigits;
    if (currentLanguage === 'gu') {
        targetDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    } else if (currentLanguage === 'hi') {
        targetDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    } else {
        return str.toString(); // Return as is for other languages
    }

    // Convert each digit in the string
    return str.toString().replace(/[0-9]/g, (digit) => {
        return targetDigits[digit];
    });
};

export const convertDateMonthsOnly = (date, language = null) => {
    if (date === undefined || date === null) return '';

    // Use the current language from i18n if language is not provided
    const currentLanguage = language || i18n.language || 'en';

    // Get day and month
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-indexed in JS

    // If the language is English, return in "DD/MM" format
    if (currentLanguage === 'en') {
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
    }

    // Get the digit mapping for the target language
    let targetDigits;
    if (currentLanguage === 'gu') {
        targetDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    } else if (currentLanguage === 'hi') {
        targetDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    } else {
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
    }

    // Convert each digit in day and month
    const convertNumber = (num) => {
        return num.toString().split('').map(digit => targetDigits[digit]).join('');
    };

    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');

    return `${convertNumber(dayStr)}/${convertNumber(monthStr)}`;
};

/**
 * Extracts and converts only the numeric part from jain_date strings like '15 (Poonam)'
 * @param {string} jainDate - The jain_date string (e.g., '15 (Poonam)')
 * @param {string} language - Target language code (defaults to current i18n language)
 * @returns {string} - Returns only the numeric part of the date, converted to the target language
 */
export const convertJainDateNumber = (jainDate, language = null) => {
    if (!jainDate) return '';

    // Extract the numeric part from the beginning of the string
    const match = jainDate.toString().match(/^(\d+)/);
    if (!match) return ''; // Return empty if no number found

    // Return only the converted number
    return convertDigitsOnly(match[1], language);
};

export const convertNumber = (num, language = 'gu') => {
    // Handle undefined, null, or empty values
    if (num === undefined || num === null || num === '') {
        return '';
    }

    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

    let targetDigits;
    if (language === 'gu') {
        targetDigits = gujaratiDigits;
    } else if (language === 'hi') {
        targetDigits = hindiDigits;
    } else {
        return num.toString(); // Return as is for English or other languages
    }

    return num.toString().replace(/[0-9]/g, (digit) => {
        return targetDigits[digit];
    });
};

export const formatTime = (timeString, language = 'en') => {

    if (!timeString) return '--:-- --'; // Handle empty or undefined time

    // Handle time range (e.g., "13:10 - 14:40")
    if (timeString.includes(' - ')) {
        const [startTime, endTime] = timeString.split(' - ');
        return `${formatSingleTime(startTime, language)} - ${formatSingleTime(endTime, language)}`;
    }

    return formatSingleTime(timeString, language);
};

const formatSingleTime = (timeString, language) => {
    let hours, minutes;
    let period = '';

    // Check if the time string includes AM/PM
    if (timeString.includes('AM') || timeString.includes('PM')) {
        const [timePart, timePeriod] = timeString.split(' ');
        [hours, minutes] = timePart.split(':').map(Number);
        period = timePeriod || '';

        // Convert to 24-hour format for proper Date handling
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
    } else {
        // Handle 24-hour format
        [hours, minutes] = timeString.split(':').map(Number);
    }

    // Create a date object with the current date and the given time
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // Format the time in 12-hour format with AM/PM
    let formattedTime = date.toLocaleTimeString(language, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

    // Convert numbers to the appropriate script if needed
    if (language === 'gu' || language === 'hi') {
        // Extract the time part and AM/PM part separately
        const [timePart, period] = formattedTime.split(' ');
        // Convert numbers in the time part
        const convertedTime = timePart.split('').map(char => {
            const digit = englishDigits.indexOf(char);
            return digit !== -1
                ? (language === 'gu' ? gujaratiDigits[digit] : hindiDigits[digit])
                : char;
        }).join('');

        // Return the converted time with period (AM/PM)
        return period ? `${convertedTime} ${period}` : convertedTime;
    }

    return formattedTime;
};

// Add this function to numberConverter.js
export const formatJainDate = (jainDateFull, language = null) => {
    if (!jainDateFull) return '';

    const currentLanguage = language || i18n.language || 'en';
    if (currentLanguage === 'en') return jainDateFull;

    // Handle the date format: "Month Sud/Vad Number" or "Month Sud/Vad Number (Text)"
    const dateParts = jainDateFull.split(' ');
    if (dateParts.length < 3) return jainDateFull; // Not in expected format

    const month = dateParts[0].toLowerCase();
    const sudVad = dateParts[1].toLowerCase();
    const number = dateParts[2];

    // Handle extra text in parentheses (e.g., "(Poonam)", "(Aamas)")
    let extraText = '';
    if (dateParts[3]) {
        // Extract text inside parentheses if it exists
        const match = jainDateFull.match(/\(([^)]+)\)/);
        if (match && match[1]) {
            const extraKey = match[1].toLowerCase();
            // Try to translate the extra text
            const translatedExtra = i18n.t(`date.extra.${extraKey}`, { defaultValue: `(${extraKey})` });
            extraText = ` ${translatedExtra}`;
        } else {
            extraText = ` ${dateParts[3]}`;
        }
    }

    // Get translations
    const translatedMonth = i18n.t(`date.month.${month}`, { defaultValue: month });
    const translatedSudVad = i18n.t(`date.${sudVad}`, { defaultValue: sudVad });
    const translatedNumber = convertDigitsOnly(number, currentLanguage);

    // Construct the final date string
    const formattedDate = `${translatedMonth} ${translatedSudVad} ${translatedNumber}${extraText}`;

    return formattedDate;
};


// Add this to numberConverter.js
export const formatMonthYear = (date, language = null) => {
    const currentLanguage = language || i18n.locale || 'en';
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear().toString(); // Convert year to string first

    // Get month names from i18n
    const monthNames = i18n.t('date.monthNames', { returnObjects: true });

    // Convert year digits to target language
    const formattedYear = convertDigitsOnly(year, i18n.locale);
    console.log('formattedYear', formattedYear);
    // If we have translated month names, use them
    if (monthNames && monthNames[month]) {
        return {
            month: monthNames[month],
            year: formattedYear
        };
    }

    // Fallback to default locale
    return {
        month: date.toLocaleString(currentLanguage, { month: 'long' }),
        year: formattedYear
    };
};