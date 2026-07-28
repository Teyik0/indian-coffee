import { createRoute } from "@teyik0/furin/client";
import { renderServerComponent } from "@teyik0/furin/rsc";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import "@/styles/public.css";

export const route = createRoute({
  mode: "isr",
  revalidate: 300,
  tags: ["content"],
  loader: async () => {
    const content = unwrapApiResult(await getApi().api.content.get());
    return {
      ...content,
      footer: await renderServerComponent(<PublicFooter content={content} />),
    };
  },
  layout: ({ children, footer, openState, phone }) => (
    <>
      <script>{'document.documentElement.lang="fr";'}</script>
      <TooltipProvider>
        <div className="maison-madras isolate min-h-screen">
          <PublicHeader openState={openState} phone={phone} />
          <main id="contenu">{children}</main>
          {footer}
        </div>
        <Toaster position="top-right" />
      </TooltipProvider>
    </>
  ),
});
