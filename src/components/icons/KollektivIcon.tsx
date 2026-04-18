import { IconBase, IconProps, fillStyle } from "./Icon";

export function KollektivIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect style={fillStyle} x={4} y={5} width={16} height={12} rx={3} />
      <rect x={4} y={5} width={16} height={12} rx={3} />
      <circle cx={8} cy={19} r={1.5} />
      <circle cx={16} cy={19} r={1.5} />
      <path d="M4 11 H20" />
      <path d="M9 8 H15" />
    </IconBase>
  );
}
