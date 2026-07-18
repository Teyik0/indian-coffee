import { createRoute } from "@teyik0/furin/client";
import { contentService } from "@/api/modules/content/service";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/public.css";

export const route = createRoute({
  loader: () => contentService.get(),
  layout: ({ children, ...content }) => (
    <TooltipProvider>
      <div className="isolate min-h-screen">
        <PublicHeader />
        <main>{children}</main>
        <PublicFooter content={content} />
      </div>
      <Toaster position="top-right" />
    </TooltipProvider>
  ),
});
