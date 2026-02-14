import { useEffect, useState } from "react";
import { Users, Files, HardDrive, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, filesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("files").select("size"),
      ]);

      setUserCount(profilesRes.count || 0);
      if (filesRes.data) {
        setFileCount(filesRes.data.length);
        setTotalSize(filesRes.data.reduce((sum: number, f: any) => sum + (f.size || 0), 0));
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1024).toFixed(2) + " KB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: "إجمالي المستخدمين", value: userCount.toString(), icon: Users, color: "text-primary" },
    { label: "إجمالي الملفات", value: fileCount.toString(), icon: Files, color: "text-secondary" },
    { label: "حجم التخزين", value: formatSize(totalSize), icon: HardDrive, color: "text-neon-blue" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-cyber">الإحصائيات</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold font-cyber">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;
