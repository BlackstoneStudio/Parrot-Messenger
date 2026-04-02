import { createTransportPlugin } from '../../src/core/plugin';
import TransportRegistry from '../../src/registry/TransportRegistry';

describe('createTransportPlugin', () => {
  let registry: TransportRegistry;

  class TestTransport {}

  beforeEach(() => {
    registry = TransportRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    registry.reset();
  });

  it('auto-registers the transport by default', () => {
    const plugin = createTransportPlugin('testPlugin', TestTransport);

    expect(plugin).toEqual({
      name: 'testPlugin',
      Transport: TestTransport,
    });
    expect(registry.get('testPlugin')).toBe(TestTransport);
  });

  it('supports skipping registration for manual setup', () => {
    const plugin = createTransportPlugin('manualPlugin', TestTransport, {
      autoRegister: false,
    });

    expect(plugin).toEqual({
      name: 'manualPlugin',
      Transport: TestTransport,
    });
    expect(registry.has('manualPlugin')).toBe(false);
  });
});
