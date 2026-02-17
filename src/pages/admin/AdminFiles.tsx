import { useEffect, useState } from "react";
import { Search, Trash2, Ban, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminFiles = () => {
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("files")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching files:", error);
      toast({ title: "خطأ في جلب الملفات", description: error.message, variant: "destructive" });
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  const toggleBlock = async (id: string, current: boolean) => {
    const { error } = await supabase.from("files").update({ is_blocked: !current }).eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: current ? "تم إلغاء الحظر" : "تم حظر الملف" });
      fetchFiles();
    }
  };

  const deleteFile = async (id: string) => {
    const { error } = await supabase.from("files").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
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
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-cyber">إدارة الملفات</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 bg-card border-border" />
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">لا توجد ملفات</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الملف</TableHead>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الحجم</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="max-w-[200px] truncate">{file.filename}</TableCell>
                      <TableCell>{(file as any).profiles?.username || "—"}</TableCell>
                      <TableCell>{formatSize(file.size)}</TableCell>
                      <TableCell>{new Date(file.created_at).toLocaleDateString("ar")}</TableCell>
                      <TableCell>
                        <Badge variant={file.is_blocked ? "destructive" : "default"}>
                          {file.is_blocked ? "محظور" : "نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleBlock(file.id, file.is_blocked)}>
                            {file.is_blocked ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteFile(file.id)}>
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

export default AdminFiles;
