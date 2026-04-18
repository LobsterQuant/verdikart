import { IconBase, IconProps, fillStyle } from "./Icon";

export function PdfRapportIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M6 3 H14 L18 7 V21 H6 Z" />
      <path d="M6 3 H14 L18 7 V21 H6 Z" />
      <path d="M14 3 V7 H18" />
      <path d="M9 12 H15" />
      <path d="M9 15 H15" />
      <path d="M9 18 H13" />
    </IconBase>
  );
}
