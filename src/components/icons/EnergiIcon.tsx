import { IconBase, IconProps, fillStyle } from "./Icon";

export function EnergiIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M11 3 L6 13 H11 L9 21 L18 10 H13 Z" />
      {/* Bolt outline uses mitered joins for sharp points. */}
      <path
        strokeLinejoin="miter"
        d="M11 3 L6 13 H11 L9 21 L18 10 H13 L15 3 Z"
      />
    </IconBase>
  );
}
