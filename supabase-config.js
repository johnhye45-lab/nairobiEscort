// ============================================================
// supabase-config.js - Complete Supabase Integration
// ============================================================

const SUPABASE_URL = 'https://tikhrcjjaykmrykelnbi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZzF19r4V9_wZpMgkiPnF8Q_AhaVOB_G';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// USERS TABLE FUNCTIONS
// ============================================================

// Create new user
async function createUser(userData) {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{
                full_name: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                password_hash: userData.password, // In production, hash this!
                role: userData.role || 'client',
                location: userData.location || '',
                bio: userData.bio || '',
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create user error:', error);
        return { success: false, error: error.message };
    }
}

// Get all users
async function getUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get users error:', error);
        return { success: false, error: error.message };
    }
}

// Get user by email
async function getUserByEmail(email) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return { success: true, data: data || null };
    } catch (error) {
        console.error('Get user by email error:', error);
        return { success: false, error: error.message };
    }
}

// Get user by ID
async function getUserById(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get user by ID error:', error);
        return { success: false, error: error.message };
    }
}

// Update user status
async function updateUserStatus(userId, status) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ 
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update user status error:', error);
        return { success: false, error: error.message };
    }
}

// Update user profile
async function updateUser(userId, userData) {
    try {
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
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, error: error.message };
    }
}

// Delete user
async function deleteUser(userId) {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// ESCORTS TABLE FUNCTIONS
// ============================================================

// Get all approved escorts
async function getEscorts() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'escort')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get escorts error:', error);
        return { success: false, error: error.message };
    }
}

// Get premium escorts
async function getPremiumEscorts() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'escort')
            .eq('status', 'approved')
            .eq('is_premium', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get premium escorts error:', error);
        return { success: false, error: error.message };
    }
}

// Get escort by ID
async function getEscortById(escortId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', escortId)
            .eq('role', 'escort')
            .single();
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get escort by ID error:', error);
        return { success: false, error: error.message };
    }
}

// Update escort profile
async function updateEscortProfile(escortId, profileData) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                bio: profileData.bio,
                location: profileData.location,
                is_premium: profileData.isPremium || false,
                is_featured: profileData.isFeatured || false,
                is_verified: profileData.isVerified || false,
                updated_at: new Date().toISOString()
            })
            .eq('id', escortId)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update escort profile error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// REVIEWS TABLE FUNCTIONS
// ============================================================

// Get reviews for an escort
async function getEscortReviews(escortId) {
    try {
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
        return { success: true, data: data };
    } catch (error) {
        console.error('Get escort reviews error:', error);
        return { success: false, error: error.message };
    }
}

// Create review
async function createReview(reviewData) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                escort_id: reviewData.escortId,
                user_id: reviewData.userId,
                rating: reviewData.rating,
                comment: reviewData.comment,
                is_approved: false,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create review error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// MESSAGES TABLE FUNCTIONS
// ============================================================

// Send message
async function sendMessage(messageData) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender_id: messageData.senderId,
                receiver_id: messageData.receiverId,
                message: messageData.message,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Send message error:', error);
        return { success: false, error: error.message };
    }
}

// Get messages for user
async function getUserMessages(userId) {
    try {
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
        return { success: true, data: data };
    } catch (error) {
        console.error('Get user messages error:', error);
        return { success: false, error: error.message };
    }
}

// Mark message as read
async function markMessageRead(messageId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Mark message read error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// FAVORITES TABLE FUNCTIONS
// ============================================================

// Add favorite
async function addFavorite(userId, escortId) {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .insert([{
                user_id: userId,
                escort_id: escortId,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Add favorite error:', error);
        return { success: false, error: error.message };
    }
}

// Remove favorite
async function removeFavorite(userId, escortId) {
    try {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('escort_id', escortId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Remove favorite error:', error);
        return { success: false, error: error.message };
    }
}

// Get user favorites
async function getUserFavorites(userId) {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                *,
                escort:escort_id (full_name, email, location)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get user favorites error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// STATISTICS FUNCTIONS
// ============================================================

// Get dashboard statistics
async function getStats() {
    try {
        const usersResult = await getUsers();
        if (!usersResult.success) throw usersResult.error;
        
        const userList = usersResult.data || [];
        
        const total = userList.length;
        const pending = userList.filter(u => u.status === 'pending').length;
        const approved = userList.filter(u => u.status === 'approved').length;
        const rejected = userList.filter(u => u.status === 'rejected').length;
        
        const today = new Date();
        const newToday = userList.filter(u => {
            const created = new Date(u.created_at);
            return created.toDateString() === today.toDateString();
        }).length;
        
        const roles = {
            admin: userList.filter(u => u.role === 'admin').length,
            escort: userList.filter(u => u.role === 'escort').length,
            agency: userList.filter(u => u.role === 'agency').length,
            client: userList.filter(u => u.role === 'client').length
        };
        
        return { 
            success: true, 
            data: { total, pending, approved, rejected, newToday, roles, users: userList }
        };
    } catch (error) {
        console.error('Get stats error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

// Login user
async function loginUser(email, password) {
    try {
        const result = await getUserByEmail(email);
        if (!result.success) throw new Error(result.error);
        
        const user = result.data;
        
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        
        if (user.password_hash !== password) {
            return { success: false, error: 'Invalid password' };
        }
        
        if (user.status === 'pending') {
            return { success: false, error: 'Account pending approval' };
        }
        
        if (user.status === 'rejected') {
            return { success: false, error: 'Account was rejected' };
        }
        
        if (user.status === 'suspended') {
            return { success: false, error: 'Account is suspended' };
        }
        
        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
        
        return { success: true, data: user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Login admin
async function loginAdmin(email, password) {
    try {
        const result = await loginUser(email, password);
        if (!result.success) return result;
        
        const user = result.data;
        
        if (user.role !== 'admin') {
            return { success: false, error: 'Not an admin account' };
        }
        
        if (user.status !== 'approved') {
            return { success: false, error: 'Admin account not approved' };
        }
        
        return { success: true, data: user };
    } catch (error) {
        console.error('Admin login error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// ACTIVITY LOG FUNCTIONS
// ============================================================

// Log user activity
async function logActivity(userId, action, details = '') {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .insert([{
                user_id: userId,
                action: action,
                details: details,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Log activity error:', error);
        return { success: false, error: error.message };
    }
}

// Get user activity
async function getUserActivity(userId, limit = 50) {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Get user activity error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// SEARCH FUNCTIONS
// ============================================================

// Search escorts
async function searchEscorts(searchTerm, filters = {}) {
    try {
        let query = supabase
            .from('users')
            .select('*')
            .eq('role', 'escort')
            .eq('status', 'approved');
        
        // Apply search term
        if (searchTerm) {
            query = query.ilike('full_name', `%${searchTerm}%`);
        }
        
        // Apply location filter
        if (filters.location) {
            query = query.eq('location', filters.location);
        }
        
        // Apply premium filter
        if (filters.premium) {
            query = query.eq('is_premium', true);
        }
        
        // Apply verified filter
        if (filters.verified) {
            query = query.eq('is_verified', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Search escorts error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================
// Make functions available globally
window.supabaseFunctions = {
    // Users
    createUser,
    getUsers,
    getUserByEmail,
    getUserById,
    updateUserStatus,
    updateUser,
    deleteUser,
    
    // Escorts
    getEscorts,
    getPremiumEscorts,
    getEscortById,
    updateEscortProfile,
    
    // Reviews
    getEscortReviews,
    createReview,
    
    // Messages
    sendMessage,
    getUserMessages,
    markMessageRead,
    
    // Favorites
    addFavorite,
    removeFavorite,
    getUserFavorites,
    
    // Statistics
    getStats,
    
    // Authentication
    loginUser,
    loginAdmin,
    
    // Activity
    logActivity,
    getUserActivity,
    
    // Search
    searchEscorts,
    
    // Supabase client
    supabase
};

console.log('✅ Supabase Functions Loaded Successfully!');
console.log('📊 Connected to:', SUPABASE_URL);
console.log('🔑 Using key:', SUPABASE_KEY.substring(0, 20) + '...');
