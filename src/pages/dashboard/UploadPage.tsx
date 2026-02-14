import { Send, ArrowRight, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UploadPage = () => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold font-cyber">رفع ملف</h1>

      <Card className="border-primary/30 bg-card">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 glow-purple">
            <Send className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-xl font-bold font-cyber mb-4">أرسل ملفك إلى البوت</h2>
          <p className="text-muted-foreground mb-8">
            لرفع ملف، أرسله مباشرة إلى بوت DarkCyberX على Telegram.
            الملف سيظهر تلقائياً في صفحة ملفاتي.
          </p>

          <div className="space-y-4 text-right mb-8">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-cyber text-sm">1</span>
              <span className="text-sm">افتح بوت @DarkCyberXBot على Telegram</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-cyber text-sm">2</span>
              <span className="text-sm">أرسل أي ملف (حتى 2GB)</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-cyber text-sm">3</span>
              <span className="text-sm">ستحصل على رابط تحميل مباشر</span>
            </div>
          </div>

          <Button size="lg" className="glow-purple font-cyber" asChild>
            <a href="https://t.me/T7meelExpressBot" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 ml-2" />
              فتح البوت على Telegram
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h3 className="font-bold font-cyber mb-3">الملفات المسموحة</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✅ صور، فيديوهات، وثائق، ملفات مضغوطة</li>
            <li>✅ الحد الأقصى: 2GB لكل ملف</li>
            <li>❌ ممنوع: .exe, .bat, .cmd, .js</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
