import { createCompositeComponent } from "@teyik0/furin/rsc";
import type { ComponentType } from "react";

export function createAdminPageShell(eyebrow: string, title: string) {
  return createCompositeComponent<{ Content: ComponentType }>(({ Content }) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground">{eyebrow}</p>
        <h1 className="font-display text-4xl">{title}</h1>
      </div>
      <Content />
    </div>
  ));
}
