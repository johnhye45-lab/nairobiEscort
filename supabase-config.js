// ============================================================
// supabase-config.js - Complete Supabase Integration
// ============================================================

const SUPABASE_URL = 'https://yimuokwkztvkmygpcryy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kXy5TwehCw1tu85MnrZ-og_pF1xjrzE';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// USERS TABLE FUNCTIONS
// ============================================================

// Create new user
async function createUser(userData) {
    const { data, error } = await supabase
        .from('users')
        .insert([{
            full_name: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            role: userData.role || 'client',
            location: userData.location || '',
            bio: userData.bio || '',
            status: 'pending'
        }])
        .select();
    
    if (error) throw error;
    return data;
}

// Get all users
async function getUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

// Get user by email
async function getUserByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

// Get user by ID
async function getUserById(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
}

// Update user status
async function updateUserStatus(userId, status) {
    const { data, error } = await supabase
        .from('users')
        .update({ 
            status: status,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
    
    if (error) throw error;
    return data;
}

// Update user profile
async function updateUser(userId, userData) {
    const { data, error } = await supabase
        .from('users')
        .update({
            full_name: userData.fullName,
            phone: userData.phone,
            location: userData.location,
            bio: userData.bio,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
    
    if (error) throw error;
    return data;
}

// Delete user
async function deleteUser(userId) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
    
    if (error) throw error;
    return true;
}

// ============================================================
// ESCORTS TABLE FUNCTIONS
// ============================================================

// Get all approved escorts
async function getEscorts() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'escort')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

// Get escort by ID
async function getEscortById(escortId) {
    const { data, error } = await supabase
        .from('users')
        .select(`
            *,
            escorts (*)
        `)
        .eq('id', escortId)
        .eq('role', 'escort')
        .single();
    
    if (error) throw error;
    return data;
}

// Create escort profile
async function createEscortProfile(profileData) {
    const { data, error } = await supabase
        .from('escorts')
        .insert([profileData])
        .select();
    
    if (error) throw error;
    return data;
}

// Update escort profile
async function updateEscortProfile(escortId, profileData) {
    const { data, error } = await supabase
        .from('escorts')
        .update(profileData)
        .eq('user_id', escortId)
        .select();
    
    if (error) throw error;
    return data;
}

// ============================================================
// REVIEWS TABLE FUNCTIONS
// ============================================================

// Get reviews for an escort
async function getEscortReviews(escortId) {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            users:user_id (full_name, email)
        `)
        .eq('escort_id', escortId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

// Create review
async function createReview(reviewData) {
    const { data, error } = await supabase
        .from('reviews')
        .insert([{
            escort_id: reviewData.escortId,
            user_id: reviewData.userId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            is_approved: false
        }])
        .select();
    
    if (error) throw error;
    return data;
}

// ============================================================
// MESSAGES TABLE FUNCTIONS
// ============================================================

// Send message
async function sendMessage(messageData) {
    const { data, error } = await supabase
        .from('messages')
        .insert([{
            sender_id: messageData.senderId,
            receiver_id: messageData.receiverId,
            message: messageData.message
        }])
        .select();
    
    if (error) throw error;
    return data;
}

// Get messages for user
async function getUserMessages(userId) {
    const { data, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:sender_id (full_name, email),
            receiver:receiver_id (full_name, email)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

// Mark message as read
async function markMessageRead(messageId) {
    const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select();
    
    if (error) throw error;
    return data;
}

// ============================================================
// STATISTICS FUNCTIONS
// ============================================================

// Get dashboard statistics
async function getStats() {
    const users = await getUsers();
    
    const total = users.length;
    const pending = users.filter(u => u.status === 'pending').length;
    const approved = users.filter(u => u.status === 'approved').length;
    const rejected = users.filter(u => u.status === 'rejected').length;
    
    const today = new Date();
    const newToday = users.filter(u => {
        const created = new Date(u.created_at);
        return created.toDateString() === today.toDateString();
    }).length;
    
    const roles = {
        admin: users.filter(u => u.role === 'admin').length,
        escort: users.filter(u => u.role === 'escort').length,
        agency: users.filter(u => u.role === 'agency').length,
        client: users.filter(u => u.role === 'client').length
    };
    
    return { total, pending, approved, rejected, newToday, roles, users };
}

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

// Login user
async function loginUser(email, password) {
    const user = await getUserByEmail(email);
    
    if (!user) {
        throw new Error('User not found');
    }
    
    if (user.password !== password) {
        throw new Error('Invalid password');
    }
    
    if (user.status === 'pending') {
        throw new Error('Account pending approval');
    }
    
    if (user.status === 'rejected') {
        throw new Error('Account was rejected');
    }
    
    return user;
}

// Login admin
async function loginAdmin(email, password) {
    const user = await getUserByEmail(email);
    
    if (!user) {
        throw new Error('Admin not found');
    }
    
    if (user.role !== 'admin') {
        throw new Error('Not an admin account');
    }
    
    if (user.password !== password) {
        throw new Error('Invalid password');
    }
    
    if (user.status === 'pending') {
        throw new Error('Admin account pending approval');
    }
    
    return user;
}

// ============================================================
// ACTIVITY LOG FUNCTIONS
// ============================================================

// Log user activity
async function logActivity(userId, action, details = '') {
    const { data, error } = await supabase
        .from('activity_logs')
        .insert([{
            user_id: userId,
            action: action,
            details: details,
            ip_address: '' // You can add IP tracking here
        }])
        .select();
    
    if (error) throw error;
    return data;
}

// Get user activity
async function getUserActivity(userId) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
    
    if (error) throw error;
    return data;
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================
// Make functions available globally
window.supabaseFunctions = {
    createUser,
    getUsers,
    getUserByEmail,
    getUserById,
    updateUserStatus,
    updateUser,
    deleteUser,
    getEscorts,
    getEscortById,
    createEscortProfile,
    updateEscortProfile,
    getEscortReviews,
    createReview,
    sendMessage,
    getUserMessages,
    markMessageRead,
    getStats,
    loginUser,
    loginAdmin,
    logActivity,
    getUserActivity
};

console.log('✅ Supabase Functions Loaded!');
console.log('📊 Connected to:', SUPABASE_URL);
