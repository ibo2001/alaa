import { PageTransition } from "@/components/PageTransition";

// A template (unlike a layout) re-mounts on every navigation, so each page gets its entrance motion.
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
