import { DropzoneOptions, useDropzone } from "react-dropzone";
import { Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import { useRef } from "react";
import { useTranslations } from "next-intl";

export default function DragAndDropzone(
  props: Partial<Omit<DropzoneOptions, "onDrop">> & {
    name: string;
    required?: boolean;
    value?: File[];
    onChange?: (value: File[]) => void;
  }
) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations();

  const { getRootProps, getInputProps, acceptedFiles, isDragActive } =
    useDropzone({
      onDrop: (incomingFiles) => {
        if (hiddenInputRef.current) {
          // Note the specific way we need to munge the file into the hidden input
          // https://stackoverflow.com/a/68182158/1068446
          const dataTransfer = new DataTransfer();
          incomingFiles.forEach((v) => {
            dataTransfer.items.add(v);
          });
          hiddenInputRef.current.files = dataTransfer.files;
          props.onChange?.(incomingFiles);
        }
      },
      ...props,
    });

  return (
    <Grid
      {...getRootProps()}
      container
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={(theme) => ({
        padding: "16px 32px 0px 32px",
        border: isDragActive
          ? `2px dotted ${theme.palette.secondary.main}`
          : `2px dotted ${theme.palette.divider}`,
        background: isDragActive ? theme.palette.secondary.light : undefined,
        color: isDragActive ? theme.palette.secondary.contrastText : undefined,
      })}
    >
      <input
        type="file"
        name={props.name}
        ref={hiddenInputRef}
        style={{ display: "none" }}
        required={props.required}
      />
      <input {...getInputProps()} />
      <UploadFile sx={{ fontSize: 48 }} />
      <Typography component="p">{t("drag-and-dropzone.drop-here")}</Typography>
      <List>
        {(props.value ?? acceptedFiles).map((acceptedFile) => (
          <ListItem key={acceptedFile.webkitRelativePath}>
            <ListItemText primary={acceptedFile.name} />
          </ListItem>
        ))}
      </List>
    </Grid>
  );
}
