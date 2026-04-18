import { IconBase, IconProps, fillStyle } from "./Icon";

export function KlimarisikoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M2 15 Q5 13 8 15 T14 15 T20 15 V20 H2 Z" />
      <path d="M2 11 Q5 9 8 11 T14 11 T20 11" />
      <path d="M2 15 Q5 13 8 15 T14 15 T20 15" />
      <path d="M2 19 Q5 17 8 19 T14 19 T20 19" />
    </IconBase>
  );
}
