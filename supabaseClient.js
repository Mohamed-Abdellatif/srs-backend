import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = "https://xovuhzspzuxthtjmxdcb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdnVoenNwenV4dGh0am14ZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxOTgsImV4cCI6MjA1NjE1MzE5OH0.DenZDMJXBvxSQgp9DxamxWnNg279Sr14xyPLYlBC5sU";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
