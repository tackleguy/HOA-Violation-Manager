import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type RecordField = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: "text" | "email" | "tel" | "date" | "datetime-local" | "textarea" | "file";
  required?: boolean;
};

type RecordFormProps = {
  title: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  fields: RecordField[];
};

export function RecordForm({ title, submitLabel, action, fields }: RecordFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea id={field.name} name={field.name} placeholder={field.placeholder} required={field.required} />
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
