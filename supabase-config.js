// ============================================================
// supabase-config.js - Complete Supabase Integration
// ============================================================

const SUPABASE_URL = 'https://tikhrcjjaykmrykelnbi.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY_HERE'; // <-- PASTE YOUR REAL ANON KEY HERE!

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

// Create new user with Supabase Auth
async function createUser(userData) {
    try {
        console.log('📝 Creating user:', userData.email);
        
        // 1. Register with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
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
        
        // 2. Insert into users table
        const { data: userResult, error: userError } = await supabase
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
            console.error('❌ User table error:', userError);
            return { success: false, error: userError.message };
        }
        
        console.log('✅ User saved to database');
        return { success: true, data: userResult[0] };
        
    } catch (error) {
        console.error('❌ Create user error:', error);
        return { success: false, error: error.message };
    }
}

// Log activity (simplified)
async function logActivity(userId, action, description) {
    try {
        console.log('📝 Logging activity:', { userId, action, description });
        // You can uncomment this if you have an activity_logs table
        /*
        const { data, error } = await supabase
            .from('activity_logs')
            .insert([{
                user_id: userId,
                action: action,
                description: description,
                created_at: new Date().toISOString()
            }]);
        if (error) throw error;
        */
        return { success: true };
    } catch (error) {
        console.error('❌ Log activity error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================================
window.supabaseFunctions = {
    createUser: createUser,
    logActivity: logActivity,
    supabase: supabase
};

console.log('✅ Supabase Functions Loaded Successfully!');
console.log('📊 Connected to:', SUPABASE_URL);
console.log('🔑 Using key:', SUPABASE_KEY.substring(0, 20) + '...');
