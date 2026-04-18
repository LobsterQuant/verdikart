import { IconBase, IconProps, fillStyle } from "./Icon";

export function PrisutviklingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M3 20 L9 14 L13 17 L21 9 V20 Z" />
      <path d="M3 20 H21" />
      <path d="M3 16 L9 10 L13 13 L21 5" />
      <circle cx={9} cy={10} r={1} />
      <circle cx={13} cy={13} r={1} />
      <circle cx={21} cy={5} r={1} />
    </IconBase>
  );
}
