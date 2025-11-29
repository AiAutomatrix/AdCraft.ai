import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <path d="m12 3-2 5h4l-2-5Z" />
      <path d="M12 3v1" />
      <path d="M19.42 7.58a7.07 7.07 0 0 0-1.03-3.08" />
      <path d="M17.5 13a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5Z" />
      <path d="M19 9a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5Z" />
      <path d="M4.58 7.58a7.07 7.07 0 0 1 1.03-3.08" />
      <path d="M6.5 13a.5.5 0 0 0 .5.5.5.5 0 0 0 .5-.5.5.5 0 0 0-.5-.5.5.5 0 0 0-.5.5Z" />
      <path d="M5 9a.5.5 0 0 0 .5.5.5.5 0 0 0 .5-.5.5.5 0 0 0-.5-.5.5.5 0 0 0-.5.5Z" />
      <path d="M12 14.5c-3 0-5.5 2.5-5.5 5.5v0c0 .8.7 1.5 1.5 1.5h8c.8 0 1.5-.7 1.5-1.5v0c0-3-2.5-5.5-5.5-5.5Z" />
    </svg>
  );
  