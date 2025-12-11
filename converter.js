function deviceParams2base(deviceParams) {
  const base = {
    'ffb-reverse': deviceParams.gameForceFeedbackReversal ? 1 : 0,
    'ffb-strength': deviceParams.gameForceFeedbackStrength * 10,
    'max-angle': deviceParams.maximumSteeringAngle,

    // Steering Wheel Intertia. Not saved in MOZA presets file
    // 'natural-inertia': 0,

    protection: deviceParams.safeDrivingEnabled ? 1 : 0,
    'protection-mode': deviceParams.safeDrivingMode,

    // Doesn't really matter, it only affects the equalizers in the app. Not saved in MOZA presets file
    // 'road-sensitivity': 0,

    'soft-limit-retain': deviceParams.softLimitGameForceStrength,
    'soft-limit-stiffness': deviceParams.softLimitStiffness,
    'soft-limit-strength': deviceParams.softLimitStrength,

    'speed-damping': deviceParams.speedDependentDamping,
    'speed-damping-point': deviceParams.initialSpeedDependentDamping || 0,

    equalizer1: deviceParams.equalizerGain1,
    equalizer2: deviceParams.equalizerGain2,
    equalizer3: deviceParams.equalizerGain3,
    equalizer4: deviceParams.equalizerGain4,
    equalizer5: deviceParams.equalizerGain5,
    equalizer6: deviceParams.equalizerGain6,

    damper: deviceParams.mechanicalDamper * 10,
    friction: deviceParams.mechanicalFriction * 10,

    // Natural Intertia
    inertia: deviceParams.naturalInertiaV2 * 10,

    spring: deviceParams.mechanicalSpringStrength * 10,
    speed: deviceParams.maximumSteeringSpeed * 10,

    limit: deviceParams.maximumSteeringAngle || deviceParams.maximumGameSteeringAngle,
    torque: deviceParams.maximumTorque,
  };

  const curve = Array.from(deviceParams.forceFeedbackMaping, (c) => c.charCodeAt(0));

  if (curve.length >= 10) {
    // These two are always 0:0
    // base['ffb-curve-x0'] = curve[0];
    // base['ffb-curve-y0'] = curve[1];

    base['ffb-curve-x1'] = curve[2];
    base['ffb-curve-y1'] = curve[3];

    // x2-x5 are not used by Boxflat
    // base['ffb-curve-x2'] = curve[4];
    base['ffb-curve-y2'] = curve[5];

    // base['ffb-curve-x3'] = curve[6];
    base['ffb-curve-y3'] = curve[7];

    // base['ffb-curve-x4'] = curve[8];
    base['ffb-curve-y4'] = curve[9];

    // base['ffb-curve-x5'] = curve[10] || 100; // The last X is always 0
    base['ffb-curve-y5'] = curve[11];
  } else {
    throw new Error('deviceParams.forceFeedbackMaping has insufficient length');
  }

  return base;
}

function deviceParams2main(deviceParams) {
  return {
    'set-damper-gain': Math.min(Math.round(2.55 * deviceParams.setGameDampingValue), 255),
    'set-friction-gain': Math.min(Math.round(2.55 * deviceParams.setGameFrictionValue), 255),

    // Game Inertia
    'set-inertia-gain': Math.min(Math.round(2.55 * deviceParams.setGameInertiaValue), 255),

    'set-spring-gain': Math.min(Math.round(2.55 * deviceParams.setGameSpringValue), 255),
    'set-interpolation': deviceParams.constForceExtraMode,
  };
}
