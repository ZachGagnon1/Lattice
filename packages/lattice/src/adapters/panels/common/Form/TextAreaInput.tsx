import {
  TextInput,
  TextInputProps,
} from "@/adapters/panels/common/Form/TextInput";

export function TextAreaInput(props: TextInputProps) {
  return <TextInput {...props} multiline minRows={3} />;
}
