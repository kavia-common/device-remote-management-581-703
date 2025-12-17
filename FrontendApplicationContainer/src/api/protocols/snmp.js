import api, { isMockMode } from '../client';

/**
 * SNMP Protocol API module
 * Handles SNMP v2/v3 operations: GET, SET, WALK
 */

// PUBLIC_INTERFACE
export async function snmpGet({ deviceId, oid, version = 'v2c', community = 'public' }) {
  /**
   * Perform SNMP GET operation
   * @param {Object} params - SNMP GET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.oid - Object Identifier
   * @param {string} params.version - SNMP version (v2c, v3)
   * @param {string} params.community - Community string (for v2c)
   * @returns {Promise<Object>} SNMP GET result
   */
  if (isMockMode()) {
    return {
      success: true,
      oid,
      value: '192.168.1.1',
      type: 'IpAddress',
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/snmp/get', {
    deviceId,
    oid,
    version,
    community,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function snmpSet({ deviceId, oid, value, valueType, version = 'v2c', community = 'private' }) {
  /**
   * Perform SNMP SET operation
   * @param {Object} params - SNMP SET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.oid - Object Identifier
   * @param {string} params.value - Value to set
   * @param {string} params.valueType - Value type (Integer, String, IpAddress, etc.)
   * @param {string} params.version - SNMP version
   * @param {string} params.community - Community string
   * @returns {Promise<Object>} SNMP SET result
   */
  if (isMockMode()) {
    return {
      success: true,
      oid,
      previousValue: '192.168.1.1',
      newValue: value,
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/snmp/set', {
    deviceId,
    oid,
    value,
    valueType,
    version,
    community,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function snmpWalk({ deviceId, oid, version = 'v2c', community = 'public', maxRepetitions = 25 }) {
  /**
   * Perform SNMP WALK operation
   * @param {Object} params - SNMP WALK parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string} params.oid - Starting Object Identifier
   * @param {string} params.version - SNMP version
   * @param {string} params.community - Community string
   * @param {number} params.maxRepetitions - Maximum repetitions for BULK requests
   * @returns {Promise<Object>} SNMP WALK result with array of OID-value pairs
   */
  if (isMockMode()) {
    return {
      success: true,
      oid,
      results: [
        { oid: `${oid}.1`, value: '100', type: 'Counter32' },
        { oid: `${oid}.2`, value: '200', type: 'Counter32' },
        { oid: `${oid}.3`, value: '300', type: 'Counter32' },
      ],
      count: 3,
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/snmp/walk', {
    deviceId,
    oid,
    version,
    community,
    maxRepetitions,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function snmpBulkGet({ deviceId, oids, version = 'v2c', community = 'public' }) {
  /**
   * Perform SNMP BULK GET operation
   * @param {Object} params - SNMP BULK GET parameters
   * @param {string} params.deviceId - Target device ID
   * @param {string[]} params.oids - Array of Object Identifiers
   * @param {string} params.version - SNMP version
   * @param {string} params.community - Community string
   * @returns {Promise<Object>} SNMP BULK GET results
   */
  if (isMockMode()) {
    return {
      success: true,
      results: oids.map(oid => ({
        oid,
        value: 'mock-value',
        type: 'OctetString',
      })),
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/protocols/snmp/bulk-get', {
    deviceId,
    oids,
    version,
    community,
  });
  return data;
}
