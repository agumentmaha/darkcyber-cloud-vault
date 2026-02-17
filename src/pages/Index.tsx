import { Cloud, Download, Shield, Zap, Send, Link, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import AdBanner from "@/components/AdBanner";

const features = [
  { icon: Cloud, title: "تخزين 2GB مجاناً", desc: "ارفع ملفات حتى 2 جيجا بدون أي رسوم" },
  { icon: Zap, title: "تحميل فائق السرعة", desc: "تحميل مباشر من Telegram CDN" },
  { icon: Shield, title: "آمن ومشفر", desc: "ملفاتك محمية بتشفير Telegram" },
  { icon: Link, title: "روابط مباشرة", desc: "شارك ملفاتك برابط واحد" },
];

const steps = [
  { num: "01", title: "أرسل ملفك للبوت", desc: "أرسل أي ملف إلى بوت DarkCyberX على Telegram", icon: Send },
  { num: "02", title: "نحفظه تلقائياً", desc: "البوت يحفظ الملف ويولّد رابط تحميل فريد", icon: Cloud },
  { num: "03", title: "شاركه مع الجميع", desc: "انسخ الرابط وشاركه — التحميل مجاني", icon: Download },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <RouterLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-purple">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <span className="font-cyber text-lg font-bold text-foreground">
              Dark<span className="text-primary">Cyber</span>X
            </span>
          </RouterLink>
          <div className="flex items-center gap-3">
            <RouterLink to="/terms">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                سياسة الاستخدام
              </Button>
            </RouterLink>
            <RouterLink to="/login">
              <Button size="sm" className="glow-purple">
                تسجيل الدخول
              </Button>
            </RouterLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">تخزين سحابي مجاني عبر Telegram</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">خزّن ملفاتك في</span>
              <br />
              <span className="text-primary text-glow-purple">سحابة Telegram</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              ارفع ملفاتك حتى 2GB مجاناً عبر بوت Telegram واحصل على رابط تحميل مباشر.
              بدون سيرفرات. بدون تكلفة. سريع وآمن.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RouterLink to="/login">
                <Button size="lg" className="text-lg px-8 py-6 glow-purple font-cyber">
                  ابدأ الآن مجاناً
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </RouterLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            لماذا <span className="text-primary">DarkCyberX</span>؟
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            منصة تخزين سحابي مبنية على بنية Telegram التحتية
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-purple transition-all">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-cyber text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            كيف <span className="text-secondary">تعمل</span>؟
          </h2>
          <p className="text-muted-foreground text-center mb-12">ثلاث خطوات فقط</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 glow-blue">
                  <s.icon className="w-8 h-8 text-secondary" />
                </div>
                <span className="font-cyber text-4xl font-bold text-secondary/20">{s.num}</span>
                <h3 className="font-cyber text-lg font-semibold mt-2 mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto p-10 rounded-2xl cyber-gradient cyber-border">
            <h2 className="text-3xl font-bold mb-4">جاهز للبدء؟</h2>
            <p className="text-muted-foreground mb-8">ابدأ بتخزين ملفاتك مجاناً الآن</p>
            <RouterLink to="/login">
              <Button size="lg" className="text-lg px-8 py-6 glow-purple font-cyber">
                سجّل الآن عبر Telegram
                <Send className="w-5 h-5 mr-2" />
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      {/* Ads */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-3xl space-y-4">
          <AdBanner placement="dashboard" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            <span className="font-cyber text-sm">DarkCyberX Cloud</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 DarkCyberX — Mohamed Eissa</p>
          <RouterLink to="/terms" className="text-muted-foreground text-sm hover:text-foreground">
            سياسة الاستخدام
          </RouterLink>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
