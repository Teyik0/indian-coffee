import {
  type ComponentProps,
  createContext,
  type RefObject,
  useContext,
  useRef,
} from "react";

type PortalContainerRef = RefObject<HTMLDivElement | null>;

const PortalContainerContext = createContext<PortalContainerRef | undefined>(
  undefined
);

/**
 * Keeps portalled UI inside the visual theme that owns it.
 *
 * Base UI otherwise appends dialogs to `body`, where scoped CSS variables
 * (such as the back-office palette) are no longer available.
 */
function PortalScope({
  children,
  ...props
}: Omit<ComponentProps<"div">, "ref">) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <PortalContainerContext.Provider value={containerRef}>
      <div ref={containerRef} {...props}>
        {children}
      </div>
    </PortalContainerContext.Provider>
  );
}

function usePortalContainer() {
  return useContext(PortalContainerContext);
}

export { PortalScope, usePortalContainer };
