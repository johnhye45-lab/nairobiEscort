// ============================================================
// supabase-config.js - CORRECTED VERSION
// ============================================================

console.log('🚀 Loading supabase-config.js...');

// ============================================================
// 1. SUPABASE CREDENTIALS
// ============================================================
const SUPABASE_URL = 'https://tikhrcjjaykmrykelnbi.supabase.co';

// ⚠️ IMPORTANT: Replace this with your REAL anon public key from Supabase
// Go to: Settings → API → Project API Keys → anon public
const SUPABASE_KEY = 'YOUR_ACTUAL_ANON_KEY_HERE'; // <-- REPLACE THIS!

// ============================================================
// 2. CHECK IF SUPABASE CLIENT IS AVAILABLE
// ============================================================
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase client not loaded!');
}

// ============================================================
// 3. INITIALIZE SUPABASE - ONLY ONCE!
// ============================================================
// Check if already initialized to avoid duplicate declaration
let supabaseClient;

if (typeof window._supabaseClient === 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window._supabaseClient = supabaseClient;
    console.log('✅ Supabase client initialized');
} else {
    supabaseClient = window._supabaseClient;
    console.log('✅ Using existing Supabase client');
}

// ============================================================
// 4. CREATE USER FUNCTION
// ============================================================
async function createUser(userData) {
    console.log('📝 Creating user:', userData.email);
    
    try {
        // Step 1: Register with Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.fullName,
                    phone: userData.phone,
                    role: userData.role || 'client',
                    location: userData.location || '',
                    bio: userData.bio || '',
                    status: 'pending'
                }
            }
        });

        if (authError) {
            console.error('❌ Auth error:', authError);
            return { success: false, error: authError.message };
        }

        console.log('✅ Auth user created:', authData.user.id);

        // Step 2: Insert into users table (if it exists)
        try {
            const { data: userResult, error: userError } = await supabaseClient
                .from('users')
                .insert([{
                    id: authData.user.id,
                    full_name: userData.fullName,
                    email: userData.email,
                    phone: userData.phone,
                    role: userData.role || 'client',
                    location: userData.location || '',
                    bio: userData.bio || '',
                    status: 'pending',
                    created_at: new Date().toISOString()
                }])
                .select();

            if (userError) {
                console.warn('⚠️ Could not save to users table:', userError.message);
                return { 
                    success: true, 
                    data: authData.user,
                    warning: 'User created but profile save failed'
                };
            }

            console.log('✅ User saved to database');
            return { success: true, data: userResult[0] || authData.user };
            
        } catch (dbError) {
            console.warn('⚠️ Database insert error:', dbError.message);
            return { 
                success: true, 
                data: authData.user,
                warning: 'User created but profile save failed'
            };
        }

    } catch (error) {
        console.error('❌ Create user error:', error);
        return { success: false, error: error.message || 'Registration failed' };
    }
}

// ============================================================
// 5. LOG ACTIVITY FUNCTION
// ============================================================
async function logActivity(userId, action, description) {
    console.log('📝 Logging activity:', { userId, action, description });
    
    try {
        const { error } = await supabaseClient
            .from('activity_logs')
            .insert([{
                user_id: userId,
                action: action,
                description: description,
                created_at: new Date().toISOString()
            }]);
        
        if (error) {
            console.warn('⚠️ Could not log activity:', error.message);
            return { success: true, warning: 'Activity not logged' };
        }
        
        return { success: true };
    } catch (error) {
        console.warn('⚠️ Activity log error:', error.message);
        return { success: true, warning: 'Activity not logged' };
    }
}

// ============================================================
// 6. EXPOSE FUNCTIONS GLOBALLY
// ============================================================
window.supabaseFunctions = {
    createUser: createUser,
    logActivity: logActivity,
    supabase: supabaseClient
};

console.log('✅ Supabase Functions Loaded Successfully!');
console.log('📊 Connected to:', SUPABASE_URL);
console.log('📦 Available functions:', Object.keys(window.supabaseFunctions));
