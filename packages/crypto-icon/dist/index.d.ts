interface Props extends React.SVGProps<SVGSVGElement> {
    id: string;
    size?: number;
    fallbackId?: string;
}
declare const CustomIcon: ({ id, size, fallbackId, ...props }: Props) => JSX.Element | null;
declare const CryptoIcon: ({ symbol, size, ...props }: Omit<Props, "id"> & {
    symbol: string;
}) => JSX.Element;

export { CryptoIcon, CustomIcon };
