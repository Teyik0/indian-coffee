import { Link } from "@teyik0/furin/link";
import type { ComponentProps } from "react";
import type { AdminPath } from "@/components/admin/routes";

type LinkProps = ComponentProps<typeof Link>;
type AdminLinkProps = Omit<LinkProps, "to"> & { to: AdminPath };

export function AdminLink({ to, ...props }: AdminLinkProps) {
  return <Link {...props} to={to as LinkProps["to"]} />;
}
