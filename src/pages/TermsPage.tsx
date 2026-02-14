import { Cloud, Shield, AlertTriangle, FileX } from "lucide-react";
import { Link } from "react-router-dom";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary" />
            <span className="font-cyber text-lg font-bold">
              Dark<span className="text-primary">Cyber</span>X
            </span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-3xl" dir="rtl">
        <h1 className="text-3xl font-bold font-cyber mb-8 text-center">سياسة الاستخدام</h1>

        <div className="space-y-8">
          <section className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold font-cyber">الشروط العامة</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• الخدمة مجانية للاستخدام الشخصي</li>
              <li>• الحد الأقصى لحجم الملف: 2GB</li>
              <li>• التحميل غير محدود</li>
              <li>• يتم عرض إعلانات في صفحات التحميل</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-3 mb-4">
              <FileX className="w-6 h-6 text-destructive" />
              <h2 className="text-xl font-bold font-cyber text-destructive">الملفات الممنوعة</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• ملفات تنفيذية (.exe, .bat, .cmd)</li>
              <li>• ملفات JavaScript (.js)</li>
              <li>• محتوى غير قانوني أو مخالف</li>
              <li>• برامج خبيثة أو فيروسات</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-bold font-cyber">ملاحظات مهمة</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• نحتفظ بحق حذف الملفات المخالفة بدون إشعار</li>
              <li>• يمكن حظر المستخدمين المخالفين</li>
              <li>• الملفات مخزنة على خوادم Telegram</li>
              <li>• لا نتحمل مسؤولية فقدان الملفات</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
