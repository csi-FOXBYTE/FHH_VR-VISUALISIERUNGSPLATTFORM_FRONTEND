import "client-only";
import type { GeneratedPermissions } from ".";
import { useSession } from "next-auth/react";
import { ComponentType, memo } from "react";

export const useRBAC = (neededPermissions: GeneratedPermissions[]): boolean => {
  neededPermissions.includes("project:create");
  // TODO: RBAC logic

  return true;
};

type PropsAreEqual<P> = (
  prevProps: Readonly<P>,
  nextProps: Readonly<P>
) => boolean;

export function withRBAC<P extends Record<string, any>>(
  WrappedComponent: ComponentType<P>,
  neededPermissions: GeneratedPermissions[],
  propsAreEqual?: PropsAreEqual<P> | false,
  componentName = WrappedComponent.displayName ?? WrappedComponent.name
): {
  (props: P): React.JSX.Element;
  displayName: string;
} {
  function WithRBACHOC(props: P) {
    const allowed = useRBAC(neededPermissions);

    if (!allowed) throw new Error("Unauthorized");

    return <WrappedComponent {...props} />;
  }

  WithRBACHOC.displayName = `withRBAC(${componentName})`;

  const wrappedComponent =
    propsAreEqual === false ? WithRBACHOC : memo(WithRBACHOC, propsAreEqual);

  return wrappedComponent as typeof WithRBACHOC;
}
