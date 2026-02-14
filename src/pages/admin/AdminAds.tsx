import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AdminAds = () => {
  const [open, setOpen] = useState(false);
  const ads: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-cyber">إدارة الإعلانات</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="glow-purple">
              <Plus className="w-4 h-4 ml-2" />
              إضافة إعلان
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-cyber">إضافة إعلان جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>نوع الإعلان</Label>
                <Select defaultValue="banner">
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="adsense">Google AdSense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الموقع</Label>
                <Select defaultValue="download_page">
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="download_page">صفحة التحميل</SelectItem>
                    <SelectItem value="dashboard">لوحة المستخدم</SelectItem>
                    <SelectItem value="both">كلاهما</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>كود الإعلان</Label>
                <Textarea placeholder="ألصق كود الإعلان هنا..." className="bg-background border-border min-h-[120px]" />
              </div>
              <Button className="w-full glow-purple">حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {ads.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">لا توجد إعلانات بعد</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الموقع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad: any) => (
                  <TableRow key={ad.id}>
                    <TableCell>{ad.ad_type}</TableCell>
                    <TableCell>{ad.placement}</TableCell>
                    <TableCell>
                      <Badge variant={ad.status === "active" ? "default" : "secondary"}>
                        {ad.status === "active" ? "نشط" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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

export default AdminAds;
