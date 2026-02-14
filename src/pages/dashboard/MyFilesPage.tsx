import { useEffect, useState } from "react";
import { Search, Copy, Trash2, FileIcon, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MyFilesPage = () => {
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchFiles = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/d/${slug}`);
    toast({ title: "تم نسخ الرابط!", description: "رابط التحميل تم نسخه بنجاح" });
  };

  const deleteFile = async (id: string) => {
    const { error } = await supabase.from("files").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: "فشل حذف الملف", variant: "destructive" });
    } else {
      toast({ title: "تم حذف الملف" });
      fetchFiles();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    return (bytes / 1048576).toFixed(2) + " MB";
  };

  const filtered = files.filter((f) =>
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-cyber">ملفاتي</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الملفات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 bg-card border-border"
          />
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? "لا توجد نتائج" : "لا توجد ملفات بعد"}
              </p>
              {!search && (
                <p className="text-sm text-muted-foreground mt-1">أرسل ملفاتك للبوت على Telegram</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الملف</TableHead>
                    <TableHead className="text-right">الحجم</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{file.filename}</TableCell>
                      <TableCell>{formatSize(file.size)}</TableCell>
                      <TableCell>{new Date(file.created_at).toLocaleDateString("ar")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => copyLink(file.unique_slug)} title="نسخ الرابط">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/d/${file.unique_slug}`} target="_blank" title="فتح صفحة التحميل">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteFile(file.id)}
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyFilesPage;
