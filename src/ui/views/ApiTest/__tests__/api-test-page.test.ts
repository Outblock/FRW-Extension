import methods from '../openapi-methods.json';
import { createTestGroups } from '../test-groups';

interface MethodAnalysis {
  name: string;
  usesSendRequest: boolean;
  usesFetchDirectly: boolean;
  implementation: string;
  fullBody: string;
}

describe('ApiTestPage', () => {
  it('includes all OpenAPI methods that call sendRequest or fetch in testGroups', () => {
    // Create test groups with dummy params
    const dummyParams = {
      address: 'test-address',
      network: 'test-network',
      username: 'test-user',
      token: 'test-token',
      deviceInfo: {
        device_id: 'test-device',
        district: '',
        name: 'Test Device',
        type: '2',
        user_agent: 'Test',
      },
    };

    const testGroups = createTestGroups(dummyParams);

    // Get all method names from openapi-methods.json
    const methodNames = new Set(
      methods
        .filter((method) => method.usesFetchDirectly || method.usesSendRequest)
        .map((method) => method.name)
    );
    console.log('methodNames', methodNames);

    // Get all method names from testGroups
    const testGroupMethodNames = new Set(
      Object.values(testGroups)
        .flat()
        .map((func) => func.name)
    );

    // Find methods that are in openapi-methods.json but not in testGroups
    const missingMethods = [...methodNames].filter((name) => !testGroupMethodNames.has(name));

    // Find methods that are in testGroups but not in openapi-methods.json
    const extraMethods = [...testGroupMethodNames].filter((name) => !methodNames.has(name));

    if (missingMethods.length > 0) {
      console.error('Methods missing from testGroups:', missingMethods);
    }

    if (extraMethods.length > 0) {
      console.warn(
        'Extra methods in testGroups that are not in openapi-methods.json:',
        extraMethods
      );
    }

    expect(missingMethods).toEqual([]);
    expect(extraMethods).toEqual([]);
  });
});
