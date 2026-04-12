declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module 'mockjs';

declare module 'react-intl' {
  import * as React from 'react';

  export interface IntlShape {
    formatMessage: (
      descriptor: { id: string; defaultMessage?: string },
      values?: Record<string, React.ReactNode>,
    ) => string;
  }

  export interface MessageDescriptor {
    id: string | number;
    defaultMessage?: string;
    description?: string | object;
  }

  export interface Props<
    V extends Record<string, any> = Record<string, React.ReactNode>,
  > extends MessageDescriptor {
    values?: V;
    tagName?: React.ElementType<any>;
    children?(...nodes: React.ReactNodeArray): React.ReactNode;
  }

  declare class FormattedMessage<
    V extends Record<string, any> = Record<string, React.ReactNode>,
  > extends React.Component<Props<V>> {
    static displayName: string;
    static defaultProps: {
      values: {};
    };
    shouldComponentUpdate(nextProps: Props<V>): boolean;
    render(): React.ReactElement | null;
  }

  export default FormattedMessage;
}
