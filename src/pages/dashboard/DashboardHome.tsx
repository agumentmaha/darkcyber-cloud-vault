import { useEffect, useState } from "react";
import { Files, HardDrive, Download, FileIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import AdBanner from "@/components/AdBanner";

const DashboardHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fileCount, setFileCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: files } = await supabase
        .from("files")
        .select("id, filename, size, created_at, unique_slug")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (files) {
        setRecentFiles(files);
        setFileCount(files.length);

        // Get total count and size
        const { data: allFiles } = await supabase
          .from("files")
          .select("size")
          .eq("user_id", user.id);

        if (allFiles) {
          setFileCount(allFiles.length);
          setTotalSize(allFiles.reduce((sum: number, f: any) => sum + (f.size || 0), 0));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const stats = [
    { label: "إجمالي الملفات", value: fileCount.toString(), icon: Files, color: "text-primary" },
    { label: "الحجم المستخدم", value: formatSize(totalSize), icon: HardDrive, color: "text-secondary" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-cyber">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border bg-card hover:border-primary/30 transition-colors">
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

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold font-cyber mb-4">آخر الملفات</h2>
          {recentFiles.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              لا توجد ملفات بعد. أرسل ملفاتك للبوت على Telegram!
            </p>
          ) : (
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <Link
                  key={file.id}
                  to={`/d/${file.unique_slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <FileIcon className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString("ar")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdBanner placement="dashboard" />
    </div>
  );
};

export default DashboardHome;
