-- Remove the legacy auth.users signup trigger.
-- Campus Tribe now bootstraps the profile/institution binding after the user
-- confirms email or completes Google sign-in on the Campus Tribe app.
--
-- The old trigger wrote directly into ct_users during auth.users insert and can
-- fail before the user even reaches the app (for example when the remote schema
-- drifts from the original trigger assumptions). That causes Supabase signup to
-- abort with "Database error saving new user".
--
-- Keeping the trigger is also redundant now that AuthContext.bootstrapProfileIfMissing
-- owns profile creation, institution creation/join logic, welcome notifications,
-- and post-auth dashboard routing.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

NOTIFY pgrst, 'reload schema';
