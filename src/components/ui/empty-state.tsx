type EmptyStateProps = {
  title: string;
  description: string;
  action?: string;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <p className="mt-4 text-xs text-muted-foreground">{action}</p> : null}
    </div>
  );
}
