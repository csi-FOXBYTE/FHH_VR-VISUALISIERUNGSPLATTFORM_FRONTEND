import {
  BaseLayerApi,
  Configuration,
  Converter3DApi,
  EventsApi,
  ProjectApi,
  StatsApi,
  UserApi,
} from "./generated";

async function injectCookies() {
  const { cookies } = await import("next/headers");

  const cookieStore = await cookies();

  return cookieStore.toString();
}

export async function getApis() {
  const config = new Configuration({
    basePath: process.env.BASE_URL
      ? `${process.env.BASE_URL}/api/gateway`
      : `/api/gateway`,
    headers:
      typeof window === "undefined"
        ? { cookie: await injectCookies() }
        : undefined,
  });

  const eventsApi = new EventsApi(config);
  const statsApi = new StatsApi(config);
  const converter3DApi = new Converter3DApi(config);
  const projectApi = new ProjectApi(config);
  const userApi = new UserApi(config);
  const baseLayerApi = new BaseLayerApi(config);

  return {
    eventsApi,
    statsApi,
    converter3DApi,
    projectApi,
    userApi,
    baseLayerApi,
  };
}
