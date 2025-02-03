import "next/navigation";
import "next/router";

declare module "next/navigation" {
  /**
   * @deprecated !!!Please use the router in "@/server/i18n/routing"!!!
   */
  export function useRouter(): never;
}

declare module "next/router" {
  /**
   * @deprecated !!!Please use the router in "@/server/i18n/routing"!!!
   */
  export function useRouter(): never;
}
