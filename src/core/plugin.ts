import TransportRegistry from '../registry/TransportRegistry';

export interface TransportPlugin {
  name: string;
  Transport: new (settings: any) => any;
}

export interface PluginOptions {
  autoRegister?: boolean;
}

export function createTransportPlugin(
  name: string,
  Transport: new (settings: any) => any,
  options: PluginOptions = { autoRegister: true },
): TransportPlugin {
  const plugin = { name, Transport };

  if (options.autoRegister) {
    const registry = TransportRegistry.getInstance();
    registry.register(name, Transport);
  }

  return plugin;
}
