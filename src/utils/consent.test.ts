import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptAllConsent,
  canExecuteAnalytics,
  canExecuteMarketing,
  DEFAULT_CONSENT_PREFERENCES,
  hasActiveNonEssentialTracking,
  rejectNonEssentialConsent,
} from './consent';

test('non-essential tracking remains disabled when config is disabled', () => {
  const disabledConfig = {
    googleAnalyticsId: 'G-TEST123',
    googleTagManagerId: '',
    metaPixelId: '123456',
    enabled: false,
  };
  assert.equal(hasActiveNonEssentialTracking(disabledConfig), false);
  const allAccepted = acceptAllConsent('2026-11-24T12:00:00Z');
  assert.equal(canExecuteAnalytics(disabledConfig, allAccepted), false);
  assert.equal(canExecuteMarketing(disabledConfig, allAccepted), false);
});

test('non-essential tracking requires explicit consent even when enabled', () => {
  const enabledConfig = {
    googleAnalyticsId: 'G-TEST123',
    googleTagManagerId: '',
    metaPixelId: '123456',
    enabled: true,
  };
  assert.equal(hasActiveNonEssentialTracking(enabledConfig), true);
  assert.equal(canExecuteAnalytics(enabledConfig, DEFAULT_CONSENT_PREFERENCES), false);
  assert.equal(canExecuteMarketing(enabledConfig, DEFAULT_CONSENT_PREFERENCES), false);

  const rejected = rejectNonEssentialConsent('2026-11-24T12:00:00Z');
  assert.equal(canExecuteAnalytics(enabledConfig, rejected), false);
  assert.equal(canExecuteMarketing(enabledConfig, rejected), false);

  const accepted = acceptAllConsent('2026-11-24T12:00:00Z');
  assert.equal(canExecuteAnalytics(enabledConfig, accepted), true);
  assert.equal(canExecuteMarketing(enabledConfig, accepted), true);
});
