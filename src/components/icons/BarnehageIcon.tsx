import { IconBase, IconProps, fillStyle } from "./Icon";

export function BarnehageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M4 20 V11 L12 6 L20 11 V20 Z" />
      <path d="M2 12 L12 6 L22 12" />
      <path d="M4 20 V12 H20 V20" />
      <path d="M3 20 H21" />
      <circle cx={9} cy={16} r={1} />
      <circle cx={15} cy={16} r={1} />
      <path d="M9 17 Q12 19 15 17" />
    </IconBase>
  );
}
