type CustomTooltipPayload = {
  value: number;
  name: string;
  color: string;
};

export type CustomTooltipProps = {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string;
};