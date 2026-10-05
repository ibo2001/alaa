import React from "react";
import { Composition } from "remotion";
import { Demo } from "./Demo";
import { FPS, total } from "./script";

export const Root: React.FC = () => (
  <>
    <Composition id="AlaaDemo" component={Demo} durationInFrames={total()} fps={FPS} width={1080} height={1920} defaultProps={{ landscape: false }} />
    <Composition id="AlaaDemoLandscape" component={Demo} durationInFrames={total()} fps={FPS} width={1920} height={1080} defaultProps={{ landscape: true }} />
  </>
);
