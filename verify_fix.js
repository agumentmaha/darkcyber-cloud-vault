import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://mppaccncoezmlvizmifu.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcGFjY25jb2V6bWx2aXptaWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTk0OTgsImV4cCI6MjA4Njg5NTQ5OH0.ZPoeAkgyIMt1YEvOEAEx0jk074deIg2Xvb3wbESuK5Q";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
    console.log("Testing public access to 'files' table...");

    // List all files
    const { data, error } = await supabase
        .from('files')
        .select('filename, unique_slug, is_blocked, size');

    if (error) {
        console.error("❌ Error fetching files:", error.message);
    } else {
        console.log("All Files in DB:");
        data.forEach(f => {
            console.log(`- ${f.filename} | Slug: ${f.unique_slug} | ${f.is_blocked ? "BLOCKED" : "Active"}`);
        });
    }
}

verify();
