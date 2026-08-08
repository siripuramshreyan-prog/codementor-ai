import type { BadgeDefinition, UserStats } from './database.types';

export interface DerivedBadge extends BadgeDefinition {
  unlocked: boolean;
  progress: number; // 0-1
}

export function deriveBadges(
  definitions: BadgeDefinition[],
  stats: UserStats,
  longestStreakDays: number
): DerivedBadge[] {
  return definitions.map((def) => {
    let current = 0;
    switch (def.requirement_type) {
      case 'accepted_count':
        current = stats.accepted_count;
        break;
      case 'streak_days':
        current = longestStreakDays;
        break;
      case 'hard_solved':
        current = stats.hard_solved;
        break;
      case 'acceptance_rate':
        // Accuracy badges only make sense once there's a meaningful sample size.
        current = stats.total_submissions >= 10 ? stats.acceptance_rate : 0;
        break;
    }

    return {
      ...def,
      unlocked: current >= def.requirement_value,
      progress: Math.min(1, current / def.requirement_value),
    };
  });
}
