import {
  EventsApi,
  StatsApi,
  Converter3DApi,
  Configuration,
} from "./generated";

const config = new Configuration({
  basePath: `${process.env.NEXT_PUBLIC_BASE_URL!}/api/gateway`,
});

const eventsApi = new EventsApi(config);
const statsApi = new StatsApi(config);
const converter3DApi = new Converter3DApi(config);

const GatewayAPI = { eventsApi, statsApi, converter3DApi };

export default GatewayAPI;
