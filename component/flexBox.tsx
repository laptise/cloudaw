interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

export function FlexCol(props: Props) {
  return <div data-component="flexCol" {...props}></div>;
}

export function FlexRow(props: Props) {
  return <div data-component="flexRow" {...props}></div>;
}
