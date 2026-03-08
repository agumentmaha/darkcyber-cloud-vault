import { useEffect, useState } from "react";
import { Users, Files, HardDrive, UserPlus, FileUp, Calendar, Shield, Ban, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StatsData {
  userCount: number;
  fileCount: number;
  totalSize: number;
  newUsersToday: number;
  newUsersWeek: number;
  filesToday: number;
  filesWeek: number;
  blockedFiles: number;
  bannedUsers: number;
  avgFileSize: number;
  topUploaders: { username: string; count: number }[];
  recentFiles: { filename: string; size: number; created_at: string }[];
}

const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    userCount: 0, fileCount: 0, totalSize: 0,
    newUsersToday: 0, newUsersWeek: 0,
    filesToday: 0, filesWeek: 0,
    blockedFiles: 0, bannedUsers: 0, avgFileSize: 0,
    topUploaders: [], recentFiles: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        profilesRes,
        filesRes,
        newUsersTodayRes,
        newUsersWeekRes,
        filesTodayRes,
        filesWeekRes,
        blockedRes,
        bannedRes,
        recentFilesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("files").select("size"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("files").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("files").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("files").select("id", { count: "exact", head: true }).eq("is_blocked", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_banned", true),
        supabase.from("files").select("filename, size, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const files = filesRes.data || [];
      const fileCount = files.length;
      const totalSize = files.reduce((sum: number, f: any) => sum + (f.size || 0), 0);

      setStats({
        userCount: profilesRes.count || 0,
        fileCount,
        totalSize,
        newUsersToday: newUsersTodayRes.count || 0,
        newUsersWeek: newUsersWeekRes.count || 0,
        filesToday: filesTodayRes.count || 0,
        filesWeek: filesWeekRes.count || 0,
        blockedFiles: blockedRes.count || 0,
        bannedUsers: bannedRes.count || 0,
        avgFileSize: fileCount > 0 ? totalSize / fileCount : 0,
        topUploaders: [],
        recentFiles: recentFilesRes.data || [],
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const mainCards = [
    { label: "إجمالي المستخدمين", value: stats.userCount.toString(), icon: Users, color: "text-primary" },
    { label: "إجمالي الملفات", value: stats.fileCount.toString(), icon: Files, color: "text-secondary" },
    { label: "حجم التخزين", value: formatSize(stats.totalSize), icon: HardDrive, color: "text-neon-blue" },
    { label: "متوسط حجم الملف", value: formatSize(stats.avgFileSize), icon: HardDrive, color: "text-muted-foreground" },
  ];

  const activityCards = [
    { label: "مستخدمين جدد اليوم", value: stats.newUsersToday.toString(), icon: UserPlus, color: "text-green-400" },
    { label: "مستخدمين جدد هذا الأسبوع", value: stats.newUsersWeek.toString(), icon: Calendar, color: "text-green-300" },
    { label: "ملفات مرفوعة اليوم", value: stats.filesToday.toString(), icon: FileUp, color: "text-blue-400" },
    { label: "ملفات مرفوعة هذا الأسبوع", value: stats.filesWeek.toString(), icon: Calendar, color: "text-blue-300" },
  ];

  const moderationCards = [
    { label: "ملفات محظورة", value: stats.blockedFiles.toString(), icon: Shield, color: "text-destructive" },
    { label: "مستخدمين محظورين", value: stats.bannedUsers.toString(), icon: Ban, color: "text-destructive" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold font-cyber">الإحصائيات</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold font-cyber">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Stats */}
      <div>
        <h2 className="text-lg font-bold font-cyber mb-3">النشاط</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activityCards.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold font-cyber">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Moderation Stats */}
      <div>
        <h2 className="text-lg font-bold font-cyber mb-3">الإشراف</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {moderationCards.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold font-cyber">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      {stats.recentFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-bold font-cyber mb-3">آخر الملفات المرفوعة</h2>
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              {stats.recentFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Files className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm truncate max-w-[200px]">{f.filename}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatSize(f.size)}</span>
                    <span>{timeAgo(f.created_at)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminStats;
