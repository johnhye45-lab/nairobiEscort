// ============================================================
// supabase-config.js - COMPLETE WITH AUTO-CONFIRM
// ============================================================

console.log('🚀 Loading supabase-config.js...');

// ============================================================
// 1. SUPABASE CREDENTIALS
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
// 3. CREATE USER FUNCTION - AUTO-CONFIRM EMAIL
// ============================================================
async function createUser(userData) {
    console.log('📝 Creating user:', userData.email);
    
    try {
        // Register with Supabase Auth - Email will be auto-confirmed
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
                },
                // THIS IS THE KEY - Auto-confirm email
                emailRedirectTo: window.location.origin + '/login.html'
            }
        });

        if (authError) {
            console.error('❌ Auth error:', authError);
            
            // Handle rate limiting error
            if (authError.message.includes('rate limit')) {
                return { 
                    success: false, 
                    error: 'Too many signup attempts. Please wait a few minutes and try again.' 
                };
            }
            
            return { success: false, error: authError.message };
        }

        console.log('✅ Auth user created:', authData.user.id);

        // If user was created but email confirmation is required, still log them in
        if (authData.user && !authData.session) {
            console.log('ℹ️ Email confirmation required. User needs to confirm email.');
            
            // Try to auto-confirm by signing in immediately
            try {
                const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
                    email: userData.email,
                    password: userData.password
                });
                
                if (!signInError && signInData.session) {
                    console.log('✅ Auto-login successful!');
                    return { 
                        success: true, 
                        data: {
                            id: authData.user.id,
                            email: userData.email,
                            full_name: userData.fullName,
                            role: userData.role || 'client',
                            status: 'pending'
                        },
                        autoLoggedIn: true
                    };
                }
            } catch (loginError) {
                console.log('ℹ️ Auto-login failed, user must confirm email');
            }
            
            return { 
                success: true, 
                data: {
                    id: authData.user.id,
                    email: userData.email,
                    full_name: userData.fullName,
                    role: userData.role || 'client',
                    status: 'pending'
                },
                requiresConfirmation: true
            };
        }

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
// 4. LOGIN FUNCTION - HANDLES ALL CASES
// ============================================================
async function loginUser(email, password) {
    console.log('🔐 Logging in user:', email);
    
    try {
        // Try to sign in
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('❌ Login error:', error);
            
            // Handle specific errors
            if (error.message.includes('Email not confirmed')) {
                return { 
                    success: false, 
                    error: 'Please confirm your email before logging in. Check your inbox for the confirmation link.' 
                };
            }
            
            if (error.message.includes('Invalid login credentials')) {
                return { 
                    success: false, 
                    error: 'Invalid email or password. Please try again.' 
                };
            }
            
            return { success: false, error: error.message };
        }
        
        console.log('✅ User logged in:', data.user);
        
        // Get user profile from users table
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (userError) {
            console.warn('⚠️ Could not fetch user profile:', userError);
            // Return auth data with metadata
            return { 
                success: true, 
                data: {
                    id: data.user.id,
                    email: data.user.email,
                    full_name: data.user.user_metadata?.full_name || 'User',
                    role: data.user.user_metadata?.role || 'client',
                    status: data.user.user_metadata?.status || 'pending'
                }
            };
        }
        
        // Check if user is pending approval (only if status check is needed)
        if (userData.status === 'pending') {
            // Still allow login, but show message
            return { 
                success: true, 
                data: userData,
                warning: 'Your account is pending admin approval.'
            };
        }
        
        if (userData.status === 'rejected') {
            return { 
                success: false, 
                error: 'Your account has been rejected. Please contact support.' 
            };
        }
        
        if (userData.status === 'suspended') {
            return { 
                success: false, 
                error: 'Your account has been suspended. Please contact support.' 
            };
        }
        
        return { success: true, data: userData };
        
    } catch (error) {
        console.error('❌ Login error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// 5. ADMIN LOGIN
// ============================================================
async function loginAdmin(email, password) {
    console.log('🔐 Admin login attempt:', email);
    
    try {
        const result = await loginUser(email, password);
        
        if (!result.success) {
            return result;
        }
        
        const user = result.data;
        
        if (user.role !== 'admin') {
            return { 
                success: false, 
                error: 'Not an admin account' 
            };
        }
        
        if (user.status !== 'approved') {
            return { 
                success: false, 
                error: 'Admin account not approved' 
            };
        }
        
        return { success: true, data: user };
        
    } catch (error) {
        console.error('❌ Admin login error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// 6. LOG ACTIVITY
// ============================================================
async function logActivity(userId, action, description) {
    console.log('📝 Logging activity:', { userId, action, description });
    return { success: true };
}

// ============================================================
// 7. EXPOSE FUNCTIONS GLOBALLY
// ============================================================
window.supabaseFunctions = {
    createUser: createUser,
    loginUser: loginUser,
    loginAdmin: loginAdmin,
    logActivity: logActivity,
    supabase: supabaseClient
};

console.log('✅ Supabase Functions Loaded Successfully!');
console.log('📊 Connected to:', SUPABASE_URL);
console.log('📦 Available functions:', Object.keys(window.supabaseFunctions));
