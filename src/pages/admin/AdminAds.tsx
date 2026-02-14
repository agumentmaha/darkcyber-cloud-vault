import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Loader2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminAds = () => {
  const [open, setOpen] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adType, setAdType] = useState("banner");
  const [placement, setPlacement] = useState("download_page");
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const fetchAds = async () => {
    setLoading(true);
    const { data } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
    setAds(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const createAd = async () => {
    if (!code.trim()) {
      toast({ title: "أدخل كود الإعلان", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("ads").insert({ ad_type: adType, placement, code });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم إضافة الإعلان" });
      setOpen(false);
      setCode("");
      fetchAds();
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    const { error } = await supabase.from("ads").update({ status: newStatus }).eq("id", id);
    if (!error) { fetchAds(); }
  };

  const deleteAd = async (id: string) => {
    const { error } = await supabase.from("ads").delete().eq("id", id);
    if (!error) { toast({ title: "تم حذف الإعلان" }); fetchAds(); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
                <Select value={adType} onValueChange={setAdType}>
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
                <Select value={placement} onValueChange={setPlacement}>
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
                <Textarea
                  placeholder="ألصق كود الإعلان هنا..."
                  className="bg-background border-border min-h-[120px]"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <Button className="w-full glow-purple" onClick={createAd}>حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {ads.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">لا توجد إعلانات بعد</p>
          ) : (
            <div className="overflow-x-auto">
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
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>{ad.ad_type === "adsense" ? "AdSense" : "Banner"}</TableCell>
                      <TableCell>
                        {ad.placement === "download_page" ? "صفحة التحميل" : ad.placement === "dashboard" ? "لوحة المستخدم" : "الكل"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ad.status === "active" ? "default" : "secondary"}>
                          {ad.status === "active" ? "نشط" : "معطل"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleStatus(ad.id, ad.status)}>
                            {ad.status === "active" ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4 text-green-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteAd(ad.id)}>
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

export default AdminAds;
