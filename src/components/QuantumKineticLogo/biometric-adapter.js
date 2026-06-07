/**
 * Biometric Adapter
 * Interface for connecting biometric sensors to the Impjieg logo system
 */

class BiometricAdapter {
  constructor() {
    this.sensors = new Map();
    this.dataStreams = new Map();
    this.isSupported = this.checkBiometricSupport();
    this.isActive = false;
    this.callbacks = new Set();
  }
  
  /**
   * Check if biometric sensors are supported
   */
  checkBiometricSupport() {
    // Check for Web Serial API support
    const serialSupport = typeof navigator !== 'undefined' && navigator.serial;
    
    // Check for Web Bluetooth support
    const bluetoothSupport = typeof navigator !== 'undefined' && navigator.bluetooth;
    
    // Check for WebUSB support
    const usbSupport = typeof navigator !== 'undefined' && navigator.usb;
    
    return {
      serial: !!serialSupport,
      bluetooth: !!bluetoothSupport,
      usb: !!usbSupport,
      webapi: !!(serialSupport || bluetoothSupport || usbSupport)
    };
  }
  
  /**
   * Initialize biometric system
   */
  async init() {
    if (!this.isSupported.webapi) {
      console.warn('No biometric sensor support detected');
      return false;
    }
    
    try {
      // Request permissions for available sensors
      await this.requestSensorPermissions();
      this.isActive = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize biometric system:', error);
      return false;
    }
  }
  
  /**
   * Request sensor permissions
   */
  async requestSensorPermissions() {
    // This would request permissions for specific sensors
    // Implementation depends on available APIs
  }
  
  /**
   * Connect to EEG sensor
   */
  async connectEEG() {
    if (!this.isSupported.serial) {
      throw new Error('Serial API not supported');
    }
    
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      const sensor = {
        id: 'eeg-sensor',
        type: 'eeg',
        port,
        connected: true,
        data: []
      };
      
      this.sensors.set('eeg', sensor);
      this.startDataStream(sensor);
      
      return sensor;
    } catch (error) {
      console.error('Failed to connect EEG sensor:', error);
      throw error;
    }
  }
  
  /**
   * Connect to eye tracker
   */
  async connectEyeTracker() {
    if (!this.isSupported.bluetooth) {
      throw new Error('Bluetooth API not supported');
    }
    
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['eye-tracking-service'] }]
      });
      
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('eye-tracking-service');
      const characteristic = await service.getCharacteristic('eye-data');
      
      const sensor = {
        id: 'eye-tracker',
        type: 'eye',
        device,
        server,
        service,
        characteristic,
        connected: true,
        data: []
      };
      
      this.sensors.set('eye', sensor);
      this.startDataStream(sensor);
      
      return sensor;
    } catch (error) {
      console.error('Failed to connect eye tracker:', error);
      throw error;
    }
  }
  
  /**
   * Connect to heart rate monitor
   */
  async connectHeartRate() {
    if (!this.isSupported.bluetooth) {
      throw new Error('Bluetooth API not supported');
    }
    
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });
      
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      const sensor = {
        id: 'heart-rate',
        type: 'heart',
        device,
        server,
        service,
        characteristic,
        connected: true,
        data: []
      };
      
      this.sensors.set('heart', sensor);
      this.startDataStream(sensor);
      
      return sensor;
    } catch (error) {
      console.error('Failed to connect heart rate monitor:', error);
      throw error;
    }
  }
  
  /**
   * Start data stream from sensor
   */
  startDataStream(sensor) {
    if (!sensor.characteristic) return;
    
    const onData = (event) => {
      const value = event.target.value;
      const data = this.parseSensorData(sensor.type, value);
      
      sensor.data.push(data);
      
      // Limit data buffer size
      if (sensor.data.length > 1000) {
        sensor.data.shift();
      }
      
      // Notify callbacks
      this.notifyCallbacks(sensor.type, data);
    };
    
    sensor.characteristic.addEventListener('characteristicvaluechanged', onData);
    sensor.characteristic.startNotifications();
    
    this.dataStreams.set(sensor.id, onData);
  }
  
  /**
   * Parse sensor data based on type
   */
  parseSensorData(type, value) {
    switch (type) {
      case 'eeg':
        return this.parseEEGData(value);
      case 'eye':
        return this.parseEyeData(value);
      case 'heart':
        return this.parseHeartData(value);
      default:
        return { raw: value, timestamp: Date.now() };
    }
  }
  
  /**
   * Parse EEG data
   */
  parseEEGData(value) {
    // Convert DataView to EEG readings
    const data = [];
    for (let i = 0; i < value.byteLength; i += 4) {
      data.push(value.getFloat32(i, true));
    }
    
    return {
      type: 'eeg',
      channels: data,
      timestamp: Date.now(),
      attention: this.calculateAttention(data),
      meditation: this.calculateMeditation(data)
    };
  }
  
  /**
   * Parse eye tracking data
   */
  parseEyeData(value) {
    // Extract x, y coordinates and blink data
    const x = value.getUint16(0, true);
    const y = value.getUint16(2, true);
    const blink = value.getUint8(4);
    
    return {
      type: 'eye',
      x,
      y,
      blink: !!blink,
      timestamp: Date.now(),
      focus: this.calculateFocus(x, y)
    };
  }
  
  /**
   * Parse heart rate data
   */
  parseHeartData(value) {
    // Heart rate measurement format
    const flags = value.getUint8(0);
    const isUint16 = flags & 0x1;
    const heartRate = isUint16 ? value.getUint16(1, true) : value.getUint8(1);
    
    return {
      type: 'heart',
      bpm: heartRate,
      timestamp: Date.now(),
      stress: this.calculateStress(heartRate)
    };
  }
  
  /**
   * Calculate attention from EEG data
   */
  calculateAttention(eegChannels) {
    // Simplified attention calculation
    // In reality, this would use complex signal processing
    const alpha = eegChannels[0] || 0;
    const beta = eegChannels[1] || 0;
    
    // Attention is higher beta/alpha ratio
    const attention = Math.min(1, beta / (alpha + 0.1));
    return attention;
  }
  
  /**
   * Calculate meditation from EEG data
   */
  calculateMeditation(eegChannels) {
    // Simplified meditation calculation
    const theta = eegChannels[2] || 0;
    const alpha = eegChannels[0] || 0;
    
    // Meditation is higher theta/alpha ratio
    const meditation = Math.min(1, theta / (alpha + 0.1));
    return meditation;
  }
  
  /**
   * Calculate focus from eye tracking data
   */
  calculateFocus(x, y) {
    // Simplified focus calculation based on gaze stability
    // In reality, this would analyze fixation patterns
    const centerX = 500; // Assuming 1000x1000 screen
    const centerY = 500;
    
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const focus = Math.max(0, 1 - distance / 500);
    
    return focus;
  }
  
  /**
   * Calculate stress from heart rate
   */
  calculateStress(heartRate) {
    // Simplified stress calculation
    // Normal resting HR is 60-100 BPM
    const normalized = (heartRate - 60) / 40;
    const stress = Math.max(0, Math.min(1, normalized));
    
    return stress;
  }
  
  /**
   * Add callback for sensor data
   */
  addCallback(callback) {
    this.callbacks.add(callback);
  }
  
  /**
   * Remove callback
   */
  removeCallback(callback) {
    this.callbacks.delete(callback);
  }
  
  /**
   * Notify callbacks of new data
   */
  notifyCallbacks(sensorType, data) {
    for (const callback of this.callbacks) {
      try {
        callback(sensorType, data);
      } catch (error) {
        console.error('Callback error:', error);
      }
    }
  }
  
  /**
   * Get current biometric state
   */
  getCurrentState() {
    const state = {};
    
    for (const [type, sensor] of this.sensors) {
      if (sensor.data.length > 0) {
        state[type] = sensor.data[sensor.data.length - 1];
      }
    }
    
    return state;
  }
  
  /**
   * Disconnect all sensors
   */
  async disconnectAll() {
    for (const [type, sensor] of this.sensors) {
      try {
        if (sensor.port) {
          await sensor.port.close();
        } else if (sensor.device) {
          await sensor.device.gatt.disconnect();
        }
        sensor.connected = false;
      } catch (error) {
        console.error(`Failed to disconnect ${type} sensor:`, error);
      }
    }
    
    this.sensors.clear();
    this.dataStreams.clear();
    this.isActive = false;
  }
}

// Export singleton instance
export const biometricAdapter = new BiometricAdapter();

// Export utility functions
export const createBiometricResponse = (sensorData) => {
  // Create response based on biometric data
  const response = {
    scale: 1.0,
    rotation: 0,
    opacity: 1.0,
    colorShift: 0
  };
  
  // Adjust based on different sensor types
  if (sensorData.eeg) {
    response.scale = 1.0 + sensorData.eeg.attention * 0.2;
    response.colorShift = sensorData.eeg.meditation * 30;
  }
  
  if (sensorData.eye) {
    response.rotation = (sensorData.eye.x - 500) / 1000 * Math.PI;
    response.opacity = 0.5 + sensorData.eye.focus * 0.5;
  }
  
  if (sensorData.heart) {
    response.scale = 1.0 + sensorData.heart.stress * 0.3;
  }
  
  return response;
};
