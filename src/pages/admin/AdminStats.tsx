import { Users, Files, HardDrive, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "إجمالي المستخدمين", value: "0", icon: Users, color: "text-primary" },
  { label: "إجمالي الملفات", value: "0", icon: Files, color: "text-secondary" },
  { label: "حجم التخزين", value: "0 MB", icon: HardDrive, color: "text-neon-blue" },
  { label: "التحميلات اليوم", value: "0", icon: TrendingUp, color: "text-primary" },
];

const AdminStats = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-cyber">الإحصائيات</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold font-cyber mb-4">رسم بياني - الاستخدام اليومي</h2>
          <p className="text-muted-foreground text-sm text-center py-12">
            سيتم عرض الرسوم البيانية هنا عند توفر البيانات
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
