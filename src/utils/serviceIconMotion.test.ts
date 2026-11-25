import test from 'node:test';
import assert from 'node:assert/strict';
import { SERVICES_LIST } from '../data/services';
import {
  SERVICE_ICON_HOVER_POSES,
  SERVICE_ICON_REST_POSE,
  getServiceIconMotionTarget,
} from './serviceIconMotion';

test('getServiceIconMotionTarget returns neutral rest pose when inactive', () => {
  for (const service of SERVICES_LIST) {
    assert.deepEqual(
      getServiceIconMotionTarget(service.iconName, false),
      SERVICE_ICON_REST_POSE,
    );
  }
});

test('every service icon defines a subtle hover scale and non-zero rotation', () => {
  for (const service of SERVICES_LIST) {
    const activePose = getServiceIconMotionTarget(service.iconName, true);
    assert.deepEqual(activePose, SERVICE_ICON_HOVER_POSES[service.iconName]);
    assert.ok(activePose.scale > 1.05 && activePose.scale <= 1.25);
    assert.ok(Math.abs(activePose.rotate) >= 4 && Math.abs(activePose.rotate) <= 18);
  }
});
