import { IconBase, IconProps, fillStyle } from "./Icon";

export function PrisstatistikkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        style={fillStyle}
        d="M4 20 V12 L8 14 V20 Z M10 20 V8 L14 10 V20 Z M16 20 V4 L20 6 V20 Z"
      />
      <path d="M4 20 V12 L8 14 V20" />
      <path d="M10 20 V8 L14 10 V20" />
      <path d="M16 20 V4 L20 6 V20" />
      <path d="M3 20 H21" />
    </IconBase>
  );
}
