import {
  Box,
  TextField,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  FieldValues,
  Path,
  Control,
  useController,
  Controller,
} from "react-hook-form";

async function fetchMapLayer(
  url: string,
  t: (key: string) => string,
): Promise<{
  valid: boolean;
  type?: string;
  layers?: { label: string; value: string }[];
  message?: string;
}> {
  const isUrl = /^https?:\/\//.test(url);
  if (!isUrl)
    return {
      valid: false,
      message: t("map-layer-select.must-start-with-http-or-https"),
    };

  if (url.includes("{z}") || url.includes("{x}")) {
    return { valid: false, type: "XYZ/TMS" };
  }

  let probeUrl = url;
  if (!url.includes("GetCapabilities") && !url.includes("?")) {
    probeUrl = `${url}?service=WMS&request=GetCapabilities`;
  } else if (!url.includes("GetCapabilities") && url.includes("?")) {
    probeUrl = `${url}&service=WMS&request=GetCapabilities`;
  }

  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(probeUrl)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      return {
        valid: false,
        message: t(
          "map-layer-select.connection-failed-server-responded-with-response-status",
        ),
      };
    }

    const text = await response.text();

    const isWMS =
      text.includes("WMS_Capabilities") || text.includes("WMT_MS_Capabilities");
    const isWMTS = text.includes("Capabilities") && text.includes("Contents");
    const isXMLError = text.includes("ServiceException");

    const d = new DOMParser();

    const parsed = d.parseFromString(text, "application/xml");

    const possibleLayers = parsed.getElementsByTagName("Layer");

    const layers: { label: string; value: string }[] = [];
    const layerValueSet = new Set<string>();

    for (const layer of possibleLayers) {
      const name =
        layer.getElementsByTagName("Name")[0]?.textContent ??
        layer.getElementsByTagName("ows:Identifier")[0]?.textContent;
      const title =
        layer.getElementsByTagName("Title")[0]?.textContent ??
        layer.getElementsByTagName("Identifier")[0]?.textContent;

      if (!layerValueSet.has(name ?? "-"))
        layers.push({ label: title ?? name ?? "-", value: name ?? "-" });

      layerValueSet.add(name ?? "-");
    }

    if (isXMLError) {
      return {
        valid: false,
        message: t(
          "map-layer-select.the-map-server-reported-an-error-serviceexception",
        ),
      };
    }

    if (!isWMS && !isWMTS) {
      if (text.toLowerCase().includes("<!doctype html>")) {
        return {
          valid: false,
          message: t(
            "map-layer-select.endpoint-returned-a-webpage-not-a-map-service-xml",
          ),
        };
      }
      return {
        valid: false,
        message: t(
          "map-layer-select.valid-link-but-not-a-recognized-wms-wmts-capabilities-document",
        ),
      };
    }

    return { valid: true, layers, type: isWMS ? "WMS" : "WMTS" };
  } catch {
    return {
      valid: false,
      message: t(
        "map-layer-select.network-error-could-not-reach-the-service-via-proxy",
      ),
    };
  }
}

export default function MapLayerSelector<T extends FieldValues>({
  urlName,
  layerName,
  control,
}: {
  urlName: Path<T>;
  layerName: Path<T>;
  control: Control<T>;
}) {
  const queryClient = useQueryClient();

  const { field: urlField } = useController({ control, name: urlName });

  const { data = { valid: false, layers: [], message: "" }, isPending } =
    useQuery({
      queryKey: ["mapLayer", "check", urlField.value],
      queryFn: async ({ queryKey }) => fetchMapLayer(queryKey[2], t),
    });

  const t = useTranslations();

  return (
    <>
      <Controller
        name={urlName}
        control={control}
        rules={{
          required: true,
          validate: async (value) => {
            const { valid, message } = await queryClient.fetchQuery({
              queryKey: ["mapLayer", "check", value],
              queryFn: async ({ queryKey }) => fetchMapLayer(queryKey[2], t),
            });

            if (!valid) return message;

            return true;
          },
        }}
        render={({ field, formState }) => (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              fullWidth
              label={t("map-layer-select.url")}
              error={!!formState.errors[urlName]}
              helperText={formState.errors[urlName]?.message?.toString()}
              value={field.value}
              onChange={field.onChange}
            />
            <Box
              sx={(theme) => ({
                padding: theme.spacing(1),
                width: "6rem",
                display: "flex",
                justifyContent: "center",
              })}
            >
              {isPending ? (
                <CircularProgress size={16} />
              ) : (
                <Typography>{data.type ?? "?"}</Typography>
              )}
            </Box>
          </Box>
        )}
      />
      <Controller
        name={layerName}
        control={control}
        rules={{
          required: true,
          deps: urlName,
          validate: (value) => {
            if (!data.layers || data.layers.length === 0) return true;

            if (data.layers.findIndex((l) => l.value === value) === -1)
              return t("map-layer-select.select-a-layer");

            return true;
          },
        }}
        render={({ field, formState }) => (
          <FormControl fullWidth>
            <InputLabel id="map-layer-select-layer">
              {t("map-layer-select.layer")}
            </InputLabel>
            <Select
              label="Layer"
              error={!!formState.errors[layerName]}
              labelId="map-layer-select-layer"
              disabled={
                !!formState.errors[urlName] ||
                (data.layers ?? []).length === 0 ||
                isPending
              }
              value={field.value}
              onChange={field.onChange}
            >
              {data?.layers?.map((layer) => (
                <MenuItem value={layer.value} key={layer.value}>
                  {layer.label}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error">
              {formState.errors[layerName]?.message?.toString()}
            </Typography>
          </FormControl>
        )}
      />
    </>
  );
}
