import { TopBar } from "@/components/layout/TopBar";

export function ComingSoonPage({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={title} subtitle={subtitle} />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-dashed border-border bg-surface/60 p-8 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
            ⚙
          </span>
          <p className="text-sm font-semibold text-foreground">Coming in the next build phase</p>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
