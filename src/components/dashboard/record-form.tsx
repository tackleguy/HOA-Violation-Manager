import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  helperText?: string;
};

type RecordFormProps = {
  title: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  fields: RecordField[];
  multipart?: boolean;
  description?: string;
};

export function RecordForm({ title, submitLabel, action, fields, multipart, description }: RecordFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4" encType={multipart ? "multipart/form-data" : undefined}>
          {fields.map((field) => {
            if (field.type === "hidden") {
              return <input key={field.name} type="hidden" name={field.name} value={field.defaultValue ?? ""} />;
            }

            if (field.type === "select") {
              return (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <EntitySelect
                    id={field.name}
                    name={field.name}
                    options={field.selectOptions ?? []}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    required={field.required}
                  />
                  {field.helperText ? <p className="text-xs text-muted-foreground">{field.helperText}</p> : null}
                </div>
              );
            }

            return (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    required={field.required}
                    className="min-h-[88px]"
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
                {field.helperText ? <p className="text-xs text-muted-foreground">{field.helperText}</p> : null}
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
