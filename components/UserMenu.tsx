import { signOut } from "@/auth";
import { Button } from "@/components/ui/Button";

type Props = {
  name?: string | null;
  image?: string | null;
};

export function UserMenu({ name, image }: Props) {
  return (
    <div className="flex items-center gap-3">
      {image ? (
        // Google avatar — external & frequently rotated, so a plain <img> is fine.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="h-9 w-9 rounded-full object-cover ring-2 ring-white/80"
        />
      ) : (
        <div className="bg-lavender text-cocoa flex h-9 w-9 items-center justify-center rounded-full font-semibold">
          {name?.[0]?.toUpperCase() ?? "🙂"}
        </div>
      )}
      <span className="text-cocoa hidden text-sm font-semibold sm:block">
        {name ?? "Friend"}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="soft" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}
