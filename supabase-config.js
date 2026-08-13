// ============================================================
// supabase-config.js - Complete Supabase Integration
// ============================================================

const SUPABASE_URL = 'https://tikhrcjjaykmrykelnbi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpa2hyY2pqYXlrbXJ5a2VsbmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNDQ4MDAsImV4cCI6MjAxOTYyMDgwMH0.YOUR_ACTUAL_KEY_HERE'; // <-- REPLACE WITH REAL KEY

// Initialize Supabase client - ONLY ONCE
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ... rest of your code stays the same
