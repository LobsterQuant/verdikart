import { IconBase, IconProps, fillStyle } from "./Icon";

export function DemografiIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        style={fillStyle}
        d="M12 3 L14 8 L19 8.5 L15 12 L16 17 L12 14.5 L8 17 L9 12 L5 8.5 L10 8 Z"
      />
      <path d="M3 12 Q7 8 12 12 T21 12" />
      <path d="M3 16 Q7 13 12 16 T21 16" />
      <path d="M3 8 Q7 5 12 8 T21 8" />
    </IconBase>
  );
}
