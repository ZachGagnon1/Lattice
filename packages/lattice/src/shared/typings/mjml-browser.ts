declare module "mjml-browser" {
  const transform: (
    vml: string,
    options?: {
      // beautify and minify were removed in MJML 5
      keepComments?: boolean;
      validationLevel?: "strict" | "soft" | "skip";
    },
  ) => Promise<{
    // Change the return type to a Promise
    json: MjmlBlockItem;
    html: string;
    errors: Array<{
      line: number;
      message: string;
      tagName: string;
      formattedMessage: string;
    }>;
  }>;
  export default transform;
}

interface MjmlBlockItem {
  file: string;
  absoluteFilePath: string;
  line: number;
  includedIn: any[];
  tagName: string;
  children: IChildrenItem[];
  attributes: IAttributes;
  content?: string;
}
interface IChildrenItem {
  file?: string;
  absoluteFilePath?: string;
  line: number;
  includedIn: any[];
  tagName: string;
  children?: IChildrenItem[];
  attributes: IAttributes;
  content?: string;
  inline?: "inline";
}
interface IAttributes {
  [key: string]: any;
}
