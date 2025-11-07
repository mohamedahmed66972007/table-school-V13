import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SUBJECTS } from "@shared/schema";
import type { Subject } from "@shared/schema";

interface TeacherFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, subject: Subject) => void;
}

export default function TeacherFormDialog({
  open,
  onClose,
  onSave,
}: TeacherFormDialogProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState<Subject | "">("");

  const handleSave = () => {
    if (name && subject) {
      onSave(name, subject);
      setName("");
      setSubject("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            إضافة معلم جديد
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-body">
            أدخل اسم المعلم واختر المادة التي يدرسها
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-accent">
              اسم المعلم
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد محمود"
              className="font-body"
              data-testid="input-teacher-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="font-accent">
              المادة
            </Label>
            <Select value={subject} onValueChange={(val) => setSubject(val as Subject)}>
              <SelectTrigger id="subject" data-testid="select-subject">
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || !subject}
            data-testid="button-save-teacher"
          >
            حفظ والمتابعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
