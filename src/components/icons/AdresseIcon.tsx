import { IconBase, IconProps, fillStyle } from "./Icon";

export function AdresseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle style={fillStyle} cx={12} cy={11} r={3} />
      <path d="M12 21 C7 16 5 13 5 10 A7 7 0 0 1 19 10 C19 13 17 16 12 21 Z" />
      <circle cx={12} cy={11} r={3} />
    </IconBase>
  );
}
