import { IconBase, IconProps, fillStyle } from "./Icon";

export function LuftkvalitetIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle style={fillStyle} cx={12} cy={12} r={4} />
      <circle cx={12} cy={12} r={4} />
      <path d="M12 3 V5 M12 19 V21 M3 12 H5 M19 12 H21" />
      <path d="M5.6 5.6 L7 7 M17 17 L18.4 18.4 M5.6 18.4 L7 17 M17 7 L18.4 5.6" />
    </IconBase>
  );
}
