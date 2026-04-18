import { IconBase, IconProps, fillStyle } from "./Icon";

export function VerdiestimatIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M12 2 L20 7 V17 L12 22 L4 17 V7 Z" />
      <path d="M12 2 L20 7 V17 L12 22 L4 17 V7 Z" />
      <path d="M8 10.5 L12 13 L16 10.5" />
      <path d="M12 13 V17.5" />
    </IconBase>
  );
}
