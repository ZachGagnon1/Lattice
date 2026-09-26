import { ImageUploader, ImageUploaderProps } from "./ImageUploader";
import { Select, SelectProps } from "./Select";
import { RadioGroup, RadioGroupProps } from "./RadioGroup";
import enhancer from "./enhancer";
import { TextInput, TextInputProps } from "./TextInput";
import { InputWithUnit, InputWithUnitProps } from "./InputWithUnit";
import { EditTab, EditTabProps } from "./EditTab";
import { EditGridTab, EditGridTabProps } from "./EditGridTab";
import { InlineText, InlineTextProps } from "./InlineTextField";
import { AutoComplete, AutoCompleteProps } from "./AutoComplete";
import { FontStack, FontStackProps } from "./FontStack";

import { NumberInput } from "@/extensions/components/Form/NumberInput";
import {
  SwitchInput,
  SwitchInputProps,
} from "@/extensions/components/Form/SwitchInput";
import { TextAreaInput } from "@/extensions/components/Form/TextAreaInput";
import { SearchInput, SearchInputProps } from "./SearchInput";

export { RichTextField } from "./RichTextField";
export { ColorPickerField } from "./ColorPickerField";

export interface NumberFieldAdapterProps extends Omit<
  React.ComponentProps<typeof NumberInput>,
  "value" | "onValueChange" | "onChange"
> {
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  name?: string;
  max?: number;
  min?: number;
  step?: number;
}

const NumberFieldAdapter = (props: NumberFieldAdapterProps) => {
  const { onChange, value, ...rest } = props;

  const numericValue =
    value === "" || value === undefined || value === null
      ? null
      : Number(value);

  return (
    <NumberInput
      {...rest}
      value={numericValue}
      onValueChange={(val: number | null) => {
        if (onChange) {
          onChange(val === null || Number.isNaN(val) ? "" : String(val));
        }
      }}
    />
  );
};

export const TextField = enhancer<TextInputProps>(TextInput, (value) => value);

export const InputWithUnitField = enhancer<InputWithUnitProps>(
  InputWithUnit,
  (value) => value,
);

export const SearchField = enhancer<SearchInputProps>(
  SearchInput,
  (val) => val,
);

export const TextAreaField = enhancer<TextInputProps>(
  TextAreaInput,
  (val) => val,
);

export const NumberField = enhancer<NumberFieldAdapterProps>(
  NumberFieldAdapter,
  (val) => val,
);

export const ImageUploaderField = enhancer<ImageUploaderProps>(
  ImageUploader,
  (url) => url,
);

export const SelectField = enhancer<SelectProps>(Select, (e) => e);

export const AutoCompleteField = enhancer<AutoCompleteProps>(
  AutoComplete,
  (e) => e,
);

export const FontStackField = enhancer<FontStackProps>(FontStack, (e) => e);

export const RadioGroupField = enhancer<RadioGroupProps>(
  RadioGroup,
  (value) => value,
);

export const SwitchField = enhancer<SwitchInputProps>(SwitchInput, (e) => e);

export const EditTabField = enhancer<EditTabProps<any>>(
  EditTab,
  (e: any[]) => e,
);
export const EditGridTabField = enhancer<EditGridTabProps<any>>(
  EditGridTab,
  (e: any[]) => e,
);

export const InlineTextField = enhancer<InlineTextProps>(
  InlineText,
  (value) => value,
);

export { enhancer };
