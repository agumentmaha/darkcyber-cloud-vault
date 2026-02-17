const { createClient } = require('@supabase/supabase-js');

async function check() {
    const slug = '668ff283b2e8';

    // Project 1 (Old)
    const url1 = "https://qwjjjjfhghnemqvlscyq.supabase.co";
    const key1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ampqamZoZ2huZW1xdmxzY3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODIxNTgsImV4cCI6MjA4NjY1ODE1OH0._wk53jDdVd_tkZLW9rnZf70mTHiUVo1u22NVjhsy_dQ";

    // Project 2 (New - Controlled)
    const url2 = "https://mppaccncoezmlvizmifu.supabase.co";
    const key2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcGFjY25jb2V6bWx2aXptaWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTk0OTgsImV4cCI6MjA4Njg5NTQ5OH0.ZPoeAkgyIMt1YEvOEAEx0jk074deIg2Xvb3wbESuK5Q";

    console.log(`Checking Slug: ${slug}`);

    const s1 = createClient(url1, key1);
    const { data: d1 } = await s1.from('files').select('filename, size').eq('unique_slug', slug).maybeSingle();
    console.log(`Project 1 (Old): ${d1 ? "FOUND - " + d1.filename : "NOT FOUND"}`);

    const s2 = createClient(url2, key2);
    const { data: d2 } = await s2.from('files').select('filename, size').eq('unique_slug', slug).maybeSingle();
    console.log(`Project 2 (New): ${d2 ? "FOUND - " + d2.filename : "NOT FOUND"}`);
}

check();
