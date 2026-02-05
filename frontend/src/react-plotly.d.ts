declare module 'react-plotly.js' {
  import * as React from 'react';
  import { PlotData, Layout, Config, Frame } from 'plotly.js';
  
  export interface PlotParams {
    data: Partial<PlotData>[];
    layout?: Partial<Layout>;
    frames?: Partial<Frame>[];
    config?: Partial<Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => void;
    onUpdate?: (figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => void;
    onPurge?: (figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => void;
    onError?: (err: Readonly<Error>) => void;
    divId?: string;
    revision?: number;
    debug?: boolean;
  }

  export interface Figure {
    data: Partial<PlotData>[];
    layout: Partial<Layout>;
    frames: Partial<Frame>[];
  }

  export default class Plot extends React.Component<PlotParams> {}
}