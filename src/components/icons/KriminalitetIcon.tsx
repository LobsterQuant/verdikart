import { IconBase, IconProps, fillStyle } from "./Icon";

export function KriminalitetIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        style={fillStyle}
        d="M12 3 L20 6 V12 Q20 17 12 21 Q4 17 4 12 V6 Z"
      />
      <path d="M12 3 L20 6 V12 Q20 17 12 21 Q4 17 4 12 V6 Z" />
      <path d="M9 12 L11 14 L15 10" />
    </IconBase>
  );
}
