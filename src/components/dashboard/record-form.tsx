import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelect, type EntitySelectOption } from "@/components/dashboard/entity-select";

export type RecordField = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: "text" | "email" | "tel" | "date" | "datetime-local" | "textarea" | "file" | "select" | "hidden";
  required?: boolean;
  selectOptions?: EntitySelectOption[];
};

type RecordFormProps = {
  title: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  fields: RecordField[];
  multipart?: boolean;
};

export function RecordForm({ title, submitLabel, action, fields, multipart }: RecordFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4" encType={multipart ? "multipart/form-data" : undefined}>
          {fields.map((field) => {
            if (field.type === "hidden") {
              return <input key={field.name} type="hidden" name={field.name} value={field.defaultValue ?? ""} />;
            }

            if (field.type === "select") {
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <EntitySelect
                    id={field.name}
                    name={field.name}
                    options={field.selectOptions ?? []}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    required={field.required}
                  />
                </div>
              );
            }

            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    required={field.required}
                  />
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
            );
          })}
          <Button type="submit" className="w-full">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
