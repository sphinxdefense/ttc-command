import { Status, Category, Priority, Mode } from '../types';

// TODO: create types for all data options and add to readme schema
type DataOptions = {
  categories: Category[];
  errorTypes: string[];
  equipments: string[];
  grounds: string[];
  resolutions: string[];
  resolutionStatuses: string[];
  states: string[];
  statuses: Status[];
  steps: string[];
  subsystems: string[];
  childSubSystems: string[];
  assemblyDevices: string[];
  units: string[];
  priorities: Priority[];
  modes: Mode[];
};

const options: DataOptions = {
  categories: ['software', 'spacecraft', 'hardware'],
  errorTypes: [
    'Offline',
    'Degraded',
    'Solar panel misalignment',
    'SARM failure',
    'Power degradation',
    'Weak signal',
    'Memory limit reached',
    'Out of disk space',
    'Limited disk space',
    'NOLOCK',
  ],
  equipments: [
    'ANT',
    'BAFB',
    'RVC',
    'SLWS',
    'USP',
    'VAFB',
    'WS',
    'WSB',
    'SFEP',
    'ECEU',
  ],
  grounds: ['CTS', 'DGS', 'GTS', 'TCS', 'VTS', 'NHS', 'TTS', 'HTS'],
  resolutions: ['complete', 'failed', 'pass', 'prepass', 'scheduled'],
  resolutionStatuses: ['normal', 'critical', 'off', 'standby'],
  states: ['upcoming', 'executing', 'complete', 'failed'],
  statuses: ['caution', 'critical', 'normal', 'off', 'serious', 'standby'],
  steps: [
    'AOS',
    'Command',
    'Configure Operation',
    'Critical Health',
    'DCC',
    'Downlink',
    'Lock',
    'LOS',
    'SARM',
    'Uplink',
  ],
  subsystems: [
    'Attitude',
    'Payload',
    'Power',
    'Propulsion',
    'Thermal',
    'Electrical',
    'Structure',
  ],
  childSubSystems: [
    'Star Tracker',
    'Earth Sensors',
    'Reaction Wheels',
    'Sun Sensors',
    'Transponders',
    'Antenna Control',
    'Telemetry',
    'Battery',
  ],
  assemblyDevices: [
    'Lens',
    'Baffle',
    'Detection Module',
    'Detector',
    'Thermo-Electric Cooler',
    'Electronics',
    'Local Oscillator',
    'Frequency Converter',
    'Transmitter',
    'Receiver',
  ],
  units: ['Volts', 'Deg'],
  priorities: ['Low', 'Medium', 'High'],
  modes: ['Full Automation', 'Semi-Automation', 'Manual'],
};

export default options;
