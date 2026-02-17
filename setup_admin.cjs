const { createClient } = require('@supabase/supabase-js');

async function setupAdmin() {
    const url = "https://mppaccncoezmlvizmifu.supabase.co";
    const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcGFjY25jb2V6bWx2aXptaWZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxOTQ5OCwiZXhwIjoyMDg2ODk1NDk4fQ.AzXMnfELZTNnejyhiiApqWc5RVWpJe9x2B7HLNkEQ_w";

    const supabase = createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const email = "darkcyberx2025@gmail.com";
    const password = "123456medoissaA@@";

    console.log(`Setting/Updating admin user: ${email}`);

    // 1. Get User
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error("❌ Error listing users:", listError.message);
        return;
    }

    let user = usersData.users.find(u => u.email === email);
    let userId;

    if (!user) {
        console.log("User not found, creating new account...");
        const { data: newData, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true
        });
        if (createError) {
            console.error("❌ Create Error:", createError.message);
            return;
        }
        userId = newData.user.id;
    } else {
        console.log("User found, updating password...");
        userId = user.id;
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: password,
            email_confirm: true
        });
        if (updateError) {
            console.error("❌ Update Error:", updateError.message);
            return;
        }
    }

    // 2. Clear other admins
    console.log("Cleaning other admin roles...");
    await supabase.from('user_roles').delete().eq('role', 'admin').neq('user_id', userId);

    // 3. Confirm Role
    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });

    if (roleError) {
        console.error("❌ Role Error:", roleError.message);
    } else {
        console.log("✅ Admin account and password confirmed successfully.");
    }
}

setupAdmin();
