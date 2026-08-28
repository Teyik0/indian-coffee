import { createRoute } from "@teyik0/furin/client";
import { renderServerComponent } from "@teyik0/furin/rsc";
import * as Effect from "effect4/Effect";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { PortalScope } from "@/components/ui/portal-scope";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { appUrl } from "@/lib/head";
import { jsonLdScript, restaurantJsonLd } from "@/lib/structured-data";
import "@/styles/public.css";

export const route = createRoute({
  mode: "isr",
  revalidate: 300,
  tags: ["content"],
  loader: () =>
    runLoaderEffect(
      Effect.gen(function* () {
        const content = yield* apiEffect((signal) =>
          getApi().api.content.get({ fetch: { signal } })
        );
        const footer = yield* Effect.tryPromise(() =>
          renderServerComponent(<PublicFooter content={content} />)
        );
        return {
          ...content,
          footer,
          jsonLd: jsonLdScript(restaurantJsonLd(content, appUrl)),
        };
      })
    ),
  layout: ({ children, footer, openState, phone }) => (
    <>
      <script>{'document.documentElement.lang="fr";'}</script>
      <TooltipProvider>
        <PortalScope className="maison-madras isolate min-h-screen">
          <PublicHeader openState={openState} phone={phone} />
          <main id="contenu">{children}</main>
          {footer}
          <Toaster position="top-right" />
        </PortalScope>
      </TooltipProvider>
    </>
  ),
});
