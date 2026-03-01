// Shared validation rules for all forms

export const rules = {
    required: (v) => (!v || String(v).trim() === '') ? 'This field is required' : null,
    minLen2: (v) => v && v.trim().length < 2 ? 'Must be at least 2 characters' : null,
    email: (v) => {
        if (!v) return 'Email is required'
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address'
    },
    phone: (v) => {
        if (!v) return 'Phone number is required'
        const digits = v.replace(/\s/g, '')
        return /^\d{10}$/.test(digits) ? null : 'Phone must be exactly 10 digits'
    },
    dob: (v) => {
        if (!v) return 'Date of birth is required'
        const date = new Date(v)
        if (date > new Date()) return 'Date of birth cannot be in the future'
        if (date.getFullYear() > 2010) return 'Date of birth must be 2010 or earlier'
        return null
    },
    gender: (v) => (!v ? 'Please select a gender' : null),
    year: (v) => {
        if (!v) return null // optional
        const n = parseInt(v)
        if (isNaN(n) || n < 1900 || n > 2100) return 'Invalid year'
        return null
    },
}

// Validate the whole form by category
export function validatePersonBase(form) {
    return {
        first_name: rules.required(form.first_name) || rules.minLen2(form.first_name),
        last_name: rules.required(form.last_name) || rules.minLen2(form.last_name),
        date_of_birth: rules.dob(form.date_of_birth),
        gender: rules.gender(form.gender),
        email: rules.email(form.email),
        phone_number: rules.phone(form.phone_number),
    }
}

export const hasErrors = (errs) =>
    Object.values(errs).some(Boolean)
