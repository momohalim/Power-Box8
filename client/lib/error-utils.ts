// Error logging utility to prevent [object Object] console messages

export interface ErrorDetails {
  message?: string;
  code?: string;
  details?: any;
  hint?: string;
  stack?: string;
}

/**
 * Safely extracts error information from any error object
 * Prevents [object Object] console logging issues
 */
export function extractErrorInfo(error: any): ErrorDetails {
  if (!error) {
    return { message: "Unknown error (null/undefined)" };
  }

  // If it's already a string, return it
  if (typeof error === "string") {
    return { message: error };
  }

  // If it's a standard Error object
  if (error instanceof Error) {
    return {
      message: error.message || "Unknown error",
      stack: error.stack,
    };
  }

  // If it's a Supabase error object
  if (typeof error === "object") {
    return {
      message: error.message || error.msg || "Unknown error",
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
  }

  // Fallback for any other type
  return {
    message: String(error),
  };
}

/**
 * Safe console.error that never shows [object Object]
 */
export function logError(prefix: string, error: any): void {
  const errorInfo = extractErrorInfo(error);
  console.error(prefix, errorInfo);
}

/**
 * Safe console.error for database errors specifically
 */
export function logDatabaseError(section: string, error: any): void {
  const errorInfo = extractErrorInfo(error);
  console.error(`Database connection error for ${section}:`, errorInfo);
}
