import { IconBase, IconProps, fillStyle } from "./Icon";

export function ManedskostnadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle style={fillStyle} cx={12} cy={12} r={8} />
      <circle cx={12} cy={12} r={8} />
      <path d="M12 8 V12 L14.5 14" />
      <path d="M12 4 V6" />
    </IconBase>
  );
}
