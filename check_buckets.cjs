const { createClient } = require('@supabase/supabase-js');

async function check() {
    const url1 = "https://qwjjjjfhghnemqvlscyq.supabase.co";
    const key1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ampqamZoZ2huZW1xdmxzY3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODIxNTgsImV4cCI6MjA4NjY1ODE1OH0._wk53jDdVd_tkZLW9rnZf70mTHiUVo1u22NVjhsy_dQ";

    const s1 = createClient(url1, key1);
    const { data: buckets, error } = await s1.storage.listBuckets();

    if (error) {
        console.log("Error listing buckets:", error.message);
    } else {
        console.log("Buckets found:", buckets.map(b => b.name));
    }
}

check();
