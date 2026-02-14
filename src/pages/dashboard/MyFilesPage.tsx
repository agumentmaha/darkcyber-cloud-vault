import { useState } from "react";
import { Search, Copy, Trash2, FileIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const MyFilesPage = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/d/${slug}`);
    toast({ title: "تم نسخ الرابط!", description: "رابط التحميل تم نسخه بنجاح" });
  };

  // TODO: Replace with real data from Supabase
  const files: any[] = [];

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
          {files.length === 0 ? (
            <div className="text-center py-16">
              <FileIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد ملفات بعد</p>
              <p className="text-sm text-muted-foreground mt-1">أرسل ملفاتك للبوت على Telegram</p>
            </div>
          ) : (
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
                {files.map((file: any) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.filename}</TableCell>
                    <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleDateString("ar")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => copyLink(file.unique_slug)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/d/${file.unique_slug}`} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyFilesPage;
