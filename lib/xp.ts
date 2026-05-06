export const calculateLevel = (totalXp: number) => {
  const xpPerLevel = 500;
  const level = Math.floor(totalXp / xpPerLevel) + 1;
  const currentLevelXp = totalXp % xpPerLevel;
  const nextLevelXp = xpPerLevel;
  const progress = (currentLevelXp / nextLevelXp) * 100;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress,
    totalXp
  };
};
