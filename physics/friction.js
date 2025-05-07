// friction.js
import { getFriction } from "../constants.js";

export function calcFriction(normalForce, velX, velY, isStatic) {
  // grab [Stribeck, μs, μk] fresh each call
  const [stribeck, muS, muK] = getFriction();
  const speed = Math.hypot(velX, velY);

  // if it's basically not moving or static, no friction force
  if (isStatic || speed < 1e-3) {
    return { x: 0, y: 0 };
  }

  // dynamic (Stribeck) friction coefficient
  const mu = muK + (muS - muK) * Math.exp(-speed / stribeck);
  const frictionMag = mu * normalForce;

  // return a force vector opposite to velocity
  return {
    x: -frictionMag * (velX / speed),
    y: -frictionMag * (velY / speed)
  };
}