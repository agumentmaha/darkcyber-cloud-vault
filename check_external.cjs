const { createClient } = require('@supabase/supabase-js');

async function check() {
    const url = "https://qwjjjjfhghnemqvlscyq.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ampqamZoZ2huZW1xdmxzY3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODIxNTgsImV4cCI6MjA4NjY1ODE1OH0._wk53jDdVd_tkZLW9rnZf70mTHiUVo1u22NVjhsy_dQ";

    const supabase = createClient(url, key);
    console.log(`Checking project: ${url}`);
    const { data, error } = await supabase
        .from('files')
        .select('filename, unique_slug, is_blocked')
        .eq('unique_slug', '4f758b335dba')
        .maybeSingle();

    if (error) {
        console.error("❌ Error:", error.message);
    } else if (data) {
        console.log("✅ Success! File found in this project:");
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log("❓ Project reachable, but slug NOT found.");

        // List some slugs
        const { data: list } = await supabase.from('files').select('unique_slug').limit(5);
        console.log("Available slugs in this project:", list?.map(f => f.unique_slug));
    }
}

check();
