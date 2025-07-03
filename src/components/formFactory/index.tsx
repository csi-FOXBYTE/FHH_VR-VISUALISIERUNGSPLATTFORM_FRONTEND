import { Fragment, ReactNode } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export type FormFactoryModelConfigItem<Props> = {
  render(name: string, props: Props, args: UseFormReturn): ReactNode;
  valueType: unknown;
};

export type FormFactoryModelConfig = Record<
  string,
  FormFactoryModelConfigItem<unknown>
>;

export type FormFactoryStructureItem<Props> = {
  render(props: Props & { children: ReactNode }): ReactNode;
};

export type FormFactoryStructureConfig = Record<
  string,
  FormFactoryStructureItem<unknown>
>;

type FormFactoryModel<
  C extends FormFactoryModelConfig,
  Values extends FieldValues
> = {
  [P in keyof C]: {
    type: P;
    name: keyof Values;
    props: Parameters<C[P]["render"]>[1];
    dependencies?: (keyof Values)[];
    onDependenciesChange?: (form: UseFormReturn<FieldValues>) => void;
  };
}[keyof C][];

type FormFactoryStructure<
  C extends FormFactoryStructureConfig,
  Values extends FieldValues
> = {
  [P in keyof C]: {
    type: P;
    targetKey?: keyof Values;
    children?: FormFactoryStructure<C, Values>;
  };
}[keyof C][];

function recurseStructure<
  C extends FormFactoryStructureConfig,
  M extends FormFactoryModelConfig
>(
  structureConfig: C,
  structureItems: FormFactoryStructure<C, any>,
  modelConfig: M,
  modelItems: Map<string, FormFactoryModel<M, any>[number]>,
  form: UseFormReturn,
  layer = 0
) {
  return structureItems.map((structureItem, index) => {
    if (structureItem.targetKey === undefined)
      return (
        <Fragment key={`${String(structureItem.type)}_${index}_${layer}`}>
          {structureConfig[structureItem.type].render({
            children: recurseStructure(
              structureConfig,
              structureItem.children ?? [],
              modelConfig,
              modelItems,
              form,
              layer + 1
            ),
          })}
        </Fragment>
      );

    const modelItem = modelItems.get(String(structureItem.targetKey));

    const rendered = modelConfig[modelItem!.type]!.render(
      String(modelItem!.name),
      modelItem!.props,
      form
    );

    return (
      <Fragment key={`${String(structureItem.type)}_${index}_${layer}`}>
        {structureConfig[structureItem.type].render({
          children: rendered,
        })}
      </Fragment>
    );
  });
}

export function createFormFactory<
  ModelConfig extends FormFactoryModelConfig,
  StructureConfig extends FormFactoryStructureConfig
>(modelConfig: ModelConfig, structureConfig: StructureConfig) {
  return <
    Values extends FieldValues,
    Model extends FormFactoryModel<typeof modelConfig, Values>,
    Structure extends FormFactoryStructure<typeof structureConfig, Values>
  >(props: {
    model: Model;
    structure?: Structure;
    form: UseFormReturn<Values>;
  }) => {
    if (props.structure === undefined || props.structure?.length === 0)
      return props.model.map((item) => (
        <Fragment key={String(item.name)}>
          {modelConfig[item.type].render(
            String(item.name),
            item.props,
            //@ts-expect-error wrong type
            props.form
          )}
        </Fragment>
      ));

    const modelItemsMap = new Map(props.model.map((m) => [String(m.name), m]));

    return recurseStructure(
      structureConfig,
      props.structure,
      modelConfig,
      modelItemsMap,
      //@ts-expect-error wrong type
      props.form
    );
  };
}
