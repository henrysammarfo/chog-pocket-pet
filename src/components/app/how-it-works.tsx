"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { jarAddress } from "@/lib/config";

export function HowItWorks() {
  const jarOpen = jarAddress() !== null;
  return (
    <Dialog>
      <DialogTrigger
        data-testid="how-button"
        render={<Button type="button" variant="outline" className="font-anton h-12 rounded-full border-white/20 uppercase" />}
      >
        How this works
      </DialogTrigger>
      <DialogContent className="max-h-[80dvh] overflow-y-auto rounded-[var(--radius-24)] bg-[#071033] text-[#EFF4FF] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-anton text-2xl uppercase">How the pocket works</DialogTitle>
          <DialogDescription>The pet is the Chog. The food is money you keep.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-[#EFF4FF]/80">
          <p>Your Chog is the pet. Take the Chog away and the pocket is empty. There is no stand-in creature.</p>
          <p>
            The traits on that Chog — eyes, mouth, clothes, and the rest — choose its personality. A laser-eyed Chog gets loud when the jar is empty. A sad-mouthed Chog goes quiet. The same streak sounds different on each one.
          </p>
          <p>
            You feed it by setting $CHOG aside, once a day. The coins stay yours. You can take them back. The streak is how many days in a row you did it. Miss a day and the streak rests. The mood follows the streak, in the voice the traits picked.
          </p>
          <p>Demo mode uses made-up Chogs with real trait names from the collection, so you can try this with no wallet. On Monad, the pet is the Chog you actually hold.</p>
          <p>
            {jarOpen
              ? "The savings jar is open on Monad. Setting $CHOG aside moves the real coin, and you can take it back."
              : "The savings jar is not open on Monad in this build yet. Demo set-asides stay on this phone. A real jar keeps the same rules: your coins, your streak, your Chog."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
