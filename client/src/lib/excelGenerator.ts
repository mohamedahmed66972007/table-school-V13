import ExcelJS from "exceljs";
import type { Teacher, ScheduleSlot } from "@shared/schema";
import type { ScheduleSlotData } from "@/types/schedule";
import type { ClassScheduleSlot } from "@/components/ClassScheduleTable";
import { DAYS, PERIODS } from "@shared/schema";

export async function exportMasterScheduleExcel(
  teachers: Teacher[],
  allSlots: ScheduleSlot[],
  teacherNotes: Record<string, string>
) {
  try {
    const response = await fetch('/جدول_رئيسي_template.xlsx');
    if (!response.ok) {
      throw new Error('Failed to load template');
    }
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Template worksheet not found');
    }

    teachers.forEach((teacher, index) => {
      const rowNum = index + 5;
      
      let colOffset = 3;
      [...DAYS].reverse().forEach((day) => {
        [...PERIODS].reverse().forEach((period) => {
          const slot = allSlots.find(
            (s) => s.teacherId === teacher.id && s.day === day && s.period === period
          );
          
          if (slot) {
            const cell = worksheet.getRow(rowNum).getCell(colOffset);
            cell.value = `${slot.grade}/${slot.section}`;
          }
          colOffset++;
        });
      });
      
      if (teacherNotes[teacher.id]) {
        const notesCell = worksheet.getRow(rowNum).getCell(1);
        notesCell.value = teacherNotes[teacher.id];
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'الجدول_الرئيسي.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting master schedule:', error);
    throw error;
  }
}

export async function exportTeacherScheduleExcel(
  teacher: Teacher,
  slots: ScheduleSlotData[]
) {
  try {
    const response = await fetch('/جداول_template.xlsx');
    if (!response.ok) {
      throw new Error('Failed to load template');
    }
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Template worksheet not found');
    }

    const titleCell = worksheet.getRow(1).getCell(4);
    titleCell.value = `جدول المعلم: ${teacher.name}`;

    DAYS.forEach((day, dayIdx) => {
      const rowNum = dayIdx + 4;
      [...PERIODS].forEach((period, periodIdx) => {
        const colIdx = periodIdx + 3;
        
        const slot = slots.find((s) => s.day === day && s.period === period);
        
        if (slot) {
          const cell = worksheet.getRow(rowNum).getCell(colIdx);
          cell.value = `${slot.grade}/${slot.section}`;
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `جدول_${teacher.name}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting teacher schedule:', error);
    throw error;
  }
}

export async function exportAllTeachersExcel(
  teachers: Teacher[],
  allSlots: ScheduleSlot[]
) {
  for (const teacher of teachers) {
    const teacherSlots: ScheduleSlotData[] = allSlots
      .filter((slot) => slot.teacherId === teacher.id)
      .map((slot) => ({
        day: slot.day,
        period: slot.period,
        grade: slot.grade,
        section: slot.section,
      }));
    
    await exportTeacherScheduleExcel(teacher, teacherSlots);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export async function exportClassScheduleExcel(
  grade: number,
  section: number,
  slots: ClassScheduleSlot[]
) {
  try {
    const response = await fetch('/جداول_template.xlsx');
    if (!response.ok) {
      throw new Error('Failed to load template');
    }
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Template worksheet not found');
    }

    const titleCell = worksheet.getRow(1).getCell(4);
    titleCell.value = `جدول الصف: ${grade}/${section}`;

    DAYS.forEach((day, dayIdx) => {
      const rowNum = dayIdx + 4;
      [...PERIODS].forEach((period, periodIdx) => {
        const colIdx = periodIdx + 3;
        
        const slot = slots.find((s) => s.day === day && s.period === period);
        
        if (slot) {
          const cell = worksheet.getRow(rowNum).getCell(colIdx);
          cell.value = slot.subject;
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `جدول_الصف_${grade}_${section}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting class schedule:', error);
    throw error;
  }
}

export async function exportAllClassesExcel(
  allSlots: ScheduleSlot[],
  allTeachers: Teacher[],
  gradeSections?: Record<string, number[]>
) {
  const teacherMap = new Map(allTeachers.map((t) => [t.id, t]));

  for (let grade = 10; grade <= 12; grade++) {
    const sections = gradeSections?.[grade.toString()] || [1, 2, 3, 4, 5, 6, 7];
    for (const section of sections) {
      const classSlots = allSlots.filter(
        (slot) => slot.grade === grade && slot.section === section
      );

      const schedule: ClassScheduleSlot[] = classSlots.map((slot) => {
        const teacher = teacherMap.get(slot.teacherId);
        return {
          day: slot.day,
          period: slot.period,
          subject: (teacher?.subject || "عربي") as any,
          teacherName: teacher?.name || "Unknown",
        };
      });

      await exportClassScheduleExcel(grade, section, schedule);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
