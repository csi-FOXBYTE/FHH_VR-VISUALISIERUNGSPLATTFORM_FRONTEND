import { ReactNode } from "react";
import {
  FieldValues,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";

export default function DynamicForm<Data extends FieldValues>({
  children,
  ...props
}: UseFormProps<Data> & {
  children: (form: UseFormReturn<Data>) => ReactNode;
}) {
  const form = useForm(props);

  return children(form);
}
