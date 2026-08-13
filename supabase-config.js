// ============================================================
// supabase-config.js - FIXED FOR NEW API KEYS
// ============================================================

console.log('🚀 Loading supabase-config.js...');

// ============================================================
// 1. SUPABASE CREDENTIALS - USING NEW PUBLISHABLE KEY
// ============================================================
const SUPABASE_URL = 'https://tikhrcjjaykmrykelnbi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZzF19r4V9_wZpMgkiPnF8Q_AhaVOB_G';

// ============================================================
// 2. INITIALIZE SUPABASE
// ============================================================
let supabaseClient;

if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase client library not loaded!');
    throw new Error('Supabase client library not loaded');
}

if (typeof window._supabaseClient === 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    window._supabaseClient = supabaseClient;
    console.log('✅ Supabase client initialized');
} else {
    supabaseClient = window._supabaseClient;
    console.log('✅ Using existing Supabase client');
}

// ============================================================
// 3. CREATE USER FUNCTION
// ============================================================
async function createUser(userData) {
    console.log('📝 Creating user:', userData.email);
    
    try {
        // Register with Supabase Auth
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

        // Insert into users table
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
// 4. LOG ACTIVITY FUNCTION
// ============================================================
async function logActivity(userId, action, description) {
    console.log('📝 Logging activity:', { userId, action, description });
    return { success: true };
}

// ============================================================
// 5. EXPOSE FUNCTIONS GLOBALLY
// ============================================================
window.supabaseFunctions = {
    createUser: createUser,
    logActivity: logActivity,
    supabase: supabaseClient
};

console.log('✅ Supabase Functions Loaded Successfully!');
console.log('📊 Connected to:', SUPABASE_URL);
console.log('📦 Available functions:', Object.keys(window.supabaseFunctions));
