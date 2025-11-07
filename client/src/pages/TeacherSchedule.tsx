import { useState, useEffect } from "react";
import { useRoute, useLocation, useParams } from "wouter";
import { ArrowRight, Save, FileDown, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ScheduleGrid from "@/components/ScheduleGrid";
import SlotSelectorDialog from "@/components/SlotSelectorDialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ScheduleSlotData } from "@/types/schedule";
import type { Teacher, ScheduleSlot } from "@shared/schema";
import SubjectBadge from "@/components/SubjectBadge";
import { exportTeacherScheduleExcel } from "@/lib/excelGenerator";
import { Card } from "@/components/ui/card";

export default function TeacherSchedule() {
  const [, params] = useRoute("/teacher/:id");
  const [, setLocation] = useLocation();
  const teacherId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams(); // Added from edited snippet

  const [slots, setSlots] = useState<ScheduleSlotData[]>([]); // Keep original state for now
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    period: number;
  } | null>(null);

  // New state and initialization from edited snippet
  const [scheduleData, setScheduleData] = useState<Record<string, Record<number, string>>>({});
  const [isInitialized, setIsInitialized] = useState(false);


  const { data: teacher, isLoading: teacherLoading } = useQuery<Teacher>({
    queryKey: [`/api/teachers/${teacherId || id}`], // Use teacherId or id
    enabled: !!teacherId || !!id, // Enable if either is present
  });

  const { data: teacherSlots = [], isLoading: slotsLoading } = useQuery<ScheduleSlot[]>({
    queryKey: [`/api/teachers/${teacherId || id}/schedule-slots`], // Use teacherId or id
    enabled: !!teacherId || !!id, // Enable if either is present
  });

  // Modified useEffect to handle initialization of scheduleData
  useEffect(() => {
    if (teacherSlots && teacherSlots.length > 0 && !isInitialized) {
      const initialSchedule: Record<string, Record<number, string>> = {};
      const formattedSlots: ScheduleSlotData[] = teacherSlots.map(slot => {
        if (!initialSchedule[slot.day]) {
          initialSchedule[slot.day] = {};
        }
        initialSchedule[slot.day][slot.period] = `${slot.grade}/${slot.section}`;
        return {
          day: slot.day,
          period: slot.period,
          grade: slot.grade,
          section: slot.section,
        };
      });
      setScheduleData(initialSchedule);
      setSlots(formattedSlots);
      setIsInitialized(true);
    }
  }, [teacherSlots, isInitialized]);

  const saveScheduleMutation = useMutation({ // Renamed from saveSlotsMutation in edited snippet to keep original name
    mutationFn: async (slotsToSave: ScheduleSlotData[]) => { // Original mutationFn signature
      const response = await apiRequest<ScheduleSlot[]>(
        `/api/teachers/${teacherId || id}/schedule-slots/batch`, // Use teacherId or id
        {
          method: "POST",
          body: JSON.stringify({ slots: slotsToSave }),
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teachers/${teacherId || id}/schedule-slots`] }); // Use teacherId or id
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-slots"] });
      // Invalidate all class schedules since they depend on teacher schedules
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === '/api/class-schedules'
      });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الجدول بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الجدول",
        variant: "destructive",
      });
    },
  });

  // New save mutation logic from edited snippet, adapted to use the new scheduleData
  const saveScheduleMutationNew = useMutation({
    mutationFn: async (scheduleData: Record<string, Record<number, string>>) => {
      const slotsToSave = Object.entries(scheduleData).flatMap(([day, periods]) =>
        Object.entries(periods).map(([period, classInfo]) => {
          const [grade, section] = classInfo.split("/").map(Number);
          return {
            day,
            period: Number(period),
            grade,
            section,
          };
        })
      );

      // Using apiRequest for consistency with the original file
      const response = await apiRequest<ScheduleSlot[]>(
        `/api/teachers/${teacherId || id}/schedule-slots/batch`, // Use teacherId or id
        {
          method: "POST",
          body: JSON.stringify({ slots: slotsToSave }),
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teachers/${teacherId || id}/schedule-slots`] }); // Use teacherId or id
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-slots"] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === '/api/class-schedules'
      });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ جدول المعلم بنجاح",
      });
    },
    onError: (error: any) => {
      if (error?.error === "conflict") {
        toast({
          title: "تعارض في الجدول",
          description: error.message || "يوجد تعارض في الجدول مع معلم آخر",
          variant: "destructive",
        });
      } else {
        const errorMessage = error.conflict
          ? error.conflict.message
          : error.message || "فشل حفظ الجدول";

        toast({
          title: "خطأ في الحفظ",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });


  // Use teacherId for navigation logic as in the original file
  if (!teacherId) {
    setLocation("/teachers");
    return null;
  }

  if (teacherLoading || slotsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">المعلم غير موجود</p>
          <Link href="/teachers">
            <Button>العودة للمعلمين</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSlotClick = (day: string, period: number) => {
    setSelectedSlot({ day, period });
  };

  const handleSaveSlot = (grade: number, section: number) => {
    if (!selectedSlot) return;

    const currentScheduleData = { ...scheduleData };
    if (!currentScheduleData[selectedSlot.day]) {
      currentScheduleData[selectedSlot.day] = {};
    }
    currentScheduleData[selectedSlot.day][selectedSlot.period] = `${grade}/${section}`;
    setScheduleData(currentScheduleData);
    setSelectedSlot(null);
  };

  const handleDeleteSlot = (day: string, period: number) => {
    if (scheduleData[day]?.[period]) {
      const newScheduleData: Record<string, Record<number, string>> = {};

      Object.entries(scheduleData).forEach(([d, periods]) => {
        const newPeriods: Record<number, string> = {};
        Object.entries(periods).forEach(([p, classInfo]) => {
          if (d !== day || Number(p) !== period) {
            newPeriods[Number(p)] = classInfo;
          }
        });

        if (Object.keys(newPeriods).length > 0) {
          newScheduleData[d] = newPeriods;
        }
      });

      setScheduleData(newScheduleData);
      toast({
        title: "تم الحذف",
        description: "تم حذف الحصة بنجاح",
      });
    }
  };

  const handleSave = () => {
    saveScheduleMutationNew.mutate(scheduleData); // Use the new mutation
  };

  const handleExportExcel = async () => {
    if (!teacher) return;
    try {
      const currentSlotsForExport: ScheduleSlotData[] = Object.entries(scheduleData).flatMap(([day, periods]) =>
        Object.entries(periods).map(([period, classInfo]) => {
          const [grade, section] = classInfo.split("/").map(Number);
          return {
            day,
            period: Number(period),
            grade,
            section,
          };
        })
      );
      await exportTeacherScheduleExcel(teacher, currentSlotsForExport);
      toast({
        title: "تم التصدير",
        description: "تم تصدير الجدول بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير Excel",
        variant: "destructive",
      });
    }
  };

  const existingSlot = selectedSlot
    ? scheduleData[selectedSlot.day]?.[selectedSlot.period] // Check in scheduleData
    : undefined;

  // Prepare allSlots for passing to SlotSelectorDialog
  const allSlots: ScheduleSlotData[] = Object.entries(scheduleData).flatMap(([day, periods]) =>
    Object.entries(periods).map(([period, classInfo]) => {
      const [grade, section] = classInfo.split("/").map(Number);
      return {
        day,
        period: Number(period),
        grade,
        section,
      };
    })
  );


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-3">
              <Link href="/teachers">
                <Button variant="ghost" className="gap-2 -mr-3" data-testid="button-back">
                  <ArrowRight className="h-4 w-4" />
                  العودة للمعلمين
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold font-heading">{teacher.name}</h1>
                <div className="mt-2">
                  <SubjectBadge subject={teacher.subject as any} />
                </div>
              </div>
              <p className="text-muted-foreground font-body">
                اختر الحصص وحدد الصف والشعبة لكل حصة
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saveScheduleMutationNew.isPending}
                className="gap-2"
                data-testid="button-save"
              >
                <Save className="h-4 w-4" />
                {saveScheduleMutationNew.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                onClick={handleExportExcel}
                variant="outline"
                className="gap-2"
                data-testid="button-export-excel"
              >
                <FileDown className="h-4 w-4" />
                تصدير Excel
              </Button>
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 border border-card-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-body">
                الحصص المكتملة
              </span>
              {/* This count might need adjustment if it relies on the old 'slots' state */}
              <span className="font-semibold font-data">
                {Object.values(scheduleData).reduce((acc, periods) => acc + Object.keys(periods).length, 0)} / 35
              </span>
            </div>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                // This width calculation might need to be based on scheduleData as well
                style={{ width: `${(Object.values(scheduleData).reduce((acc, periods) => acc + Object.keys(periods).length, 0) / 35) * 100}%` }}
              />
            </div>
          </div>

          {/* Convert scheduleData to slots array for ScheduleGrid */}
          <ScheduleGrid
            slots={Object.entries(scheduleData).flatMap(([day, periods]) =>
              Object.entries(periods).map(([period, classInfo]) => {
                const [grade, section] = classInfo.split("/").map(Number);
                return {
                  day,
                  period: Number(period),
                  grade,
                  section,
                };
              })
            )}
            onSlotClick={handleSlotClick}
            onSlotDelete={handleDeleteSlot}
          />
        </div>
      </div>

      <SlotSelectorDialog
        open={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onSave={handleSaveSlot}
        day={selectedSlot?.day || ""}
        period={selectedSlot?.period || 1}
        initialGrade={existingSlot ? parseInt(existingSlot.split("/")[0]) : undefined}
        initialSection={existingSlot ? parseInt(existingSlot.split("/")[1]) : undefined}
        existingSlots={allSlots}
        currentSlot={selectedSlot || undefined}
      />
    </div>
  );
}