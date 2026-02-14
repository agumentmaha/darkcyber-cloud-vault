import { Files, HardDrive, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "إجمالي الملفات", value: "0", icon: Files, color: "text-primary" },
  { label: "الحجم المستخدم", value: "0 MB", icon: HardDrive, color: "text-secondary" },
  { label: "إجمالي التحميلات", value: "0", icon: Download, color: "text-neon-blue" },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-cyber">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <p className="text-muted-foreground text-sm text-center py-8">
            لا توجد ملفات بعد. أرسل ملفاتك للبوت على Telegram!
          </p>
        </CardContent>
      </Card>

      {/* Ad space */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">مساحة إعلانية</p>
      </div>
    </div>
  );
};

export default DashboardHome;
