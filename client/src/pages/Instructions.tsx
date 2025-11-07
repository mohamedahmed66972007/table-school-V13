
import { Card } from "@/components/ui/card";
import { Plus, Users, Calendar, FileDown, CheckCircle, AlertCircle } from "lucide-react";

export default function Instructions() {
  const steps = [
    {
      icon: Plus,
      title: "إنشاء جدول جديد",
      description:
        'انقر على زر "إنشاء جدول جديد" في الصفحة الرئيسية لبدء العملية.',
      details: [
        "ستظهر نافذة لإدخال معلومات المعلم",
        "أدخل اسم المعلم بشكل كامل",
        "اختر المادة التي يدرسها من القائمة المنسدلة",
      ],
    },
    {
      icon: Calendar,
      title: "بناء الجدول الشخصي",
      description: "املأ الحصص في الجدول بتحديد الصف والشعبة لكل حصة.",
      details: [
        "الجدول يحتوي على 7 حصص يومياً",
        "أيام الدراسة: الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس",
        "انقر على أي خانة فارغة لملئها",
        "حدد الصف (10-12) والشعبة (1-8) لكل حصة",
      ],
    },
    {
      icon: Users,
      title: "إدارة المعلمين",
      description: "عرض وتعديل وحذف جداول المعلمين.",
      details: [
        "يمكنك رؤية جميع المعلمين في صفحة المعلمين",
        "تابع تقدم كل معلم في ملء جدوله",
        "يمكن تعديل أو حذف أي معلم",
      ],
    },
    {
      icon: FileDown,
      title: "التصدير والطباعة",
      description: "صدّر الجداول بصيغة PDF للطباعة أو المشاركة.",
      details: [
        "يمكن تصدير جدول معلم واحد",
        "يمكن تصدير جداول جميع المعلمين دفعة واحدة",
        "يمكن تصدير جداول الصفوف مع أو بدون أسماء المعلمين",
        "يمكن تصدير جداول جميع الصفوف (10/1 إلى 12/8) في ملف واحد",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold font-heading">التعليمات</h1>
            <p className="text-lg text-muted-foreground font-body">
              دليل شامل لاستخدام نظام جدولة الحصص المدرسية
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-heading">خطوات الاستخدام</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card
                    key={index}
                    className="p-6 space-y-4 hover-elevate transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary font-data">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-semibold font-heading">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground font-body">
                          {step.description}
                        </p>
                        <ul className="space-y-1 pt-2">
                          {step.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-muted-foreground font-accent flex items-start gap-2"
                            >
                              <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold font-heading text-lg">ملاحظة هامة</h3>
                <p className="text-sm text-muted-foreground font-body">
                  تأكد من أن جميع المعلمين قد أكملوا جداولهم الشخصية قبل تصدير جداول
                  الصفوف للحصول على نتائج دقيقة وكاملة. يمكنك متابعة تقدم كل معلم من
                  صفحة المعلمين.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
