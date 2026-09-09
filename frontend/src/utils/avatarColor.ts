const palettes = [
  'from-rose-400 to-orange-400',
  'from-amber-400 to-yellow-500',
  'from-lime-400 to-emerald-500',
  'from-emerald-400 to-teal-500',
  'from-cyan-400 to-sky-500',
  'from-blue-400 to-indigo-500',
  'from-indigo-400 to-violet-500',
  'from-violet-400 to-purple-500',
  'from-fuchsia-400 to-pink-500',
  'from-pink-400 to-rose-500',
];

export function avatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}