export default function CreateLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <section className="flex flex-col items-center flex-1">{children}</section>;
  }
  