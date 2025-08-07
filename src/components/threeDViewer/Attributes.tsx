import { Add, Delete, Save } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  IconButton,
  Table,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

export type AttributesProps = {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
};

export default function Attributes({
  onChange,
  value,
  disabled,
}: AttributesProps) {
  const t = useTranslations();

  const [attributes, setAttributes] = useState<
    { key: string; defaultValue: string; id: string }[]
  >([]);

  useEffect(() => {
    setAttributes(
      Object.entries(value).map(([key, value]) => ({
        key,
        defaultValue: value,
        id: `${key}_${value}`,
      }))
    );
  }, [value]);

  const [attributesForm, setAttributesForm] = useState<
    (() => { key: string; value: string })[]
  >([]);

  const register = useCallback(
    (index: number, get: () => { key: string; value: string }) => {
      setAttributesForm((attributesForm) => {
        const newAttributesForm = [...attributesForm];

        newAttributesForm[index] = get;

        return newAttributesForm;
      });
    },
    []
  );

  const unregister = useCallback((index: number) => {
    setAttributesForm((attributesForm) => {
      return attributesForm.filter((_, i) => i !== index);
    });
  }, []);

  const save = useCallback(() => {
    const result: Record<string, string> = {};

    for (const get of Object.values(attributesForm)) {
      const { key, value } = get();
      if (key === "" || value === "") continue;
      result[key] = value;
    }

    onChange(result);
  }, [attributesForm, onChange]);

  return (
    <>
      <Typography variant="body1">{t("attributes.title")}</Typography>
      <Table>
        <tbody>
          {attributes.map(({ defaultValue, id, key }, index) => (
            <AttributeField
              index={index}
              defaultKey={key}
              key={id}
              disabled={disabled}
              defaultValue={defaultValue}
              onDelete={(index) => {
                setAttributes((attributes) => {
                  return attributes.filter((_, i) => i !== index);
                });
              }}
              register={register}
              unregister={unregister}
            />
          ))}
          {attributes.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <TextField
                  fullWidth
                  value={t("attributes.no-attributes-present")}
                  disabled
                />
              </td>
            </tr>
          ) : null}
          {disabled ? null : (
            <tr>
              <td colSpan={3}>
                <ButtonGroup
                  sx={{ marginTop: 1 }}
                  fullWidth
                  variant="contained"
                >
                  <Button
                    startIcon={<Add />}
                    onClick={() => {
                      setAttributes((attributes) => {
                        const newAttributes = [...attributes];

                        newAttributes.push({
                          key: "",
                          defaultValue: "",
                          id: crypto.randomUUID(),
                        });

                        return newAttributes;
                      });
                    }}
                  >
                    {t("actions.add")}
                  </Button>
                  <Button onClick={save} color="secondary" startIcon={<Save />}>
                    {t("actions.save")}
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}

type AttributeFieldProps = {
  register: (index: number, get: () => { key: string; value: string }) => void;
  unregister: (index: number) => void;
  onDelete: (index: number) => void;
  defaultValue: string;
  defaultKey: string;
  index: number;
  disabled?: boolean;
};

function AttributeField({
  register,
  unregister,
  defaultKey,
  defaultValue,
  onDelete,
  index,
  disabled,
}: AttributeFieldProps) {
  const t = useTranslations();

  const valueInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    register(index, () => ({
      value: valueInputRef.current?.value ?? "",
      key: keyInputRef.current?.value ?? "",
    }));

    return () => unregister(index);
  }, [index, register, unregister]);

  return (
    <tr>
      <td>
        <TextField
          sx={{ marginTop: 2 }}
          defaultValue={defaultKey}
          label={t("attributes.key")}
          disabled={disabled}
          inputRef={keyInputRef}
        />
      </td>
      <td>
        <TextField
          sx={{ marginTop: 2 }}
          defaultValue={defaultValue}
          label={t("attributes.value")}
          disabled={disabled}
          inputRef={valueInputRef}
        />
      </td>
      {disabled ? null : (
        <td>
          <IconButton onClick={() => onDelete(index)}>
            <Delete />
          </IconButton>
        </td>
      )}
    </tr>
  );
}
