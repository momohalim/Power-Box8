import { supabase } from "@/lib/supabaseClient";

/**
 * Creates a test admin user for development purposes
 */
export async function createTestAdminUser() {
  const testEmail = "admin@test.com";
  const testPassword = "admin123456";

  try {
    console.log("🔧 Creating test admin user...");

    // Try to sign up the test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      },
    );

    if (signUpError && signUpError.message !== "User already registered") {
      console.error("❌ Error creating test user:", signUpError);
      return { success: false, error: signUpError.message };
    }

    console.log("✅ Test admin user ready:", testEmail);
    return {
      success: true,
      credentials: { email: testEmail, password: testPassword },
      message:
        "Test admin user created. Use admin@test.com / admin123456 to login.",
    };
  } catch (error) {
    console.error("❌ Exception creating test user:", error);
    return { success: false, error: "Failed to create test user" };
  }
}

/**
 * Signs in with the test admin credentials
 */
export async function signInAsTestAdmin() {
  const testEmail = "admin@test.com";
  const testPassword = "admin123456";

  try {
    console.log("🔐 Signing in as test admin...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error("❌ Test admin sign in error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Test admin signed in successfully");
    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Exception signing in test admin:", error);
    return { success: false, error: "Failed to sign in" };
  }
}

/**
 * Checks if we have a valid authenticated session
 */
export async function checkAuthStatus() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Error checking auth status:", error);
      return { authenticated: false, error: error.message };
    }

    if (session?.user) {
      console.log("✅ User is authenticated:", session.user.email);
      return { authenticated: true, user: session.user };
    }

    console.log("❌ No authenticated session found");
    return { authenticated: false };
  } catch (error) {
    console.error("❌ Exception checking auth status:", error);
    return { authenticated: false, error: "Failed to check auth status" };
  }
}
