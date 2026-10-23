import { ArcadePlay } from "@/components/arcade/arcade-play";
import { AppProviders } from "@/components/app/providers";
import { ARCADE_GAMES } from "@/lib/arcade";

export const instant = false;

export function generateStaticParams() {
  return ARCADE_GAMES.map((game) => ({ game: game.id }));
}

export default async function ArcadeGamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  return (
    <AppProviders>
      <ArcadePlay id={game} />
    </AppProviders>
  );
}
