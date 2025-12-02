interface Profile {
  name?: string | null;
  phone?: string | null;
  location?: string | null;
  gender?: string | null;
  age?: number | null;
  height_ft?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  marital_status?: string | null;
  shift_preferences?: string[] | null;
  skills?: string[] | null;
  cv_url?: string | null;
  certificate_url?: string | null;
  nid_number?: string | null;
}

interface CompletionResult {
  percentage: number;
  isVerified: boolean;
  missingFields: string[];
}

// Define which fields are required for verification
const REQUIRED_FIELDS: (keyof Profile)[] = [
  'name',
  'phone',
  'location',
  'gender',
  'age',
];

// Optional but counted fields
const OPTIONAL_FIELDS: (keyof Profile)[] = [
  'height_ft',
  'weight_kg',
  'marital_status',
  'nid_number',
];

// Fields that count towards completion
const ALL_COMPLETION_FIELDS: (keyof Profile)[] = [
  ...REQUIRED_FIELDS,
  ...OPTIONAL_FIELDS,
  'shift_preferences',
  'skills',
  'cv_url',
  'certificate_url',
];

// For verification badge: must have all required fields + certificate
const VERIFICATION_FIELDS: (keyof Profile)[] = [
  ...REQUIRED_FIELDS,
  'certificate_url',
];

export function calculateProfileCompletion(profile: Profile): CompletionResult {
  const missingFields: string[] = [];
  let filledCount = 0;

  for (const field of ALL_COMPLETION_FIELDS) {
    const value = profile[field];
    
    // Check if field has a value
    const hasValue = 
      value !== null && 
      value !== undefined && 
      value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true);

    if (hasValue) {
      filledCount++;
    } else if (REQUIRED_FIELDS.includes(field)) {
      // Map field names to human-readable labels
      const fieldLabels: Record<string, string> = {
        name: 'Full Name',
        phone: 'Phone Number',
        location: 'Location',
        gender: 'Gender',
        age: 'Age',
      };
      missingFields.push(fieldLabels[field] || field);
    }
  }

  const percentage = Math.round((filledCount / ALL_COMPLETION_FIELDS.length) * 100);

  // Check if verified (all required fields + certificate)
  const isVerified = VERIFICATION_FIELDS.every(field => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true);
  });

  return {
    percentage,
    isVerified,
    missingFields,
  };
}
