import Link from "next/link";
import { Button } from "../Button";

 interface CallToActionProps {
  href: string;
  children: React.ReactNode;
}

export default function ClassPoliciesAndRuleBook({ href, children }: CallToActionProps) {
  return (
    <section className="py-4 sm:py-8 px-6 lg:px-16 text-center">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mt-4 flex justify-center">
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title="Open PDF in a new tab"
          >
            <Button>{children}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}