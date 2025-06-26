// Mock implementation of Telnyx for testing
class MockTelnyx {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.messages = {
      create: jest.fn().mockResolvedValue({ id: 'mock-message-id' }),
    };
  }
}

module.exports = MockTelnyx;
