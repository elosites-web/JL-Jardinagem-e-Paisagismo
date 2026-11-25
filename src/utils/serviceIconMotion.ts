import type { ServiceItem } from '../data/services';

export type ServiceIconPose = {
  scale: number;
  rotate: number;
};

export const SERVICE_ICON_REST_POSE: ServiceIconPose = {
  scale: 1,
  rotate: 0,
};

export const SERVICE_ICON_HOVER_POSES: Record<ServiceItem['iconName'], ServiceIconPose> = {
  sprout: { scale: 1.15, rotate: -8 },
  route: { scale: 1.14, rotate: 6 },
  scissors: { scale: 1.16, rotate: -12 },
  compass: { scale: 1.14, rotate: 14 },
  flower2: { scale: 1.15, rotate: 8 },
  calendarCheck: { scale: 1.14, rotate: -6 },
  trees: { scale: 1.14, rotate: 6 },
  shovel: { scale: 1.15, rotate: -10 },
};

export const SERVICE_ICON_SPRING = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 18,
  mass: 0.7,
};

export function getServiceIconMotionTarget(
  iconName: ServiceItem['iconName'],
  isActive: boolean,
): ServiceIconPose {
  return isActive ? SERVICE_ICON_HOVER_POSES[iconName] : SERVICE_ICON_REST_POSE;
}
