// Robust error handler that prevents [object Object] console messages

export function getErrorMessage(error: any): string {
  if (!error) return "Unknown error";

  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  // Handle Supabase/PostgreSQL errors
  if (error && typeof error === "object") {
    if (error.message) return error.message;
    if (error.msg) return error.msg;
    if (error.error) return error.error;
    if (error.details) return `Error: ${error.details}`;
    if (error.hint) return `Hint: ${error.hint}`;
    if (error.code === "PGRST116") return "Table does not exist";
    if (error.code === "42P01") return "Relation does not exist";
    if (error.code) return `Database error: ${error.code}`;
  }

  // Last resort - convert to string safely
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return "Complex error object (cannot stringify)";
  }
}

export function logDatabaseError(context: string, error: any): void {
  const message = getErrorMessage(error);
  console.error(`${context}: ${message}`);

  // Also log the raw error object for debugging
  if (error && typeof error === "object") {
    console.error(`${context} raw error:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    });
  }
}
